const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

// Enhanced patterns for bathroom products
const enhancedPatterns = {
  // Default colors for common bathroom items
  defaultColors: [
    { keywords: ['toilet', 'basin', 'sink', 'wc'], color: 'White' },
    { keywords: ['tap', 'faucet', 'mixer', 'spout'], color: 'Chrome' },
    { keywords: ['towel bar', 'towel rail', 'towel holder'], color: 'Chrome' },
    { keywords: ['soap dish', 'soap holder'], color: 'Chrome' },
    { keywords: ['robe hook', 'hook'], color: 'Chrome' },
    { keywords: ['tissue holder', 'paper holder'], color: 'Chrome' },
  ],
  
  // Default materials
  defaultMaterials: [
    { keywords: ['toilet', 'basin', 'sink', 'wc', 'urinal'], material: 'Ceramic' },
    { keywords: ['tap', 'faucet', 'mixer', 'spout', 'shower'], material: 'Brass' },
    { keywords: ['towel bar', 'towel rail', 'robe hook', 'hook'], material: 'Stainless Steel' },
    { keywords: ['mirror'], material: 'Glass' },
    { keywords: ['cabinet', 'vanity'], material: 'Wood' },
  ],
  
  // Default warranties
  defaultWarranties: [
    { keywords: ['toilet', 'basin', 'sink', 'wc'], warranty: '10 Years' },
    { keywords: ['tap', 'faucet', 'mixer'], warranty: '5 Years' },
    { keywords: ['shower', 'showerhead'], warranty: '2 Years' },
    { keywords: ['accessory', 'holder', 'hook', 'bar'], warranty: '1 Year' },
  ],
  
  // Size patterns for specific items
  sizePatterns: [
    { keywords: ['single', 'one'], size: 'Single' },
    { keywords: ['double', 'dual', 'two'], size: 'Double' },
    { keywords: ['triple', 'three'], size: 'Triple' },
    { keywords: ['wall-hung', 'wall hung', 'wall mount'], size: 'Wall Mounted' },
    { keywords: ['floor-mounted', 'floor mounted'], size: 'Floor Mounted' },
    { keywords: ['concealed'], size: 'Concealed' },
  ]
};

function findDefaultValue(text, patterns) {
  const lowerText = text.toLowerCase();
  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => lowerText.includes(keyword))) {
      return pattern.color || pattern.material || pattern.warranty || pattern.size;
    }
  }
  return null;
}

async function enhanceSpecifications() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Get products that still need specifications
    const products = await Product.find({
      $or: [
        { 'specifications.color': { $in: [null, ''] } },
        { 'specifications.material': { $in: [null, ''] } },
        { 'specifications.warranty': { $in: [null, ''] } },
      ]
    });

    console.log(`📦 Found ${products.length} products needing enhancement\n`);

    let updated = 0;
    const stats = {
      color: 0,
      size: 0,
      material: 0,
      warranty: 0
    };

    console.log('🔍 Enhancing specifications with intelligent defaults...\n');

    for (const product of products) {
      const searchText = `${product.name} ${product.description || ''} ${product.variant || ''}`;
      
      let hasUpdates = false;
      const updates = {};

      // Add default color if missing
      if (!product.specifications?.color) {
        const color = findDefaultValue(searchText, enhancedPatterns.defaultColors);
        if (color) {
          updates['specifications.color'] = color;
          stats.color++;
          hasUpdates = true;
        }
      }

      // Add default material if missing
      if (!product.specifications?.material) {
        const material = findDefaultValue(searchText, enhancedPatterns.defaultMaterials);
        if (material) {
          updates['specifications.material'] = material;
          stats.material++;
          hasUpdates = true;
        }
      }

      // Add default warranty if missing
      if (!product.specifications?.warranty) {
        const warranty = findDefaultValue(searchText, enhancedPatterns.defaultWarranties);
        if (warranty) {
          updates['specifications.warranty'] = warranty;
          stats.warranty++;
          hasUpdates = true;
        }
      }

      // Add size info if missing
      if (!product.specifications?.size) {
        const size = findDefaultValue(searchText, enhancedPatterns.sizePatterns);
        if (size) {
          updates['specifications.size'] = size;
          stats.size++;
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        await Product.updateOne(
          { _id: product._id },
          { $set: updates }
        );
        updated++;
        
        if (updated <= 15) {
          console.log(`✅ ${product.name}`);
          if (updates['specifications.color']) console.log(`   Color: ${updates['specifications.color']}`);
          if (updates['specifications.size']) console.log(`   Size: ${updates['specifications.size']}`);
          if (updates['specifications.material']) console.log(`   Material: ${updates['specifications.material']}`);
          if (updates['specifications.warranty']) console.log(`   Warranty: ${updates['specifications.warranty']}`);
          console.log('');
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 ENHANCEMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Products Enhanced: ${updated}`);
    console.log('');
    console.log('Specifications Added:');
    console.log(`  🎨 Colors: ${stats.color}`);
    console.log(`  📏 Sizes: ${stats.size}`);
    console.log(`  🔧 Materials: ${stats.material}`);
    console.log(`  ⏰ Warranties: ${stats.warranty}`);
    console.log('='.repeat(60));

    // Show final statistics
    const allProducts = await Product.find({});
    const totalWithColor = allProducts.filter(p => p.specifications?.color).length;
    const totalWithSize = allProducts.filter(p => p.specifications?.size).length;
    const totalWithMaterial = allProducts.filter(p => p.specifications?.material).length;
    const totalWithWarranty = allProducts.filter(p => p.specifications?.warranty).length;

    console.log('\n📈 FINAL DATABASE STATISTICS:');
    console.log(`Total Products: ${allProducts.length}`);
    console.log(`Products with Color: ${totalWithColor} (${Math.round(totalWithColor/allProducts.length*100)}%)`);
    console.log(`Products with Size: ${totalWithSize} (${Math.round(totalWithSize/allProducts.length*100)}%)`);
    console.log(`Products with Material: ${totalWithMaterial} (${Math.round(totalWithMaterial/allProducts.length*100)}%)`);
    console.log(`Products with Warranty: ${totalWithWarranty} (${Math.round(totalWithWarranty/allProducts.length*100)}%)`);

    // Show unique values
    const uniqueColors = [...new Set(allProducts.map(p => p.specifications?.color).filter(Boolean))];
    const uniqueMaterials = [...new Set(allProducts.map(p => p.specifications?.material).filter(Boolean))];
    const uniqueWarranties = [...new Set(allProducts.map(p => p.specifications?.warranty).filter(Boolean))];

    console.log('\n📋 AVAILABLE FILTER OPTIONS:');
    console.log(`\nColors (${uniqueColors.length}):`, uniqueColors.join(', '));
    console.log(`\nMaterials (${uniqueMaterials.length}):`, uniqueMaterials.join(', '));
    console.log(`\nWarranties (${uniqueWarranties.length}):`, uniqueWarranties.join(', '));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

enhanceSpecifications();
