const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: false, default: '' },
  sku: String,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  companyName: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryName: String,
  quantity: { type: Number, required: false, default: 1, min: 1 },
  unitPrice: { type: Number, required: false, default: 0, min: 0 },
  discountPercent: { type: Number, default: 0 },
  totalPrice: { type: Number, required: false, default: 0, min: 0 },
  image: String,
  roomName: String,
  areaName: String
});

const quotationSchema = new mongoose.Schema({
  quotationNumber: { type: String, unique: true },

  // Client info
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  clientName: { type: String, required: false, trim: true, default: 'Unknown Client' },
  clientEmail: { type: String, trim: true },
  clientPhone: { type: String, trim: true },
  clientAddress: { type: String, trim: true },
  clientGST: { type: String, trim: true },
  companyName: { type: String, trim: true },
  projectLocation: { type: String, trim: true },
  attention: { type: String, trim: true },

  // Products
  items: [quotationItemSchema],

  // Pricing
  subtotal: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'flat', 'none'], default: 'none' },
  discountValue: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  gstRate: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  // Terms
  quotationValidity: { type: String, default: '30 days' },
  deliveryTime: { type: String, default: '2-3 weeks' },
  paymentTerms: { type: String, default: '50% advance, 50% before dispatch' },
  specialInstructions: { type: String },
  notes: { type: String },

  // Lifecycle status
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'rejected'],
    default: 'pending_approval'
  },

  // Approval info
  approvedBy: { type: String },
  approvedAt: { type: Date },
  rejectedBy: { type: String },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },

  // Dates
  quotationDate: { type: Date, default: Date.now },
  validUntil: { type: Date },

  // Tracking
  createdBy: { type: String },
  createdByName: { type: String },
  lastUpdatedBy: { type: String },

  // Linked delivery & payment summary (denormalized for quick reads)
  deliveryStatus: {
    type: String,
    enum: ['not_started', 'partial', 'completed'],
    default: 'not_started'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  totalDelivered: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-generate quotation number
quotationSchema.pre('save', async function (next) {
  if (!this.quotationNumber) {
    const count = await mongoose.model('Quotation').countDocuments();
    const date = new Date();
    const yy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    this.quotationNumber = `QT${yy}${mm}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

quotationSchema.index({ status: 1, createdAt: -1 });
quotationSchema.index({ client: 1 });

module.exports = mongoose.model('Quotation', quotationSchema);
