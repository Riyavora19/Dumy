const mongoose = require('mongoose');

const deliveryItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  sku: String,
  companyName: String,
  categoryName: String,
  quantityOrdered: { type: Number, required: true },
  quantityDelivered: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  image: String,
  roomName: String,
  areaName: String
});

const deliverySchema = new mongoose.Schema({
  deliveryNumber: { type: String, unique: true },

  // Link to quotation
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
  quotationNumber: { type: String },

  // Client info (denormalized)
  clientName: { type: String },
  clientPhone: { type: String },
  clientAddress: { type: String },

  // Delivery batch items
  items: [deliveryItemSchema],

  // Value of this delivery batch
  deliveryValue: { type: Number, default: 0 },

  // Status
  status: {
    type: String,
    enum: ['scheduled', 'in_transit', 'delivered', 'failed'],
    default: 'delivered'
  },

  // Dates
  scheduledDate: { type: Date },
  deliveredDate: { type: Date, default: Date.now },

  // Notes
  notes: { type: String },
  deliveredBy: { type: String },

  createdBy: { type: String },
  createdByName: { type: String }
}, { timestamps: true });

// Auto-generate delivery number
deliverySchema.pre('save', async function () {
  if (!this.deliveryNumber) {
    const count = await mongoose.model('Delivery').countDocuments();
    const date = new Date();
    const yy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    this.deliveryNumber = `DL${yy}${mm}${(count + 1).toString().padStart(4, '0')}`;
  }
});

deliverySchema.index({ quotation: 1, createdAt: -1 });

module.exports = mongoose.model('Delivery', deliverySchema);
