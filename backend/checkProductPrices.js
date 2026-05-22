const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gtss')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function checkProductPrices() {
  try {
    console.log('🔍 Checking product prices...\n');
    
    // Get total count
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalProducts}\n`);

    // Get price statistics
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          zeroPrice: {
            $sum: {
              $cond: [{ $eq: ['$price', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    if (priceStats.length > 0) {
      const stats = priceStats[0];
      console.log('💰 PRICE STATISTICS:');
      console.log('='.repeat(60));
      console.log(`Average Price: ₹${Math.round(stats.avgPrice).toLocaleString()}`);
      console.log(`Minimum Price: ₹${stats.minPrice.toLocaleString()}`);
      console.log(`Maximum Price: ₹${stats.maxPrice.toLocaleString()}`);
      console.log(`Products with ₹0: ${stats.zeroPrice}`);
      console.log('='.repeat(60));
    }

    // Show sample products
    console.log('\n📦 SAMPLE PRODUCTS (first 10):');
    console.log('='.repeat(60));
    const sampleProducts = await Product.find().limit(10).select('name price variant');
    
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} ${product.variant ? `(${product.variant})` : ''}`);
      console.log(`   Price: ₹${product.price.toLocaleString()}`);
    });
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking prices:', error);
    process.exit(1);
  }
}

// Run the check
checkProductPrices();
