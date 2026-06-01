const mongoose = require('mongoose');

const chatSettingsSchema = new mongoose.Schema({
  autoResponseEnabled: {
    type: Boolean,
    default: true
  },
  autoResponseDelay: {
    type: Number,
    default: 30 // seconds before auto-response kicks in
  },
  businessHoursEnabled: {
    type: Boolean,
    default: true
  },
  businessHours: {
    start: {
      type: String,
      default: '09:00' // 9 AM
    },
    end: {
      type: String,
      default: '18:00' // 6 PM
    },
    days: {
      type: [Number], // 0 = Sunday, 1 = Monday, etc.
      default: [1, 2, 3, 4, 5, 6] // Monday to Saturday
    }
  },
  offlineMessage: {
    type: String,
    default: 'Thank you for your message! Our team is currently offline. We\'ll get back to you as soon as possible during business hours (Mon-Sat, 9 AM - 6 PM).'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one settings document exists
chatSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('ChatSettings', chatSettingsSchema);
