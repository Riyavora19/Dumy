const mongoose = require('mongoose');

const roomTemplateSchema = new mongoose.Schema({
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
  icon: {
    type: String,
    default: '🏠'
  },
  thumbnail: {
    type: String
  },
  // Required items for this room
  requiredItems: [{
    itemType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductItemType',
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    isEssential: {
      type: Boolean,
      default: true
    },
    quantity: {
      min: {
        type: Number,
        default: 1
      },
      max: {
        type: Number,
        default: 1
      }
    },
    // Suggested budget allocation percentage
    budgetAllocation: {
      type: Number,
      default: 10, // percentage
      min: 0,
      max: 100
    },
    priceRange: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 50000
      }
    },
    priority: {
      type: Number,
      default: 1 // 1 = highest priority
    }
  }],
  // Estimated budget range for this room
  estimatedBudget: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    recommended: {
      type: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
roomTemplateSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('RoomTemplate', roomTemplateSchema);
