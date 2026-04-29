const express = require('express');
const router = express.Router();
const Relationship = require('../models/Relationship');
const Contact = require('../models/Contact');

// Get all relationships
router.get('/', async (req, res) => {
  try {
    const { contactId, isReferral, status, page = 1, limit = 50 } = req.query;

    const query = {};

    if (contactId) {
      query.$or = [
        { contactA: contactId },
        { contactB: contactId }
      ];
    }

    if (isReferral !== undefined) {
      query.isReferralRelationship = isReferral === 'true';
    }

    if (status) {
      query.status = status;
    }

    const relationships = await Relationship.find(query)
      .populate('contactA contactB referrer referred')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Relationship.countDocuments(query);

    res.json({
      relationships,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching relationships:', error);
    res.status(500).json({ message: 'Error fetching relationships', error: error.message });
  }
});

// Get relationship by ID
router.get('/:id', async (req, res) => {
  try {
    const relationship = await Relationship.findById(req.params.id)
      .populate('contactA contactB referrer referred');

    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }

    res.json(relationship);
  } catch (error) {
    console.error('Error fetching relationship:', error);
    res.status(500).json({ message: 'Error fetching relationship', error: error.message });
  }
});

// Create new relationship
router.post('/', async (req, res) => {
  try {
    const {
      contactA,
      contactB,
      relationshipTypeAtoB,
      relationshipTypeBtoA,
      context,
      howTheyMet,
      isReferralRelationship,
      isPrimaryReferral,
      createdBy
    } = req.body;

    // Check if relationship already exists
    const existingRelationship = await Relationship.findOne({
      $or: [
        { contactA, contactB },
        { contactA: contactB, contactB: contactA }
      ]
    });

    if (existingRelationship) {
      return res.status(400).json({ 
        message: 'Relationship already exists between these contacts',
        relationship: existingRelationship
      });
    }

    // Create relationship
    const relationshipData = {
      contactA,
      contactB,
      relationshipTypeAtoB,
      relationshipTypeBtoA,
      context,
      howTheyMet,
      isReferralRelationship,
      isPrimaryReferral,
      createdBy
    };

    // Set referrer and referred if it's a referral relationship
    if (isReferralRelationship) {
      if (relationshipTypeAtoB === 'referrer' || relationshipTypeAtoB === 'referred-by') {
        relationshipData.referrer = relationshipTypeAtoB === 'referrer' ? contactA : contactB;
        relationshipData.referred = relationshipTypeAtoB === 'referrer' ? contactB : contactA;
      }
      relationshipData.referralDate = new Date();
    }

    const relationship = new Relationship(relationshipData);
    await relationship.save();

    // Update contact statistics if referral
    if (isReferralRelationship && relationshipData.referrer) {
      await Contact.findByIdAndUpdate(relationshipData.referrer, {
        $inc: { totalReferrals: 1 },
        isReferrer: true
      });
    }

    const populatedRelationship = await Relationship.findById(relationship._id)
      .populate('contactA contactB referrer referred');

    res.status(201).json(populatedRelationship);
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(400).json({ message: 'Error creating relationship', error: error.message });
  }
});

// Update relationship
router.put('/:id', async (req, res) => {
  try {
    const oldRelationship = await Relationship.findById(req.params.id);
    
    if (!oldRelationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }

    // Track changes
    const changes = [];
    Object.keys(req.body).forEach(key => {
      if (oldRelationship[key] !== req.body[key]) {
        changes.push({
          field: key,
          oldValue: oldRelationship[key],
          newValue: req.body[key],
          changedBy: req.body.lastUpdatedBy || 'admin',
          reason: req.body.changeReason || 'Updated'
        });
      }
    });

    const relationship = await Relationship.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        $push: { changeHistory: { $each: changes } }
      },
      { new: true, runValidators: true }
    ).populate('contactA contactB referrer referred');

    res.json(relationship);
  } catch (error) {
    console.error('Error updating relationship:', error);
    res.status(400).json({ message: 'Error updating relationship', error: error.message });
  }
});

// Delete relationship (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const relationship = await Relationship.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }

    res.json({ message: 'Relationship deactivated successfully', relationship });
  } catch (error) {
    console.error('Error deleting relationship:', error);
    res.status(500).json({ message: 'Error deleting relationship', error: error.message });
  }
});

// Get relationship network for a contact
router.get('/network/:contactId', async (req, res) => {
  try {
    const { depth = 2 } = req.query;
    const contactId = req.params.contactId;

    // Get direct relationships
    const directRelationships = await Relationship.find({
      $or: [
        { contactA: contactId },
        { contactB: contactId }
      ],
      status: 'active'
    }).populate('contactA contactB');

    // Build network data
    const network = {
      nodes: [],
      edges: [],
      center: contactId
    };

    // Add center node
    const centerContact = await Contact.findById(contactId);
    network.nodes.push({
      id: contactId,
      name: centerContact.name,
      type: centerContact.contactType,
      isReferrer: centerContact.isReferrer,
      level: 0
    });

    // Add direct connections
    directRelationships.forEach(rel => {
      const otherContact = rel.contactA._id.toString() === contactId ? rel.contactB : rel.contactA;
      const relationshipType = rel.contactA._id.toString() === contactId 
        ? rel.relationshipTypeAtoB 
        : rel.relationshipTypeBtoA;

      // Add node if not exists
      if (!network.nodes.find(n => n.id === otherContact._id.toString())) {
        network.nodes.push({
          id: otherContact._id.toString(),
          name: otherContact.name,
          type: otherContact.contactType,
          isReferrer: otherContact.isReferrer,
          level: 1
        });
      }

      // Add edge
      network.edges.push({
        from: contactId,
        to: otherContact._id.toString(),
        relationshipType,
        isReferral: rel.isReferralRelationship,
        isPrimary: rel.isPrimaryReferral
      });
    });

    res.json(network);
  } catch (error) {
    console.error('Error fetching relationship network:', error);
    res.status(500).json({ message: 'Error fetching relationship network', error: error.message });
  }
});

module.exports = router;
