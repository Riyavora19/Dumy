const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Relationship = require('../models/Relationship');

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      contactType, 
      isReferrer, 
      status,
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Type filter
    if (contactType) {
      query.contactType = contactType;
    }

    // Referrer filter
    if (isReferrer !== undefined) {
      query.isReferrer = isReferrer === 'true';
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .populate('companies')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Contact.countDocuments(query);

    res.json({
      contacts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
});

// Get contact by ID
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate('companies');
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Get relationships
    const relationships = await Relationship.find({
      $or: [
        { contactA: req.params.id },
        { contactB: req.params.id }
      ],
      status: 'active'
    })
    .populate('contactA contactB')
    .sort({ createdAt: -1 });

    res.json({ contact, relationships });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ message: 'Error fetching contact', error: error.message });
  }
});

// Search contacts (for autocomplete)
router.get('/search/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const contacts = await Contact.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { referralCode: { $regex: q, $options: 'i' } }
      ],
      status: 'active'
    })
    .select('name email phone referralCode contactType isReferrer')
    .limit(10);

    res.json(contacts);
  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({ message: 'Error searching contacts', error: error.message });
  }
});

// Create new contact
router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(400).json({ message: 'Error creating contact', error: error.message });
  }
});

// Update contact
router.put('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(400).json({ message: 'Error updating contact', error: error.message });
  }
});

// Delete contact (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact deactivated successfully', contact });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
});

// Get contact's referrals
router.get('/:id/referrals', async (req, res) => {
  try {
    const relationships = await Relationship.find({
      referrer: req.params.id,
      isReferralRelationship: true,
      status: 'active'
    })
    .populate('referred')
    .sort({ createdAt: -1 });

    const referrals = relationships.map(rel => rel.referred);

    res.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ message: 'Error fetching referrals', error: error.message });
  }
});

// Get contact statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Get relationship count
    const relationshipCount = await Relationship.countDocuments({
      $or: [
        { contactA: req.params.id },
        { contactB: req.params.id }
      ],
      status: 'active'
    });

    // Get referral count
    const referralCount = await Relationship.countDocuments({
      referrer: req.params.id,
      isReferralRelationship: true,
      status: 'active'
    });

    res.json({
      totalReferrals: contact.totalReferrals,
      totalOrders: contact.totalOrders,
      totalRevenue: contact.totalRevenue,
      totalCommissionEarned: contact.totalCommissionEarned,
      totalCommissionPaid: contact.totalCommissionPaid,
      relationshipCount,
      referralCount
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({ message: 'Error fetching contact stats', error: error.message });
  }
});

module.exports = router;
