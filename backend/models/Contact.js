const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true // Allow multiple null values
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Contact Type
  contactType: {
    type: String,
    enum: ['individual', 'business', 'architect', 'contractor', 'designer', 'agent', 'partner'],
    default: 'individual'
  },
  
  // Company Association
  companies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  companyName: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  
  // Referrer Information
  isReferrer: {
    type: Boolean,
    default: false
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  canRefer: {
    type: Boolean,
    default: true
  },
  
  // Commission Settings (if referrer)
  commissionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  commissionType: {
    type: String,
    enum: ['percentage', 'flat', 'tiered', 'none'],
    default: 'none'
  },
  
  // Bank Details (for commission payments)
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branch: String
  },
  
  // Statistics
  totalReferrals: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalCommissionEarned: {
    type: Number,
    default: 0
  },
  totalCommissionPaid: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  
  // Additional Info
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Source
  source: {
    type: String,
    enum: ['website', 'referral', 'social-media', 'direct', 'import', 'other'],
    default: 'direct'
  },
  
  // Metadata
  createdBy: {
    type: String,
    trim: true
  },
  lastContactDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate unique referral code before saving
contactSchema.pre('save', async function() {
  if (this.isReferrer && !this.referralCode) {
    const namePart = this.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referralCode = `${namePart}${randomPart}`;
  }
});

// Index for searching
contactSchema.index({ name: 1, email: 1, phone: 1, referralCode: 1 });
contactSchema.index({ isReferrer: 1, status: 1 });

module.exports = mongoose.model('Contact', contactSchema);
