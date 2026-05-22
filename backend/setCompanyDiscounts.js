const mongoose = require('mongoose');
const Company = require('./models/Company');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function setCompanyDiscounts() {
  try {
    console.log('🔧 Setting company discount percentages...\n');
    
    // Set Kohler discount to 4%
    const kohlerResult = await Company.findOneAndUpdate(
      { name: { $regex: /^kohler$/i } },
      { defaultDiscountPercentage: 4 },
      { new: true }
    );
    
    if (kohlerResult) {
      console.log(`✅ Kohler: Set discount to 4%`);
    } else {
      console.log(`⚠️  Kohler company not found`);
    }
    
    // Set Jaguar discount to 5%
    const jaguarResult = await Company.findOneAndUpdate(
      { name: { $regex: /^jaguar$/i } },
      { defaultDiscountPercentage: 5 },
      { new: true }
    );
    
    if (jaguarResult) {
      console.log(`✅ Jaguar: Set discount to 5%`);
    } else {
      console.log(`⚠️  Jaguar company not found`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Company discounts updated successfully!');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the update
setCompanyDiscounts();
