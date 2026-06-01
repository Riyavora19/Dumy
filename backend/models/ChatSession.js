const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'support'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
chatSessionSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);
