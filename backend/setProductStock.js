const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function setProductStock() {
  try {
    console.log('🔄 Starting stock update...\n');

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to update\n`);

    let updatedCount = 0;

    // Set random stock between 5 and 50 for all products
    for (const product of products) {
      // Generate random stock between 5 and 50
      const randomStock = Math.floor(Math.random() * (50 - 5 + 1)) + 5;
      
      product.stock = randomStock;
      await product.save();
      updatedCount++;
      
      if (updatedCount % 100 === 0) {
        console.log(`✓ Updated ${updatedCount} products...`);
      }
    }

    console.log(`\n✅ Successfully updated stock for all ${updatedCount} products!`);
    console.log('All products now have stock between 5 and 50 units.');
    
    // Show some examples
    const samples = await Product.find({}).limit(5);
    console.log('\nSample products with stock:');
    samples.forEach(p => {
      console.log(`  ${p.name.substring(0, 50)}... → Stock: ${p.stock}`);
    });

    console.log('\n✅ All done! Products are now in stock.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setProductStock();
