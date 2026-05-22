const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function checkProductSpecifications() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const products = await Product.find({}).limit(20);
    
    console.log(`📊 Checking first 20 products for specifications:\n`);
    
    let withColor = 0;
    let withSize = 0;
    let withMaterial = 0;
    let withWarranty = 0;
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Color: ${product.specifications?.color || 'NOT SET'}`);
      console.log(`   Size: ${product.specifications?.size || 'NOT SET'}`);
      console.log(`   Material: ${product.specifications?.material || 'NOT SET'}`);
      console.log(`   Warranty: ${product.specifications?.warranty || 'NOT SET'}`);
      console.log('');
      
      if (product.specifications?.color) withColor++;
      if (product.specifications?.size) withSize++;
      if (product.specifications?.material) withMaterial++;
      if (product.specifications?.warranty) withWarranty++;
    });
    
    console.log('\n📈 Summary:');
    console.log(`Products with Color: ${withColor}/${products.length}`);
    console.log(`Products with Size: ${withSize}/${products.length}`);
    console.log(`Products with Material: ${withMaterial}/${products.length}`);
    console.log(`Products with Warranty: ${withWarranty}/${products.length}`);
    
    // Check total counts
    const totalProducts = await Product.countDocuments();
    const productsWithColor = await Product.countDocuments({ 'specifications.color': { $exists: true, $ne: null, $ne: '' } });
    const productsWithSize = await Product.countDocuments({ 'specifications.size': { $exists: true, $ne: null, $ne: '' } });
    const productsWithMaterial = await Product.countDocuments({ 'specifications.material': { $exists: true, $ne: null, $ne: '' } });
    
    console.log(`\n📊 Total Database Stats:`);
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Products with Color: ${productsWithColor}`);
    console.log(`Products with Size: ${productsWithSize}`);
    console.log(`Products with Material: ${productsWithMaterial}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkProductSpecifications();
