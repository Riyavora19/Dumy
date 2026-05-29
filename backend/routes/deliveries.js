const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Quotation = require('../models/Quotation');

// GET all deliveries (with optional filter)
router.get('/', async (req, res) => {
  try {
    const { quotationId, status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (quotationId) query.quotation = quotationId;
    if (status && status !== 'all') query.status = status;

    const deliveries = await Delivery.find(query)
      .populate('quotation', 'quotationNumber clientName total totalDelivered deliveryStatus')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Delivery.countDocuments(query);
    res.json({ success: true, deliveries, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET deliveries for a specific quotation
router.get('/quotation/:quotationId', async (req, res) => {
  try {
    const deliveries = await Delivery.find({ quotation: req.params.quotationId }).sort({ createdAt: 1 });
    const quotation = await Quotation.findById(req.params.quotationId);

    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    // Calculate delivery summary
    const totalDelivered = deliveries.reduce((sum, d) => sum + d.deliveryValue, 0);
    const remaining = quotation.total - totalDelivered;

    res.json({
      success: true,
      deliveries,
      summary: {
        quotationTotal: quotation.total,
        totalDelivered,
        remaining,
        deliveryStatus: quotation.deliveryStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create delivery
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };

    // Generate delivery number
    const count = await Delivery.countDocuments();
    const date = new Date();
    const yy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    data.deliveryNumber = `DL${yy}${mm}${(count + 1).toString().padStart(4, '0')}`;

    data.deliveryValue = (data.items || []).reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    const delivery = new Delivery(data);
    await delivery.save();

    // Update quotation's totalDelivered and deliveryStatus
    const quotation = await Quotation.findById(data.quotation);
    if (quotation) {
      const allDeliveries = await Delivery.find({ quotation: data.quotation });
      const totalDelivered = allDeliveries.reduce((sum, d) => sum + d.deliveryValue, 0);

      let deliveryStatus = 'partial';
      if (totalDelivered >= quotation.total) deliveryStatus = 'completed';
      if (totalDelivered === 0) deliveryStatus = 'not_started';

      await Quotation.findByIdAndUpdate(data.quotation, { totalDelivered, deliveryStatus });
    }

    res.status(201).json({ success: true, delivery });
  } catch (err) {
    console.error('Error creating delivery:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update delivery
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.items) {
      data.deliveryValue = data.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    }

    const delivery = await Delivery.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });

    // Recalculate quotation totals
    const allDeliveries = await Delivery.find({ quotation: delivery.quotation });
    const totalDelivered = allDeliveries.reduce((sum, d) => sum + d.deliveryValue, 0);
    const quotation = await Quotation.findById(delivery.quotation);
    if (quotation) {
      let deliveryStatus = 'partial';
      if (totalDelivered >= quotation.total) deliveryStatus = 'completed';
      if (totalDelivered === 0) deliveryStatus = 'not_started';
      await Quotation.findByIdAndUpdate(delivery.quotation, { totalDelivered, deliveryStatus });
    }

    res.json({ success: true, delivery });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE delivery
router.delete('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findByIdAndDelete(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });

    // Recalculate quotation totals
    const allDeliveries = await Delivery.find({ quotation: delivery.quotation });
    const totalDelivered = allDeliveries.reduce((sum, d) => sum + d.deliveryValue, 0);
    const quotation = await Quotation.findById(delivery.quotation);
    if (quotation) {
      let deliveryStatus = 'partial';
      if (totalDelivered >= quotation.total) deliveryStatus = 'completed';
      if (totalDelivered === 0) deliveryStatus = 'not_started';
      await Quotation.findByIdAndUpdate(delivery.quotation, { totalDelivered, deliveryStatus });
    }

    res.json({ success: true, message: 'Delivery deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
