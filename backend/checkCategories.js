const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function checkCategories() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const categories = await Category.find();
    
    console.log('📋 Categories and Product Count:\n');
    
    for (const cat of categories) {
      const productCount = await Product.countDocuments({ category: cat._id });
      console.log(`${cat.icon || '📦'} ${cat.name}: ${productCount} products`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkCategories();
