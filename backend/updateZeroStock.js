/**
 * updateZeroStock.js
 * Updates all products with stock = 0 to stock = 10 in Atlas MongoDB.
 * Run: node updateZeroStock.js
 * Optional: node updateZeroStock.js 50   ← set custom stock value
 */

require('dotenv').config();
const mongoose = require('mongoose');

const ATLAS_URI = process.env.MONGO_URI;
const NEW_STOCK = parseInt(process.argv[2]) || 10; // default 10, or pass as arg

async function updateZeroStock() {
  if (!ATLAS_URI) {
    console.error('❌  MONGO_URI not set in .env');
    process.exit(1);
  }

  console.log(`🔌  Connecting to Atlas…`);
  await mongoose.connect(ATLAS_URI);
  console.log('✅  Connected\n');

  const collection = mongoose.connection.db.collection('products');

  // Count before
  const zeroCount = await collection.countDocuments({ stock: 0 });
  console.log(`📦  Products with stock = 0 : ${zeroCount}`);

  if (zeroCount === 0) {
    console.log('✅  Nothing to update.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // Update all stock = 0 → NEW_STOCK
  const result = await collection.updateMany(
    { stock: 0 },
    { $set: { stock: NEW_STOCK } }
  );

  console.log(`\n✅  Updated ${result.modifiedCount} products → stock set to ${NEW_STOCK}`);

  // Show a sample of updated products
  const sample = await collection
    .find({ stock: NEW_STOCK })
    .limit(5)
    .project({ name: 1, stock: 1, _id: 0 })
    .toArray();

  console.log('\n📋  Sample updated products:');
  sample.forEach((p, i) => console.log(`   ${i + 1}. ${p.name?.slice(0, 55)} → stock: ${p.stock}`));

  await mongoose.disconnect();
  console.log('\n🔌  Disconnected. Done!');
}

updateZeroStock().catch(err => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
