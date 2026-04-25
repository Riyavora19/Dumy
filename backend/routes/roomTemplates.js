const express = require('express');
const router = express.Router();
const RoomTemplate = require('../models/RoomTemplate');
const ProductItemType = require('../models/ProductItemType');

// Get all active room templates
router.get('/', async (req, res) => {
  try {
    const templates = await RoomTemplate.find({ isActive: true })
      .populate('requiredItems.itemType')
      .sort({ displayOrder: 1, name: 1 });
    
    res.json(templates);
  } catch (error) {
    console.error('Error fetching room templates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single room template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await RoomTemplate.findById(req.params.id)
      .populate('requiredItems.itemType');
    
    if (!template) {
      return res.status(404).json({ message: 'Room template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching room template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new room template (Admin)
router.post('/', async (req, res) => {
  try {
    const template = new RoomTemplate(req.body);
    await template.save();
    
    const populated = await RoomTemplate.findById(template._id)
      .populate('requiredItems.itemType');
    
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating room template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update room template (Admin)
router.put('/:id', async (req, res) => {
  try {
    const template = await RoomTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('requiredItems.itemType');
    
    if (!template) {
      return res.status(404).json({ message: 'Room template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error updating room template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete room template (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const template = await RoomTemplate.findByIdAndDelete(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Room template not found' });
    }
    
    res.json({ message: 'Room template deleted successfully' });
  } catch (error) {
    console.error('Error deleting room template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
