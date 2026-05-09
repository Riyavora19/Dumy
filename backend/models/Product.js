const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  companyName: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  // Item type (e.g., "Toilet Seat", "Tap", "Flush Tank")
  itemType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductItemType'
  },
  itemTypeName: {
    type: String,
    trim: true
  },
  
  // Variant information
  variant: {
    type: String,
    trim: true
  },
  variantDescription: String,
  


  // Pricing
  mrp: {
    type: Number,
    min: 0,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: Number,
  nrp: { type: Number, min: 0 },       // Net Retail Price
  sdp: { type: Number, min: 0 },       // Suggested Dealer Price
  npp: { type: Number, min: 0 },       // Net Purchase Price
  clp: { type: Number, min: 0 },       // Cost List Price
  effectivePriceListDate: { type: String },
  discount: Number,
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Company-specific pricing
  companyPricing: [{
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    companyName: String,
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    specialPrice: {
      type: Number,
      min: 0
    }
  }],
  
  // Images
  images: [{
    type: String
  }],
  
  // Product details
  sku: {
    type: String,
    trim: true
  },
  itemCode: { type: String, trim: true },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Specifications
  specifications: {
    material: String,
    size: String,
    color: String,
    weight: String,
    dimensions: String,
    warranty: String,
    features: [String]
  },
  
  // Additional classification fields
  hsnCode: { type: String, trim: true },
  gst: { type: Number, min: 0 },
  broadCategory: { type: String, trim: true },
  cat: { type: String, trim: true },         // CAT label
  subCat: { type: String, trim: true },      // SUB CAT
  range: { type: String, trim: true },       // RANGE
  segment: { type: String, trim: true },
  flag: { type: String, trim: true },        // e.g., New, Featured
  channelType: { type: String, trim: true }, // e.g., Retail, Wholesale
  schemeType: { type: String, trim: true },  // e.g., Standard, Promotional

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Additional fields for budget planning
  tags: [{
    type: String,
    trim: true
  }],
  popularity: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index for searching by name and variant
productSchema.index({ name: 1, variant: 1 });
productSchema.index({ name: 1, price: 1 });
productSchema.index({ itemType: 1, price: 1 });
productSchema.index({ company: 1, category: 1 });

module.exports = mongoose.model('Product', productSchema);
