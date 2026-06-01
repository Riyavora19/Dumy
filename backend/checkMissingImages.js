require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const col = mongoose.connection.db.collection('products');

  // Products with no images or empty images array
  const noImages = await col.find({
    $or: [
      { images: { $exists: false } },
      { images: { $size: 0 } },
      { images: null }
    ]
  }).project({ name: 1, companyName: 1, images: 1 }).toArray();

  // Products still with /uploads/ paths
  const localPaths = await col.find({
    images: { $elemMatch: { $regex: '^/uploads/' } }
  }).project({ name: 1, companyName: 1, images: 1 }).toArray();

  console.log(`\n📦 Products with NO images: ${noImages.length}`);
  const byCompanyNo = {};
  noImages.forEach(p => {
    const c = p.companyName || 'Unknown';
    byCompanyNo[c] = (byCompanyNo[c] || 0) + 1;
  });
  Object.entries(byCompanyNo).sort((a,b) => b[1]-a[1]).forEach(([c,n]) => console.log(`   ${c}: ${n}`));

  console.log(`\n📦 Products still with /uploads/ paths: ${localPaths.length}`);
  const byCompanyLocal = {};
  localPaths.forEach(p => {
    const c = p.companyName || 'Unknown';
    byCompanyLocal[c] = (byCompanyLocal[c] || 0) + 1;
  });
  Object.entries(byCompanyLocal).sort((a,b) => b[1]-a[1]).forEach(([c,n]) => console.log(`   ${c}: ${n}`));

  await mongoose.disconnect();
}
check().catch(console.error);
