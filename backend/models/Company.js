const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  website: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Flag to show only companies we're dealing with
  isPartner: {
    type: Boolean,
    default: false
  },
  // Default discount percentage for this company
  defaultDiscountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Pricing tier (for categorizing companies)
  pricingTier: {
    type: String,
    enum: ['standard', 'silver', 'gold', 'platinum', 'custom'],
    default: 'standard'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  productCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
