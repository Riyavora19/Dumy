const mongoose = require('mongoose');

const budgetPlanSchema = new mongoose.Schema({
  // Optional user reference (for registered users)
  userId: {
    type: String,
    trim: true
  },
  userName: {
    type: String,
    trim: true
  },
  userEmail: {
    type: String,
    trim: true
  },
  userPhone: {
    type: String,
    trim: true
  },
  roomTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomTemplate',
    required: true
  },
  roomName: {
    type: String,
    required: true
  },
  totalBudget: {
    type: Number,
    required: true,
    min: 0
  },
  // Selected products for each item type
  selectedProducts: [{
    itemType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductItemType',
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    companyName: {
      type: String
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  // Calculated totals
  totalCost: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingBudget: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'finalized', 'inquiry_sent', 'completed'],
    default: 'draft'
  },
  notes: {
    type: String,
    trim: true
  },
  // Track if inquiry was created from this plan
  inquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry'
  }
}, {
  timestamps: true
});

// Calculate totals before saving
budgetPlanSchema.pre('save', function() {
  this.totalCost = this.selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
  this.remainingBudget = this.totalBudget - this.totalCost;
});

// Index for faster queries
budgetPlanSchema.index({ userId: 1, createdAt: -1 });
budgetPlanSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('BudgetPlan', budgetPlanSchema);
