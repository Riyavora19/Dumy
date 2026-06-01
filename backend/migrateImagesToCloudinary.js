/**
 * migrateImagesToCloudinary.js
 *
 * Reads products from LOCAL MongoDB → uploads their images to Cloudinary
 * → updates the image URLs in ATLAS MongoDB.
 *
 * Run once: node migrateImagesToCloudinary.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const LOCAL_URI  = 'mongodb://localhost:27017/mernapp';
const ATLAS_URI  = process.env.MONGO_URI;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function uploadToCloudinary(filePath, publicId) {
  return cloudinary.uploader.upload(filePath, {
    folder        : 'gtss/products',
    public_id     : publicId,
    overwrite     : false,          // skip if already uploaded
    resource_type : 'image',
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function migrate() {
  // Validate env
  if (!ATLAS_URI) {
    console.error('❌  MONGO_URI not set in .env');
    process.exit(1);
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
    console.error('❌  Cloudinary credentials not set in .env');
    process.exit(1);
  }

  console.log('🔌  Connecting to local MongoDB …');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('✅  Local MongoDB connected');

  console.log('🔌  Connecting to Atlas …');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('✅  Atlas connected\n');

  const localProducts  = localConn.db.collection('products');
  const atlasProducts  = atlasConn.db.collection('products');

  // Fetch all products that still have /uploads/ paths
  const products = await localProducts.find({
    images: { $elemMatch: { $regex: '^/uploads/' } }
  }).toArray();

  console.log(`📦  Found ${products.length} products with local image paths\n`);

  let uploaded = 0, skipped = 0, failed = 0, alreadyDone = 0;

  for (const product of products) {
    const newImages = [];
    let changed = false;

    for (const imgPath of product.images) {
      // Already a Cloudinary / external URL — keep as-is
      if (imgPath.startsWith('http')) {
        newImages.push(imgPath);
        continue;
      }

      // Local path like /uploads/1234567890-123456789.jpeg
      const filename  = path.basename(imgPath);
      const localFile = path.join(UPLOADS_DIR, filename);

      if (!fs.existsSync(localFile)) {
        console.warn(`  ⚠️  File not found, skipping: ${filename}`);
        newImages.push(imgPath); // keep old path so we don't lose the reference
        skipped++;
        continue;
      }

      // Use filename (without extension) as Cloudinary public_id
      const publicId = `gtss/products/${path.parse(filename).name}`;

      try {
        const result = await uploadToCloudinary(localFile, publicId);
        newImages.push(result.secure_url);
        uploaded++;
        changed = true;
        process.stdout.write(`  ☁️  Uploaded: ${filename} → ${result.secure_url.slice(0, 60)}…\n`);
      } catch (err) {
        console.error(`  ❌  Failed to upload ${filename}: ${err.message}`);
        newImages.push(imgPath); // keep old path on failure
        failed++;
      }

      // Small delay to avoid hitting Cloudinary rate limits
      await sleep(100);
    }

    if (changed) {
      // Update the product in Atlas with new Cloudinary URLs
      await atlasProducts.updateOne(
        { _id: product._id },
        { $set: { images: newImages } }
      );
      console.log(`  ✅  Updated product: ${product.name?.slice(0, 50)}`);
    } else {
      alreadyDone++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🎉  Migration complete!');
  console.log(`   ☁️  Uploaded to Cloudinary : ${uploaded}`);
  console.log(`   ✅  Already Cloudinary URLs: ${alreadyDone}`);
  console.log(`   ⚠️  File not found (skipped): ${skipped}`);
  console.log(`   ❌  Upload failed           : ${failed}`);
  console.log('═'.repeat(60) + '\n');

  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌  Unexpected error:', err);
  process.exit(1);
});
