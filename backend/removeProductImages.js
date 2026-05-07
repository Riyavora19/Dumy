require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function removeProductImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected\n');

    console.log('Removing all product images...');
    
    const result = await Product.updateMany(
      {},
      { $set: { images: [] } }
    );

    console.log(`✅ Updated ${result.modifiedCount} products`);
    console.log('All product images have been removed\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeProductImages();
