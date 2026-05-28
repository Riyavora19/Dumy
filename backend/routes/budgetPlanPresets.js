const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const BudgetPlanPreset = require('../models/BudgetPlanPreset');

// Sanitize products array — ensure productId is a valid ObjectId
function sanitizeProducts(products = []) {
  return products
    .filter(p => p.productId && mongoose.Types.ObjectId.isValid(p.productId))
    .map(p => ({
      productId:   p.productId,
      productName: p.productName || '',
      companyName: p.companyName || '',
      images:      Array.isArray(p.images) ? p.images : [],
      price:       Number(p.price) || 0,
      quantity:    Number(p.quantity) || 1,
      essential:   p.essential !== false,
      areaId:      p.areaId || 'all',
      areaName:    p.areaName || '',
      areaIcon:    p.areaIcon || '',
    }));
}

function sanitizeBody(body) {
  const products = sanitizeProducts(body.products || []);

  // Build areas from products grouped by areaId
  const areaMap = {};
  products.forEach(p => {
    const aId = p.areaId || 'all';
    if (!areaMap[aId]) {
      areaMap[aId] = {
        id:   aId,
        name: p.areaName || (aId === 'all' ? 'All Areas' : aId),
        icon: p.areaIcon || '🏠',
        defaultProducts: []
      };
    }
    areaMap[aId].defaultProducts.push(p);
  });

  // Also accept explicit areas array (merge/override)
  const areasFromBody = (body.areas || []).map(a => ({
    id:   a.id || 'all',
    name: a.name || 'All Areas',
    icon: a.icon || '🏠',
    defaultProducts: sanitizeProducts(a.defaultProducts || [])
  }));

  const finalAreas = areasFromBody.length > 0 ? areasFromBody : Object.values(areaMap);

  return {
    roomName: body.roomName,
    icon:     body.icon || '🏠',
    isActive: body.isActive !== false,
    order:    Number(body.order) || 0,
    products,
    areas: finalAreas,
  };
}

// GET all presets
router.get('/', async (req, res) => {
  try {
    const presets = await BudgetPlanPreset.find().sort({ order: 1, roomName: 1 });
    res.json({ success: true, data: presets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single preset by roomName
router.get('/by-room/:roomName', async (req, res) => {
  try {
    const preset = await BudgetPlanPreset.findOne({
      roomName: { $regex: new RegExp(`^${req.params.roomName}$`, 'i') },
      isActive: true
    });
    res.json({ success: true, data: preset || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create preset
router.post('/', async (req, res) => {
  try {
    const data = sanitizeBody(req.body);
    const preset = new BudgetPlanPreset(data);
    await preset.save();
    res.status(201).json({ success: true, data: preset });
  } catch (err) {
    console.error('Create preset error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update preset
router.put('/:id', async (req, res) => {
  try {
    const data = sanitizeBody(req.body);
    const preset = await BudgetPlanPreset.findByIdAndUpdate(
      req.params.id, data, { new: true, runValidators: true }
    );
    if (!preset) return res.status(404).json({ success: false, message: 'Preset not found' });
    res.json({ success: true, data: preset });
  } catch (err) {
    console.error('Update preset error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE preset
router.delete('/:id', async (req, res) => {
  try {
    const preset = await BudgetPlanPreset.findByIdAndDelete(req.params.id);
    if (!preset) return res.status(404).json({ success: false, message: 'Preset not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
