const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function verifyStock() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Get stock statistics
    const totalProducts = await Product.countDocuments();
    const inStock = await Product.countDocuments({ stock: { $gt: 0 } });
    const outOfStock = await Product.countDocuments({ $or: [{ stock: 0 }, { stock: null }] });

    console.log('📊 STOCK STATISTICS');
    console.log('='.repeat(60));
    console.log(`Total Products: ${totalProducts}`);
    console.log(`In Stock: ${inStock} (${Math.round(inStock/totalProducts*100)}%)`);
    console.log(`Out of Stock: ${outOfStock} (${Math.round(outOfStock/totalProducts*100)}%)`);
    console.log('='.repeat(60));

    // Get stock distribution
    const stockRanges = [
      { label: '1-10 units', min: 1, max: 10 },
      { label: '11-20 units', min: 11, max: 20 },
      { label: '21-30 units', min: 21, max: 30 },
      { label: '31-40 units', min: 31, max: 40 },
      { label: '41-50 units', min: 41, max: 50 },
      { label: '50+ units', min: 51, max: 999999 }
    ];

    console.log('\n📦 STOCK DISTRIBUTION:');
    for (const range of stockRanges) {
      const count = await Product.countDocuments({ 
        stock: { $gte: range.min, $lte: range.max } 
      });
      const percentage = Math.round(count/totalProducts*100);
      const bar = '█'.repeat(Math.floor(percentage/2));
      console.log(`${range.label.padEnd(15)} ${count.toString().padStart(4)} (${percentage}%) ${bar}`);
    }

    // Show sample products
    console.log('\n📝 SAMPLE PRODUCTS:');
    const samples = await Product.find({}).limit(10).select('name stock');
    samples.forEach((product, index) => {
      const status = product.stock > 0 ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${product.name}`);
      console.log(`   Stock: ${product.stock} units`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

verifyStock();
