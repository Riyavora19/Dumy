const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function removeProductCodePrefix() {
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
      
      // Remove product code prefix pattern: "XXX_" or "XXX." or "XXX " at the start
      // Matches patterns like: "035_", "034_", "D09_", "068.", "043 ", etc.
      const cleanedName = originalName.replace(/^[A-Za-z0-9]+[_\.\s-]+/, '');
      
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
    console.log(`⏭️  Skipped: ${skippedCount} products (no prefix found)`);
    console.log(`📦 Total: ${products.length} products`);

    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeProductCodePrefix();
