const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
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
  gstNumber: {
    type: String,
    trim: true
  },
  
  // Additional Contact Information
  mainContact: {
    name: String,
    phone: String,
    email: String
  },
  wifeContact: {
    name: String,
    phone: String,
    email: String
  },
  familyMembers: [{
    name: String,
    relation: String,
    phone: String,
    email: String
  }],
  projectIncharge: {
    name: String,
    phone: String,
    email: String,
    designation: String
  },
  
  // Client Classification
  clientType: {
    type: String,
    enum: ['individual', 'business', 'contractor', 'architect'],
    default: 'individual'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'potential'],
    default: 'active'
  },
  
  // Project History
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BudgetPlan'
  }],
  totalProjects: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  
  // Additional Details
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    enum: ['website', 'referral', 'social-media', 'direct', 'other'],
    default: 'website'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  lastContactDate: {
    type: Date
  },
  
  // Custom fields for any additional information
  customFields: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for searching
clientSchema.index({ name: 1, email: 1, phone: 1, companyName: 1 });

module.exports = mongoose.model('Client', clientSchema);
