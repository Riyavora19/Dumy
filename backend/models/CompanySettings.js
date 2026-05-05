const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
  // Bank Details
  bankName: {
    type: String,
    default: 'State Bank of India'
  },
  accountNumber: {
    type: String,
    default: '1234567890'
  },
  ifscCode: {
    type: String,
    default: 'SBIN0001234'
  },
  branchName: {
    type: String,
    default: 'Ahmedabad Main Branch'
  },
  
  // Terms & Conditions
  termsAndConditions: {
    paymentTerms: {
      type: [String],
      default: ['50% advance, 50% before dispatch']
    },
    validity: {
      type: [String],
      default: ['Quotation valid for 30 days']
    },
    delivery: {
      type: [String],
      default: ['Ex-Works Ahmedabad', 'Delivery charges extra if applicable']
    },
    pricingAndTaxes: {
      type: [String],
      default: ['GST 18% applicable', 'Prices subject to change without notice']
    }
  },
  
  // Company Info (optional - for future use)
  companyName: {
    type: String,
    default: 'Gujarat Tube & Sanitary Stores'
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
companySettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
