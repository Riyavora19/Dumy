const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';
const SOURCE_DIR = 'C:\\Users\\Admin\\Desktop\\product-images-original';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Simple string similarity function
function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

async function importProductImagesFuzzy() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Check if source directory exists
    if (!fs.existsSync(SOURCE_DIR)) {
      console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
      process.exit(1);
    }

    // Get all image files from source directory
    const imageFiles = fs.readdirSync(SOURCE_DIR).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    console.log(`📁 Found ${imageFiles.length} image files in source folder\n`);

    // Get all products that don't have images yet
    const products = await Product.find({ 
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } },
        { images: null }
      ]
    });
    
    console.log(`📦 Found ${products.length} products without images\n`);

    let updatedCount = 0;
    let copiedCount = 0;

    // Create array of image data
    const imageData = imageFiles.map(filename => {
      const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
      let productName = nameWithoutExt;
      
      // Extract product name after " - " if exists
      if (nameWithoutExt.includes(' - ')) {
        productName = nameWithoutExt.split(' - ').slice(1).join(' - ').trim();
      }
      
      return {
        filename,
        productName: productName.toLowerCase(),
        originalName: productName
      };
    });

    console.log('🔄 Starting fuzzy matching (this may take a while)...\n');

    // Match products with fuzzy matching
    for (const product of products) {
      const productNameLower = product.name.toLowerCase().trim();
      
      // Find best match
      let bestMatch = null;
      let bestScore = 0;
      
      for (const imageInfo of imageData) {
        const score = similarity(productNameLower, imageInfo.productName);
        
        // If exact match or very high similarity
        if (score === 1.0) {
          bestMatch = imageInfo;
          bestScore = score;
          break;
        } else if (score > bestScore && score >= 0.7) {
          bestMatch = imageInfo;
          bestScore = score;
        }
      }
      
      if (bestMatch && bestScore >= 0.7) {
        const ext = path.extname(bestMatch.filename);
        const cleanFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000000)}${ext}`;
        
        // Copy image to uploads folder
        const sourcePath = path.join(SOURCE_DIR, bestMatch.filename);
        const destPath = path.join(UPLOADS_DIR, cleanFilename);
        
        try {
          fs.copyFileSync(sourcePath, destPath);
          copiedCount++;
          
          // Update product with image path
          const imagePath = `/uploads/${cleanFilename}`;
          product.images = [imagePath];
          await product.save();
          
          updatedCount++;
          
          if (updatedCount <= 20) {
            console.log(`✅ ${updatedCount}. "${product.name}" -> "${bestMatch.originalName}" (${Math.round(bestScore * 100)}%)`);
          } else if (updatedCount % 50 === 0) {
            console.log(`✅ Updated ${updatedCount} products...`);
          }
        } catch (copyError) {
          console.error(`❌ Error copying ${bestMatch.filename}:`, copyError.message);
        }
      }
    }

    console.log('\n📊 RESULTS:');
    console.log(`✅ Images copied: ${copiedCount} files`);
    console.log(`✅ Database updated: ${updatedCount} products`);
    
    // Check remaining products without images
    const remainingProducts = await Product.find({ 
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } },
        { images: null }
      ]
    });
    
    console.log(`📦 Remaining products without images: ${remainingProducts.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

importProductImagesFuzzy();
