const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Category = require('./models/Category');
const Company = require('./models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function checkProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const products = await Product.find().populate('category');
    const categories = await Category.find();

    console.log('📊 Database Status:\n');
    console.log(`Total Categories: ${categories.length}`);
    console.log(`Total Products: ${products.length}\n`);

    console.log('📁 Categories:');
    for (const cat of categories) {
      const productCount = products.filter(p => p.category?._id.toString() === cat._id.toString()).length;
      console.log(`  ${cat.icon} ${cat.name} - ${productCount} products`);
    }

    console.log('\n📦 Products:');
    products.forEach(p => {
      console.log(`  - ${p.name} (${p.variant}) in ${p.category?.name || 'Unknown'} - Company: ${p.companyName || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkProducts();
