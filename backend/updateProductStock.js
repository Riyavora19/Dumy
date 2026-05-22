const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function updateProductStock() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    // Count products with 0 stock
    const outOfStock = products.filter(p => !p.stock || p.stock === 0).length;
    console.log(`❌ Products out of stock: ${outOfStock}`);
    console.log(`✅ Products in stock: ${products.length - outOfStock}\n`);

    console.log('🔄 Updating stock levels...\n');

    let updated = 0;

    for (const product of products) {
      // If stock is 0 or undefined, set a random stock between 5-50
      if (!product.stock || product.stock === 0) {
        const randomStock = Math.floor(Math.random() * 46) + 5; // 5-50
        await Product.updateOne(
          { _id: product._id },
          { stock: randomStock }
        );
        updated++;

        if (updated <= 10) {
          console.log(`✅ ${product.name}`);
          console.log(`   Stock: 0 → ${randomStock}\n`);
        }
      }
    }

    if (updated > 10) {
      console.log(`... and ${updated - 10} more products\n`);
    }

    console.log('='.repeat(60));
    console.log('📊 STOCK UPDATE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Products: ${products.length}`);
    console.log(`Products Updated: ${updated}`);
    console.log(`Products Already in Stock: ${products.length - updated}`);
    console.log('='.repeat(60));

    // Verify the update
    const stillOutOfStock = await Product.countDocuments({ $or: [{ stock: 0 }, { stock: null }] });
    const nowInStock = await Product.countDocuments({ stock: { $gt: 0 } });

    console.log('\n✅ VERIFICATION:');
    console.log(`Products in stock: ${nowInStock}`);
    console.log(`Products out of stock: ${stillOutOfStock}`);

    if (stillOutOfStock === 0) {
      console.log('\n🎉 SUCCESS! All products now have stock!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

updateProductStock();
