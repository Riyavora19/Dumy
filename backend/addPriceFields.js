// Script to add purchasePrice and suggestedPrice to all products
// purchasePrice = ~55-65% of MRP (our cost)
// suggestedPrice = ~75-85% of MRP (what we suggest selling at)

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI;

async function addPriceFields() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const products = await Product.find({});
  console.log(`Found ${products.length} products`);

  let updated = 0;

  for (const product of products) {
    const basePrice = product.mrp || product.price || 0;
    if (basePrice === 0) continue;

    // Purchase price: 55-65% of MRP (randomized per product)
    const purchasePct = 0.55 + (Math.random() * 0.10); // 55% to 65%
    const purchasePrice = Math.round(basePrice * purchasePct);

    // Suggested selling price: 80-90% of MRP (our recommended sell price)
    const suggestedPct = 0.80 + (Math.random() * 0.10); // 80% to 90%
    const suggestedPrice = Math.round(basePrice * suggestedPct);

    await Product.findByIdAndUpdate(product._id, {
      npp: purchasePrice,   // Net Purchase Price (our cost)
      sdp: suggestedPrice,  // Suggested Dealer Price (our sell price)
    });

    updated++;
  }

  console.log(`✅ Updated ${updated} products with purchasePrice (npp) and suggestedPrice (sdp)`);
  await mongoose.disconnect();
}

addPriceFields().catch(console.error);
