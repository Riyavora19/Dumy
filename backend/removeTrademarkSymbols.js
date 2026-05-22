const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function removeTrademarkSymbols() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const originalName = product.name;
      
      // Remove trademark and registered symbols
      let cleanedName = originalName
        .replace(/™/g, '')
        .replace(/®/g, '')
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
      
      // Only update if the name actually changed
      if (cleanedName !== originalName && cleanedName.length > 0) {
        product.name = cleanedName;
        await product.save();
        console.log(`✏️  Updated: "${originalName}" → "${cleanedName}"`);
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Updated: ${updatedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products (no symbols found)`);
    console.log(`📦 Total: ${products.length} products`);

    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeTrademarkSymbols();
