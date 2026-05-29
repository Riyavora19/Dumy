const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: { type: String, unique: true },

  // Link to quotation
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
  quotationNumber: { type: String },

  // Client info (denormalized)
  clientName: { type: String },
  clientPhone: { type: String },

  // Payment details
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'other'],
    default: 'cash'
  },
  transactionId: { type: String, trim: true },
  paymentDate: { type: Date, default: Date.now },

  // Notes
  notes: { type: String },

  // Running totals (snapshot at time of payment)
  totalQuotationAmount: { type: Number },
  totalPaidAfterThis: { type: Number },
  balanceAfterThis: { type: Number },

  createdBy: { type: String },
  createdByName: { type: String }
}, { timestamps: true });

// Auto-generate payment number
paymentSchema.pre('save', async function () {
  if (!this.paymentNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    const date = new Date();
    const yy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    this.paymentNumber = `PAY${yy}${mm}${(count + 1).toString().padStart(4, '0')}`;
  }
});

paymentSchema.index({ quotation: 1, paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
