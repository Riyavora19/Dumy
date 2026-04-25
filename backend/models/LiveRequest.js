const mongoose = require('mongoose');

const liveRequestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    trim: true
  },
  clientPhone: {
    type: String,
    required: true,
    trim: true
  },
  requestType: {
    type: String,
    enum: ['quote', 'consultation', 'installation', 'repair', 'custom-order', 'other'],
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  categoryName: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  preferredDate: {
    type: Date
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'quoted', 'approved', 'completed', 'cancelled'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  estimatedCost: {
    type: Number
  },
  actualCost: {
    type: Number
  },
  notes: [{
    text: String,
    addedBy: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'walk-in', 'referral', 'social-media'],
    default: 'website'
  },
  followUpDate: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate request number before saving
liveRequestSchema.pre('save', async function() {
  if (!this.requestNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      this.requestNumber = `REQ${year}${month}${(count + 1).toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating request number:', error);
      // Fallback to timestamp-based number if count fails
      const timestamp = Date.now().toString().slice(-6);
      this.requestNumber = `REQ${timestamp}`;
    }
  }
});

// Index for searching
liveRequestSchema.index({ requestNumber: 1, clientName: 1, clientEmail: 1, status: 1 });

module.exports = mongoose.model('LiveRequest', liveRequestSchema);
