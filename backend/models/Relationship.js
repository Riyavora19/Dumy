const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
  // The two contacts in this relationship
  contactA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  contactB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  
  // Relationship from A's perspective
  relationshipTypeAtoB: {
    type: String,
    enum: [
      // Professional
      'manager', 'employee', 'colleague', 'business-partner', 'client', 'vendor',
      'architect', 'contractor', 'designer', 'engineer', 'consultant',
      // Personal
      'friend', 'family', 'spouse', 'parent', 'child', 'sibling', 'relative',
      'neighbor', 'acquaintance',
      // Business
      'company-owner', 'company-employee', 'supplier', 'competitor',
      // Other
      'referrer', 'referred-by', 'other'
    ],
    required: true
  },
  
  // Relationship from B's perspective (can be different)
  relationshipTypeBtoA: {
    type: String,
    enum: [
      'manager', 'employee', 'colleague', 'business-partner', 'client', 'vendor',
      'architect', 'contractor', 'designer', 'engineer', 'consultant',
      'friend', 'family', 'spouse', 'parent', 'child', 'sibling', 'relative',
      'neighbor', 'acquaintance',
      'company-owner', 'company-employee', 'supplier', 'competitor',
      'referrer', 'referred-by', 'other'
    ]
  },
  
  // Context and Details
  context: {
    type: String,
    trim: true
  },
  howTheyMet: {
    type: String,
    trim: true
  },
  
  // Relationship Strength
  strength: {
    type: String,
    enum: ['strong', 'medium', 'weak'],
    default: 'medium'
  },
  
  // Duration
  knownSince: {
    type: Date
  },
  duration: {
    type: String,
    enum: ['recent', 'established', 'long-term'],
    default: 'recent'
  },
  
  // Referral Specific
  isReferralRelationship: {
    type: Boolean,
    default: false
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  referralDate: {
    type: Date
  },
  
  // Attribution
  isPrimaryReferral: {
    type: Boolean,
    default: false
  },
  attributionPriority: {
    type: Number,
    default: 1
  },
  
  // Verification
  verifiedByContactA: {
    type: Boolean,
    default: false
  },
  verifiedByContactB: {
    type: Boolean,
    default: false
  },
  verifiedByAdmin: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'ended'],
    default: 'active'
  },
  
  // Privacy
  isPrivate: {
    type: Boolean,
    default: false
  },
  canShareWithContactA: {
    type: Boolean,
    default: true
  },
  canShareWithContactB: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    trim: true
  },
  lastUpdatedBy: {
    type: String,
    trim: true
  },
  
  // History tracking
  changeHistory: [{
    field: String,
    oldValue: String,
    newValue: String,
    changedBy: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }]
}, {
  timestamps: true
});

// Compound index to prevent duplicate relationships
relationshipSchema.index({ contactA: 1, contactB: 1 }, { unique: true });
relationshipSchema.index({ referrer: 1, referred: 1 });
relationshipSchema.index({ isReferralRelationship: 1, isPrimaryReferral: 1 });

// Method to add change to history
relationshipSchema.methods.addChangeHistory = function(field, oldValue, newValue, changedBy, reason) {
  this.changeHistory.push({
    field,
    oldValue,
    newValue,
    changedBy,
    reason
  });
};

module.exports = mongoose.model('Relationship', relationshipSchema);
