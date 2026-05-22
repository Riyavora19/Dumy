const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Function to generate random price between 500 and 100000 (1 lakh)
function generateRandomPrice() {
  return Math.floor(Math.random() * (100000 - 500 + 1)) + 500;
}

async function updateZeroPrices() {
  try {
    console.log('🔍 Finding products with zero or missing prices...\n');
    
    // Find all products with price 0 or undefined
    const productsWithZeroPrice = await Product.find({
      $or: [
        { price: 0 },
        { price: null },
        { price: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${productsWithZeroPrice.length} products with zero/missing prices\n`);

    if (productsWithZeroPrice.length === 0) {
      console.log('✅ All products already have prices!');
      process.exit(0);
    }

    let updatedCount = 0;
    let failedCount = 0;

    for (const product of productsWithZeroPrice) {
      try {
        const randomPrice = generateRandomPrice();
        product.price = randomPrice;
        await product.save();
        
        console.log(`✓ Updated: ${product.name} → ₹${randomPrice.toLocaleString()}`);
        updatedCount++;
      } catch (error) {
        console.error(`✗ Failed to update ${product.name}:`, error.message);
        failedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${updatedCount} products`);
    console.log(`❌ Failed: ${failedCount} products`);
    console.log(`💰 Price range: ₹500 - ₹1,00,000`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating prices:', error);
    process.exit(1);
  }
}

// Run the update
updateZeroPrices();
