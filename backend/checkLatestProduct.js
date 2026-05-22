const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Category = require('./models/Category');
const Company = require('./models/Company');
const ProductItemType = require('./models/ProductItemType');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function checkLatestProduct() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Get the latest product
    const latestProduct = await Product.findOne()
      .sort({ createdAt: -1 })
      .populate('category')
      .populate('company')
      .populate('itemType');

    if (!latestProduct) {
      console.log('❌ No products found!');
      return;
    }

    console.log('✅ Latest Product:');
    console.log('   ID:', latestProduct._id);
    console.log('   Name:', latestProduct.name);
    console.log('   Category:', latestProduct.category?.name || latestProduct.category);
    console.log('   Company:', latestProduct.company?.name || latestProduct.companyName || latestProduct.company);
    console.log('   Item Type:', latestProduct.itemType?.name || latestProduct.itemTypeName || latestProduct.itemType);
    console.log('   Variant:', latestProduct.variant || 'None');
    console.log('   Price:', latestProduct.price);
    console.log('   Stock:', latestProduct.stock);
    console.log('   Images:', latestProduct.images?.length || 0);
    if (latestProduct.images && latestProduct.images.length > 0) {
      latestProduct.images.forEach((img, i) => {
        console.log(`     ${i + 1}. ${img}`);
      });
    } else {
      console.log('     ⚠️  No images!');
    }
    console.log('   Active:', latestProduct.isActive);
    console.log('   Created:', latestProduct.createdAt);
    console.log('\n');

    // Check if images exist on disk
    if (latestProduct.images && latestProduct.images.length > 0) {
      const fs = require('fs');
      const path = require('path');
      console.log('Checking if image files exist:');
      latestProduct.images.forEach((img, i) => {
        const imagePath = path.join(__dirname, img.replace('/uploads/', 'uploads/'));
        const exists = fs.existsSync(imagePath);
        console.log(`   ${i + 1}. ${img} - ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkLatestProduct();
