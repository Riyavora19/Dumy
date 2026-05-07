require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gtss-db';

// Define discount percentages for each company
const companyDiscounts = {
  'Kohler': 5,
  'Hindware': 4,
  'Jaquar': 3,
  'Cera': 2,
  'Parryware': 1
};

async function setCompanyDiscounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected\n');

    console.log('🔧 Setting company discount percentages...\n');

    // Update each company with their discount percentage
    for (const [companyName, discount] of Object.entries(companyDiscounts)) {
      const company = await Company.findOne({ name: companyName });
      
      if (company) {
        company.defaultDiscountPercentage = discount;
        await company.save();
        console.log(`✅ ${companyName}: ${discount}% discount set`);
        
        // Update all products from this company
        const products = await Product.find({ companyName: companyName });
        console.log(`   Found ${products.length} products for ${companyName}`);
        
        let updatedCount = 0;
        for (const product of products) {
          // Calculate discounted price from MRP
          if (product.mrp) {
            const discountedPrice = Math.round(product.mrp * (1 - discount / 100));
            product.price = discountedPrice;
            product.discountPercentage = discount;
            await product.save();
            updatedCount++;
          }
        }
        console.log(`   Updated ${updatedCount} products with ${discount}% discount\n`);
      } else {
        console.log(`⚠️  Company not found: ${companyName}\n`);
      }
    }

    console.log('\n✅ All company discounts have been set!');
    console.log('\n📊 Summary:');
    console.log('   Kohler: 5% discount');
    console.log('   Hindware: 4% discount');
    console.log('   Jaquar: 3% discount');
    console.log('   Cera: 2% discount');
    console.log('   Parryware: 1% discount');

    // Display sample products
    console.log('\n📦 Sample Products with Discounts:');
    const sampleProducts = await Product.find()
      .populate('company')
      .limit(10)
      .sort({ companyName: 1 });
    
    for (const product of sampleProducts) {
      const companyName = product.companyName || (product.company?.name);
      console.log(`   ${product.name} (${companyName})`);
      console.log(`      MRP: ₹${product.mrp} → Your Price: ₹${product.price} (${product.discountPercentage}% OFF)`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setCompanyDiscounts();
