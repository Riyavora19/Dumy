const mongoose = require('mongoose');
const Product = require('./models/Product');
const Company = require('./models/Company');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function testCompanyDiscounts() {
  try {
    console.log('🔍 Testing company discounts...\n');
    
    // Get Kohler and Jaguar companies
    const kohler = await Company.findOne({ name: /^kohler$/i });
    const jaguar = await Company.findOne({ name: /^jaguar$/i });
    
    console.log('📊 COMPANY DISCOUNTS:');
    console.log('='.repeat(60));
    if (kohler) {
      console.log(`Kohler: ${kohler.defaultDiscountPercentage}% discount`);
    }
    if (jaguar) {
      console.log(`Jaguar: ${jaguar.defaultDiscountPercentage}% discount`);
    }
    console.log('='.repeat(60));
    
    // Get sample products from each company
    console.log('\n📦 SAMPLE PRODUCTS:\n');
    
    if (kohler) {
      const kohlerProducts = await Product.find({ company: kohler._id })
        .populate('company')
        .limit(3);
      
      console.log('Kohler Products:');
      kohlerProducts.forEach(p => {
        const price = p.price || 0;
        const discount = p.company?.defaultDiscountPercentage || 0;
        const discountedPrice = price * (1 - discount / 100);
        console.log(`  - ${p.name}`);
        console.log(`    MRP: ₹${price.toLocaleString()}`);
        console.log(`    Discount: ${discount}%`);
        console.log(`    Your Price: ₹${discountedPrice.toLocaleString()}`);
      });
    }
    
    console.log('');
    
    if (jaguar) {
      const jaguarProducts = await Product.find({ company: jaguar._id })
        .populate('company')
        .limit(3);
      
      console.log('Jaguar Products:');
      jaguarProducts.forEach(p => {
        const price = p.price || 0;
        const discount = p.company?.defaultDiscountPercentage || 0;
        const discountedPrice = price * (1 - discount / 100);
        console.log(`  - ${p.name}`);
        console.log(`    MRP: ₹${price.toLocaleString()}`);
        console.log(`    Discount: ${discount}%`);
        console.log(`    Your Price: ₹${discountedPrice.toLocaleString()}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the test
testCompanyDiscounts();
