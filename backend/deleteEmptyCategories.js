const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function deleteEmptyCategories() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const categories = await Category.find();
    
    console.log('🔍 Checking for empty categories...\n');
    
    for (const cat of categories) {
      const productCount = await Product.countDocuments({ category: cat._id });
      
      if (productCount === 0) {
        console.log(`❌ Deleting empty category: ${cat.icon || '📦'} ${cat.name}`);
        await Category.findByIdAndDelete(cat._id);
      } else {
        console.log(`✅ Keeping category: ${cat.icon || '📦'} ${cat.name} (${productCount} products)`);
      }
    }
    
    console.log('\n✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

deleteEmptyCategories();
