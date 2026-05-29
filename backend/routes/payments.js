const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Quotation = require('../models/Quotation');

// GET all payments
router.get('/', async (req, res) => {
  try {
    const { quotationId, page = 1, limit = 50 } = req.query;
    const query = {};
    if (quotationId) query.quotation = quotationId;

    const payments = await Payment.find(query)
      .populate('quotation', 'quotationNumber clientName total totalPaid paymentStatus')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);
    res.json({ success: true, payments, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET payments for a specific quotation
router.get('/quotation/:quotationId', async (req, res) => {
  try {
    const payments = await Payment.find({ quotation: req.params.quotationId }).sort({ paymentDate: 1 });
    const quotation = await Quotation.findById(req.params.quotationId);

    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = quotation.total - totalPaid;

    res.json({
      success: true,
      payments,
      summary: {
        quotationTotal: quotation.total,
        totalPaid,
        balance,
        paymentStatus: quotation.paymentStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create payment
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };

    // Get quotation to calculate running totals
    const quotation = await Quotation.findById(data.quotation);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    const existingPayments = await Payment.find({ quotation: data.quotation });
    const previouslyPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaidAfterThis = previouslyPaid + data.amount;
    const balanceAfterThis = quotation.total - totalPaidAfterThis;

    data.totalQuotationAmount = quotation.total;
    data.totalPaidAfterThis = totalPaidAfterThis;
    data.balanceAfterThis = balanceAfterThis;
    data.quotationNumber = quotation.quotationNumber;
    data.clientName = quotation.clientName;
    data.clientPhone = quotation.clientPhone;

    const payment = new Payment(data);
    await payment.save();

    // Update quotation's totalPaid and paymentStatus
    let paymentStatus = 'partial';
    if (totalPaidAfterThis >= quotation.total) paymentStatus = 'paid';
    if (totalPaidAfterThis === 0) paymentStatus = 'unpaid';

    await Quotation.findByIdAndUpdate(data.quotation, { totalPaid: totalPaidAfterThis, paymentStatus });

    res.status(201).json({ success: true, payment });
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // Recalculate quotation totals
    const allPayments = await Payment.find({ quotation: payment.quotation });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const quotation = await Quotation.findById(payment.quotation);
    if (quotation) {
      let paymentStatus = 'partial';
      if (totalPaid >= quotation.total) paymentStatus = 'paid';
      if (totalPaid === 0) paymentStatus = 'unpaid';
      await Quotation.findByIdAndUpdate(payment.quotation, { totalPaid, paymentStatus });
    }

    res.json({ success: true, message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
