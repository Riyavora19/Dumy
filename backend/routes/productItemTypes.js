const express = require('express');
const router = express.Router();
const ProductItemType = require('../models/ProductItemType');

// Get all active item types
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    const itemTypes = await ProductItemType.find(query)
      .populate('category')
      .sort({ name: 1 });
    
    res.json(itemTypes);
  } catch (error) {
    console.error('Error fetching item types:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single item type by ID
router.get('/:id', async (req, res) => {
  try {
    const itemType = await ProductItemType.findById(req.params.id)
      .populate('category');
    
    if (!itemType) {
      return res.status(404).json({ message: 'Item type not found' });
    }
    
    res.json(itemType);
  } catch (error) {
    console.error('Error fetching item type:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new item type (Admin)
router.post('/', async (req, res) => {
  try {
    const itemType = new ProductItemType(req.body);
    await itemType.save();
    
    const populated = await ProductItemType.findById(itemType._id)
      .populate('category');
    
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating item type:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item type (Admin)
router.put('/:id', async (req, res) => {
  try {
    const itemType = await ProductItemType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category');
    
    if (!itemType) {
      return res.status(404).json({ message: 'Item type not found' });
    }
    
    res.json(itemType);
  } catch (error) {
    console.error('Error updating item type:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete item type (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const itemType = await ProductItemType.findByIdAndDelete(req.params.id);
    
    if (!itemType) {
      return res.status(404).json({ message: 'Item type not found' });
    }
    
    res.json({ message: 'Item type deleted successfully' });
  } catch (error) {
    console.error('Error deleting item type:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
