const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

// Common color patterns
const colorPatterns = [
  { regex: /\b(white|ivory|off-white)\b/i, value: 'White' },
  { regex: /\b(black|matte black|glossy black)\b/i, value: 'Black' },
  { regex: /\b(chrome|polished chrome|brushed chrome)\b/i, value: 'Chrome' },
  { regex: /\b(silver|metallic silver)\b/i, value: 'Silver' },
  { regex: /\b(gold|golden|rose gold|brushed gold)\b/i, value: 'Gold' },
  { regex: /\b(grey|gray|charcoal)\b/i, value: 'Grey' },
  { regex: /\b(beige|cream|bone)\b/i, value: 'Beige' },
  { regex: /\b(brown|walnut|oak)\b/i, value: 'Brown' },
  { regex: /\b(blue|navy|sky blue)\b/i, value: 'Blue' },
  { regex: /\b(green|olive|mint)\b/i, value: 'Green' },
  { regex: /\b(red|maroon|burgundy)\b/i, value: 'Red' },
  { regex: /\b(pink|rose)\b/i, value: 'Pink' },
  { regex: /\b(bronze|antique bronze)\b/i, value: 'Bronze' },
  { regex: /\b(copper|brushed copper)\b/i, value: 'Copper' },
  { regex: /\b(brass|brushed brass|antique brass)\b/i, value: 'Brass' },
  { regex: /\b(nickel|brushed nickel|satin nickel)\b/i, value: 'Nickel' },
  { regex: /\b(stainless steel|ss)\b/i, value: 'Stainless Steel' },
];

// Size patterns (measurements)
const sizePatterns = [
  { regex: /(\d+\.?\d*)\s*(cm|centimeter|centimeters)/i, extract: true },
  { regex: /(\d+\.?\d*)\s*(mm|millimeter|millimeters)/i, extract: true },
  { regex: /(\d+\.?\d*)\s*(inch|inches|")/i, extract: true },
  { regex: /(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*(cm|mm|inch|inches)/i, extract: true },
  { regex: /(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*(cm|mm|inch|inches)/i, extract: true },
];

// Material patterns
const materialPatterns = [
  { regex: /\b(ceramic|vitreous china|porcelain)\b/i, value: 'Ceramic' },
  { regex: /\b(stainless steel|ss|steel)\b/i, value: 'Stainless Steel' },
  { regex: /\b(brass|solid brass)\b/i, value: 'Brass' },
  { regex: /\b(plastic|abs|pvc)\b/i, value: 'Plastic' },
  { regex: /\b(glass|tempered glass)\b/i, value: 'Glass' },
  { regex: /\b(wood|wooden|timber)\b/i, value: 'Wood' },
  { regex: /\b(marble|granite|stone)\b/i, value: 'Stone' },
  { regex: /\b(acrylic)\b/i, value: 'Acrylic' },
  { regex: /\b(copper)\b/i, value: 'Copper' },
  { regex: /\b(aluminum|aluminium)\b/i, value: 'Aluminum' },
  { regex: /\b(zinc|zinc alloy)\b/i, value: 'Zinc Alloy' },
  { regex: /\b(chrome plated|chrome-plated)\b/i, value: 'Chrome Plated' },
];

// Warranty patterns
const warrantyPatterns = [
  { regex: /(\d+)\s*year\s*warranty/i, extract: true },
  { regex: /(\d+)\s*yr\s*warranty/i, extract: true },
  { regex: /warranty[:\s]*(\d+)\s*year/i, extract: true },
  { regex: /lifetime\s*warranty/i, value: 'Lifetime' },
  { regex: /\b(\d+)\s*years?\b/i, extract: true, context: 'warranty' },
];

function extractColor(text) {
  for (const pattern of colorPatterns) {
    if (pattern.regex.test(text)) {
      return pattern.value;
    }
  }
  return null;
}

function extractSize(text) {
  for (const pattern of sizePatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      return match[0].trim();
    }
  }
  return null;
}

function extractMaterial(text) {
  for (const pattern of materialPatterns) {
    if (pattern.regex.test(text)) {
      return pattern.value;
    }
  }
  return null;
}

function extractWarranty(text) {
  for (const pattern of warrantyPatterns) {
    if (pattern.extract) {
      const match = text.match(pattern.regex);
      if (match && match[1]) {
        return `${match[1]} Year${match[1] > 1 ? 's' : ''}`;
      }
    } else if (pattern.value && pattern.regex.test(text)) {
      return pattern.value;
    }
  }
  return null;
}

async function extractAndUpdateSpecifications() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    let updated = 0;
    let skipped = 0;
    const stats = {
      color: 0,
      size: 0,
      material: 0,
      warranty: 0
    };

    console.log('🔍 Extracting specifications from product names...\n');

    for (const product of products) {
      const searchText = `${product.name} ${product.description || ''} ${product.variant || ''}`.toLowerCase();
      
      let hasUpdates = false;
      const updates = {};

      // Extract Color
      if (!product.specifications?.color) {
        const color = extractColor(searchText);
        if (color) {
          updates['specifications.color'] = color;
          stats.color++;
          hasUpdates = true;
        }
      }

      // Extract Size
      if (!product.specifications?.size) {
        const size = extractSize(searchText);
        if (size) {
          updates['specifications.size'] = size;
          stats.size++;
          hasUpdates = true;
        }
      }

      // Extract Material
      if (!product.specifications?.material) {
        const material = extractMaterial(searchText);
        if (material) {
          updates['specifications.material'] = material;
          stats.material++;
          hasUpdates = true;
        }
      }

      // Extract Warranty
      if (!product.specifications?.warranty) {
        const warranty = extractWarranty(searchText);
        if (warranty) {
          updates['specifications.warranty'] = warranty;
          stats.warranty++;
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        await Product.updateOne(
          { _id: product._id },
          { $set: updates }
        );
        updated++;
        
        if (updated <= 10) {
          console.log(`✅ ${product.name}`);
          if (updates['specifications.color']) console.log(`   Color: ${updates['specifications.color']}`);
          if (updates['specifications.size']) console.log(`   Size: ${updates['specifications.size']}`);
          if (updates['specifications.material']) console.log(`   Material: ${updates['specifications.material']}`);
          if (updates['specifications.warranty']) console.log(`   Warranty: ${updates['specifications.warranty']}`);
          console.log('');
        }
      } else {
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 EXTRACTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Products: ${products.length}`);
    console.log(`Products Updated: ${updated}`);
    console.log(`Products Skipped: ${skipped}`);
    console.log('');
    console.log('Specifications Extracted:');
    console.log(`  🎨 Colors: ${stats.color}`);
    console.log(`  📏 Sizes: ${stats.size}`);
    console.log(`  🔧 Materials: ${stats.material}`);
    console.log(`  ⏰ Warranties: ${stats.warranty}`);
    console.log('='.repeat(60));

    // Show unique values
    const allProducts = await Product.find({});
    const uniqueColors = [...new Set(allProducts.map(p => p.specifications?.color).filter(Boolean))];
    const uniqueSizes = [...new Set(allProducts.map(p => p.specifications?.size).filter(Boolean))];
    const uniqueMaterials = [...new Set(allProducts.map(p => p.specifications?.material).filter(Boolean))];
    const uniqueWarranties = [...new Set(allProducts.map(p => p.specifications?.warranty).filter(Boolean))];

    console.log('\n📋 UNIQUE VALUES FOUND:');
    console.log('\nColors:', uniqueColors.length > 0 ? uniqueColors.join(', ') : 'None');
    console.log('\nSizes:', uniqueSizes.length > 0 ? uniqueSizes.slice(0, 10).join(', ') + (uniqueSizes.length > 10 ? '...' : '') : 'None');
    console.log('\nMaterials:', uniqueMaterials.length > 0 ? uniqueMaterials.join(', ') : 'None');
    console.log('\nWarranties:', uniqueWarranties.length > 0 ? uniqueWarranties.join(', ') : 'None');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

extractAndUpdateSpecifications();
