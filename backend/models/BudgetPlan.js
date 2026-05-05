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
    required: false // Optional for admin-created plans
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
  // Rooms with areas and products (hierarchical structure)
  rooms: [{
    id: String,
    name: String,
    budget: Number,
    templateId: String,
    templateName: String,
    areas: [{
      id: String,
      name: String,
      icon: String,
      products: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        productName: String,
        variant: String,
        sku: String,
        company: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Company'
        },
        companyName: String,
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category'
        },
        categoryName: String,
        itemType: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ProductItemType'
        },
        itemName: String,
        itemTypeName: String,
        quantity: {
          type: Number,
          default: 1,
          min: 1
        },
        unitPrice: {
          type: Number,
          default: 0,
          min: 0
        },
        discount: {
          type: Number,
          default: 0,
          min: 0
        },
        discountPercent: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        },
        totalPrice: {
          type: Number,
          default: 0,
          min: 0
        },
        image: String,
        roomId: String,
        roomName: String,
        areaId: String,
        areaName: String
      }]
    }]
  }],
  // Selected products for each item type
  selectedProducts: [{
    itemType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductItemType',
      required: false // Made optional for flexibility
    },
    itemName: {
      type: String,
      required: false // Made optional
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false // Made optional
    },
    productName: {
      type: String
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
      required: false,
      default: 1,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: false,
      default: 0,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: false,
      default: 0,
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
  // Quotation-specific fields
  quotationValidity: {
    type: String,
    trim: true
  },
  deliveryTime: {
    type: String,
    trim: true
  },
  paymentTerms: {
    type: String,
    trim: true
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  // Track if inquiry was created from this plan
  inquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry'
  },
  // Staff tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: false
  },
  createdByName: {
    type: String,
    trim: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
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
