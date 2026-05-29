const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Delivery = require('../models/Delivery');
const Payment = require('../models/Payment');

// GET all quotations (with optional status filter)
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { clientPhone: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const quotations = await Quotation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quotation.countDocuments(query);

    // Count by status for tab badges
    const counts = await Quotation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusCounts = { all: total, draft: 0, pending_approval: 0, approved: 0, rejected: 0 };
    counts.forEach(c => { statusCounts[c._id] = c.count; });

    res.json({ success: true, quotations, total, statusCounts });
  } catch (err) {
    console.error('Error fetching quotations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single quotation with full history
router.get('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    const deliveries = await Delivery.find({ quotation: req.params.id }).sort({ createdAt: 1 });
    const payments = await Payment.find({ quotation: req.params.id }).sort({ paymentDate: 1 });

    res.json({ success: true, quotation, deliveries, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create quotation
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };

    // Generate quotation number
    const count = await Quotation.countDocuments();
    const date = new Date();
    const yy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    data.quotationNumber = `QT${yy}${mm}${(count + 1).toString().padStart(4, '0')}`;

    // Calculate totals
    const subtotal = (data.items || []).reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    data.subtotal = subtotal;

    let discountAmount = 0;
    if (data.discountType === 'percentage') {
      discountAmount = (subtotal * (data.discountValue || 0)) / 100;
    } else if (data.discountType === 'flat') {
      discountAmount = data.discountValue || 0;
    }
    data.discountAmount = discountAmount;

    const taxable = subtotal - discountAmount;
    data.gstAmount = (taxable * (data.gstRate || 18)) / 100;
    data.total = taxable + data.gstAmount;

    if (!data.status) data.status = 'pending_approval';

    const quotation = new Quotation(data);
    await quotation.save();

    res.status(201).json({ success: true, quotation });
  } catch (err) {
    console.error('Error creating quotation:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update quotation
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };

    // Recalculate totals if items changed
    if (data.items) {
      const subtotal = data.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      data.subtotal = subtotal;

      let discountAmount = 0;
      if (data.discountType === 'percentage') {
        discountAmount = (subtotal * (data.discountValue || 0)) / 100;
      } else if (data.discountType === 'flat') {
        discountAmount = data.discountValue || 0;
      }
      data.discountAmount = discountAmount;

      const taxable = subtotal - discountAmount;
      data.gstAmount = (taxable * (data.gstRate || 18)) / 100;
      data.total = taxable + data.gstAmount;
    }

    const quotation = await Quotation.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    res.json({ success: true, quotation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT approve quotation
router.put('/:id/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: approvedBy || 'Admin', approvedAt: new Date() },
      { new: true }
    );
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });
    res.json({ success: true, quotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT reject quotation
router.put('/:id/reject', async (req, res) => {
  try {
    const { rejectedBy, rejectionReason } = req.body;
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectedBy: rejectedBy || 'Admin', rejectedAt: new Date(), rejectionReason },
      { new: true }
    );
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });
    res.json({ success: true, quotation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE quotation (soft delete → draft)
router.delete('/:id', async (req, res) => {
  try {
    await Quotation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Quotation deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
