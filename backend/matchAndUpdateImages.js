const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

async function matchAndUpdateImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Get all image files from uploads directory
    const imageFiles = fs.readdirSync(UPLOADS_DIR).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    console.log(`📁 Found ${imageFiles.length} image files in uploads folder\n`);

    // Get all products from database
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products in database\n`);

    let matchedCount = 0;
    let updatedCount = 0;
    let notMatchedProducts = [];

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
      }
    });

    console.log(`🗺️  Created image map with ${imageMap.size} entries\n`);
    console.log('🔄 Starting to match and update products...\n');

    // Match and update products
    for (const product of products) {
      const productNameLower = product.name.toLowerCase().trim();
      
      if (imageMap.has(productNameLower)) {
        const imageFilename = imageMap.get(productNameLower);
        const imagePath = `/uploads/${imageFilename}`;
        
        // Update product with image path
        product.image = imagePath;
        await product.save();
        
        matchedCount++;
        updatedCount++;
        
        if (updatedCount <= 10) {
          console.log(`✅ ${updatedCount}. Updated: "${product.name}" -> ${imageFilename}`);
        } else if (updatedCount % 100 === 0) {
          console.log(`✅ Updated ${updatedCount} products...`);
        }
      } else {
        notMatchedProducts.push(product.name);
      }
    }

    console.log('\n📊 RESULTS:');
    console.log(`✅ Successfully matched and updated: ${updatedCount} products`);
    console.log(`❌ Not matched: ${notMatchedProducts.length} products`);
    
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

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

matchAndUpdateImages();
