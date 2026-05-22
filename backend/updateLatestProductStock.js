const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function updateLatestProductStock() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Get the latest product
    const latestProduct = await Product.findOne()
      .sort({ createdAt: -1 });

    if (!latestProduct) {
      console.log('❌ No products found!');
      return;
    }

    console.log('📦 Latest Product:');
    console.log('   Name:', latestProduct.name);
    console.log('   Current Stock:', latestProduct.stock);
    console.log('\n');

    // Update stock to 10
    latestProduct.stock = 10;
    await latestProduct.save();

    console.log('✅ Stock updated to:', latestProduct.stock);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

updateLatestProductStock();
