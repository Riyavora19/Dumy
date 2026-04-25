const mongoose = require('mongoose');

const productItemTypeSchema = new mongoose.Schema({
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  icon: {
    type: String,
    default: '📦'
  },
  // Price range guidance for this item type
  priceRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100000
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
productItemTypeSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('ProductItemType', productItemTypeSchema);
