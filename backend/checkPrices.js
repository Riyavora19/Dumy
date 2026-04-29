const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function checkPrices() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const products = await Product.find().sort({ price: -1 }).limit(10);
    
    console.log('Top 10 Most Expensive Products:');
    products.forEach(p => {
      console.log(`  - ${p.name} (${p.variant}): ₹${p.price.toLocaleString()}`);
    });

    const maxPrice = await Product.findOne().sort({ price: -1 });
    const minPrice = await Product.findOne().sort({ price: 1 });
    
    console.log(`\nPrice Range: ₹${minPrice.price.toLocaleString()} - ₹${maxPrice.price.toLocaleString()}`);
    
    const totalProducts = await Product.countDocuments();
    console.log(`\nTotal Products: ${totalProducts}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkPrices();
