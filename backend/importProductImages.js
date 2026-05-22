const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';
const SOURCE_DIR = 'C:\\Users\\Admin\\Desktop\\product-images-original';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function importProductImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Check if source directory exists
    if (!fs.existsSync(SOURCE_DIR)) {
      console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
      console.error('Please make sure the folder exists and contains your product images.');
      process.exit(1);
    }

    // Get all image files from source directory
    const imageFiles = fs.readdirSync(SOURCE_DIR).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    console.log(`📁 Found ${imageFiles.length} image files in source folder\n`);

    if (imageFiles.length === 0) {
      console.error('❌ No image files found in the source directory!');
      process.exit(1);
    }

    // Show first 5 filenames as sample
    console.log('📋 Sample filenames:');
    imageFiles.slice(0, 5).forEach((file, idx) => {
      console.log(`   ${idx + 1}. ${file}`);
    });
    console.log('');

    // Get all products from database
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products in database\n`);

    let matchedCount = 0;
    let updatedCount = 0;
    let copiedCount = 0;
    let notMatchedProducts = [];
    let notMatchedImages = [];

    // Create a map of product names to image files
    const imageMap = new Map();
    
    imageFiles.forEach(filename => {
      // Extract product name from filename
      // Pattern: "001_Complementary - Square double robe hook.jpg"
      // We want: "Square double robe hook"
      
      const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
      
      // Check if filename contains " - "
      if (nameWithoutExt.includes(' - ')) {
        const productName = nameWithoutExt.split(' - ')[1].trim();
        imageMap.set(productName.toLowerCase(), filename);
      } else {
        // If no " - " separator, try using the whole filename
        imageMap.set(nameWithoutExt.toLowerCase(), filename);
      }
    });

    console.log(`🗺️  Created image map with ${imageMap.size} entries\n`);
    console.log('🔄 Starting to match, copy, and update products...\n');

    // Match and update products
    for (const product of products) {
      const productNameLower = product.name.toLowerCase().trim();
      
      if (imageMap.has(productNameLower)) {
        const originalFilename = imageMap.get(productNameLower);
        const ext = path.extname(originalFilename);
        
        // Create a clean filename for uploads folder
        const cleanFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}${ext}`;
        
        // Copy image to uploads folder
        const sourcePath = path.join(SOURCE_DIR, originalFilename);
        const destPath = path.join(UPLOADS_DIR, cleanFilename);
        
        try {
          fs.copyFileSync(sourcePath, destPath);
          copiedCount++;
          
          // Update product with image path
          const imagePath = `/uploads/${cleanFilename}`;
          product.image = imagePath;
          await product.save();
          
          matchedCount++;
          updatedCount++;
          
          if (updatedCount <= 10) {
            console.log(`✅ ${updatedCount}. "${product.name}" -> ${originalFilename}`);
          } else if (updatedCount % 100 === 0) {
            console.log(`✅ Updated ${updatedCount} products...`);
          }
        } catch (copyError) {
          console.error(`❌ Error copying ${originalFilename}:`, copyError.message);
        }
      } else {
        notMatchedProducts.push(product.name);
      }
    }

    // Find images that weren't matched to any product
    const matchedImages = new Set();
    products.forEach(product => {
      const productNameLower = product.name.toLowerCase().trim();
      if (imageMap.has(productNameLower)) {
        matchedImages.add(imageMap.get(productNameLower));
      }
    });
    
    imageFiles.forEach(filename => {
      if (!matchedImages.has(filename)) {
        notMatchedImages.push(filename);
      }
    });

    console.log('\n📊 RESULTS:');
    console.log(`✅ Successfully matched: ${matchedCount} products`);
    console.log(`✅ Images copied: ${copiedCount} files`);
    console.log(`✅ Database updated: ${updatedCount} products`);
    console.log(`❌ Products not matched: ${notMatchedProducts.length}`);
    console.log(`❌ Images not matched: ${notMatchedImages.length}`);
    
    if (notMatchedProducts.length > 0 && notMatchedProducts.length <= 20) {
      console.log('\n❌ Products without matching images:');
      notMatchedProducts.forEach((name, idx) => {
        console.log(`   ${idx + 1}. ${name}`);
      });
    } else if (notMatchedProducts.length > 20) {
      console.log('\n❌ First 20 products without matching images:');
      notMatchedProducts.slice(0, 20).forEach((name, idx) => {
        console.log(`   ${idx + 1}. ${name}`);
      });
      console.log(`   ... and ${notMatchedProducts.length - 20} more`);
    }

    if (notMatchedImages.length > 0 && notMatchedImages.length <= 20) {
      console.log('\n❌ Images without matching products:');
      notMatchedImages.forEach((name, idx) => {
        console.log(`   ${idx + 1}. ${name}`);
      });
    } else if (notMatchedImages.length > 20) {
      console.log('\n❌ First 20 images without matching products:');
      notMatchedImages.slice(0, 20).forEach((name, idx) => {
        console.log(`   ${idx + 1}. ${name}`);
      });
      console.log(`   ... and ${notMatchedImages.length - 20} more`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

importProductImages();
