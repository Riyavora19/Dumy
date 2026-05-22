const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function checkProductImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const products = await Product.find().limit(10);
    
    console.log('📊 Total Products:', await Product.countDocuments());
    console.log('\n📷 Sample Product Images (first 10):\n');
    
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name}`);
      console.log(`   Image: ${p.images && p.images.length > 0 ? p.images[0] : 'NO IMAGE'}`);
      console.log(`   SKU: ${p.sku || 'NO SKU'}`);
      console.log(`   Item Code: ${p.itemCode || 'NO ITEM CODE'}`);
      console.log(`   Product Code: ${p.productCode || 'NO PRODUCT CODE'}`);
      console.log('');
    });

    // Check how many have placeholder vs real images
    const totalProducts = await Product.countDocuments();
    const productsWithImages = await Product.countDocuments({
      images: { $exists: true, $ne: [], $ne: null }
    });
    const productsWithoutImages = totalProducts - productsWithImages;
    
    console.log('\n📈 Image Statistics:');
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Products with images: ${productsWithImages}`);
    console.log(`Products without images: ${productsWithoutImages}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkProductImages();
