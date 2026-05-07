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
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: Number,
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
