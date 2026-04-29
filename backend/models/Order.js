const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: false // Auto-generated in pre-save hook
  },
  
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  
  // Referral Information
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  referrerName: {
    type: String,
    trim: true
  },
  relationship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship'
  },
  relationshipType: {
    type: String,
    trim: true
  },
  relationshipContext: {
    type: String,
    trim: true
  },
  
  // Referral Chain (for multi-level)
  referralChain: [{
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    name: String,
    level: Number,
    relationshipType: String
  }],
  
  // Shipping Address
  shippingAddress: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: 'India'
    },
    landmark: {
      type: String,
      trim: true
    }
  },
  
  // Billing Address
  billingAddress: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Billing same as shipping
  sameAsShipping: {
    type: Boolean,
    default: true
  },
  
  // Bill To (who is paying)
  billToName: {
    type: String,
    trim: true
  },
  billToContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  billToRelationship: {
    type: String,
    trim: true
  },
  
  // Products
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
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
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    image: String,
    specifications: mongoose.Schema.Types.Mixed
  }],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat', 'none'],
    default: 'none'
  },
  tax: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 18 // GST 18%
  },
  shippingCharges: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'bank-transfer', 'cheque', 'credit', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  transactionId: {
    type: String,
    trim: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Commission (if referrer exists)
  referrerCommission: {
    amount: {
      type: Number,
      default: 0
    },
    rate: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'cancelled'],
      default: 'pending'
    },
    approvedBy: String,
    approvedDate: Date,
    paidDate: Date,
    paymentMethod: String,
    notes: String
  },
  
  // Dates
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  deliveredDate: {
    type: Date
  },
  
  // Additional Information
  notes: {
    type: String,
    trim: true
  },
  internalNotes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Assignment
  assignedTo: {
    type: String,
    trim: true
  },
  
  // Source
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'walk-in', 'referral', 'admin'],
    default: 'admin'
  },
  
  // Linked Records
  budgetPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BudgetPlan'
  },
  inquiry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry'
  },
  liveRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveRequest'
  },
  
  // Metadata
  createdBy: {
    type: String,
    trim: true
  },
  lastUpdatedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      this.orderNumber = `ORD${year}${month}${(count + 1).toString().padStart(5, '0')}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      const timestamp = Date.now().toString().slice(-6);
      this.orderNumber = `ORD${timestamp}`;
    }
  }
});

// Calculate totals before saving
orderSchema.pre('save', function() {
  // Calculate subtotal
  this.subtotal = this.products.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate discount
  let discountAmount = 0;
  if (this.discountType === 'percentage') {
    discountAmount = (this.subtotal * this.discount) / 100;
  } else if (this.discountType === 'flat') {
    discountAmount = this.discount;
  }
  
  // Calculate tax
  const taxableAmount = this.subtotal - discountAmount;
  const taxAmount = (taxableAmount * this.taxRate) / 100;
  
  // Calculate total
  this.total = taxableAmount + taxAmount + this.shippingCharges;
  
  // Calculate commission if referrer exists
  if (this.referrer && this.referrerCommission.rate > 0) {
    this.referrerCommission.amount = (this.total * this.referrerCommission.rate) / 100;
  }
});

// Index for searching (orderNumber already indexed via unique: true)
orderSchema.index({ customer: 1, orderDate: -1 });
orderSchema.index({ referrer: 1, orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
