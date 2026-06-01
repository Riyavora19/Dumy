require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const col = mongoose.connection.db.collection('products');
  const companies = mongoose.connection.db.collection('companies');

  const company = await companies.findOne({ _id: new mongoose.Types.ObjectId('6a0439c87a30209968ae25bc') });
  console.log('Company:', company?.name);

  const products = await col.find({
    images: { $elemMatch: { $regex: '^/uploads/' } }
  }).project({ name: 1, companyName: 1, images: 1 }).limit(5).toArray();

  console.log('\nSample products with /uploads/ paths:');
  products.forEach(p => console.log(`  - ${p.name} | company: ${p.companyName} | images: ${p.images}`));

  await mongoose.disconnect();
}
check().catch(console.error);
