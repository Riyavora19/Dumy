const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function removeBeforeDash() {
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
      let cleanedName = originalName;
      let wasUpdated = false;
      
      // Check if the name contains various dash patterns
      // Pattern 1: " - " (space dash space)
      if (cleanedName.includes(' - ')) {
        const parts = cleanedName.split(' - ');
        cleanedName = parts.slice(1).join(' - ').trim();
        wasUpdated = true;
      }
      // Pattern 2: "™ - " or "® - " (trademark/registered symbols with dash)
      else if (cleanedName.match(/[™®]\s*-\s*/)) {
        cleanedName = cleanedName.replace(/^.*?[™®]\s*-\s*/, '').trim();
        wasUpdated = true;
      }
      // Pattern 3: " – " (en dash with spaces)
      else if (cleanedName.includes(' – ')) {
        const parts = cleanedName.split(' – ');
        cleanedName = parts.slice(1).join(' – ').trim();
        wasUpdated = true;
      }
      // Pattern 4: Starts with "– " (en dash at the beginning)
      else if (cleanedName.startsWith('– ')) {
        cleanedName = cleanedName.replace(/^–\s*/, '').trim();
        wasUpdated = true;
      }
      // Pattern 5: Starts with "- " (regular dash at the beginning)
      else if (cleanedName.startsWith('- ')) {
        cleanedName = cleanedName.replace(/^-\s*/, '').trim();
        wasUpdated = true;
      }
      
      // Only update if the name actually changed and is not empty
      if (wasUpdated && cleanedName !== originalName && cleanedName.length > 0) {
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
    console.log(`⏭️  Skipped: ${skippedCount} products (no " - " found or empty result)`);
    console.log(`📦 Total: ${products.length} products`);

    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeBeforeDash();
