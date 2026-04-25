const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  company: {
    type: String,
    trim: true
  },
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
  }
}, {
  timestamps: true
});

// Index for searching
clientSchema.index({ name: 1, email: 1, phone: 1 });

module.exports = mongoose.model('Client', clientSchema);
