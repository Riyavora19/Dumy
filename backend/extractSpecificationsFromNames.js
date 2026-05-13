const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function extractSpecifications() {
  try {
    console.log('🔄 Starting specification extraction from product names...\n');

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to process\n`);

    // Common color keywords
    const colorKeywords = {
      'Chrome': ['chrome', 'chr'],
      'Black': ['black', 'blk', 'blck'],
      'White': ['white', 'wht'],
      'Gold': ['gold', 'gld'],
      'Silver': ['silver', 'slvr'],
      'Bronze': ['bronze', 'brz', 'antique bronze'],
      'Copper': ['copper', 'cpr', 'antique copper'],
      'Graphite': ['graphite', 'grf', 'grp'],
      'Matt': ['matt', 'matte', 'mat'],
      'Beige': ['beige', 'bge'],
      'Grey': ['grey', 'gray', 'gry'],
      'Dark': ['dark'],
      'Rose Gold': ['rose gold', 'rsg']
    };

    // Common material keywords
    const materialKeywords = {
      'Stainless Steel': ['stainless steel', 'ss', 'steel'],
      'Brass': ['brass', 'brs'],
      'Ceramic': ['ceramic', 'cera'],
      'Marble': ['marble', 'mrbl'],
      'Artificial Marble': ['artificial marble'],
      'Porcelain': ['porcelain'],
      'Plastic': ['plastic', 'pvc'],
      'Glass': ['glass'],
      'Acrylic': ['acrylic']
    };

    // Common size patterns (numbers followed by units)
    const sizePattern = /(\d+(?:x\d+)?(?:x\d+)?)\s*(mm|cm|inch|"|')?/gi;

    let updatedCount = 0;

    for (const product of products) {
      const nameLower = product.name.toLowerCase();
      let updated = false;

      // Extract color
      if (!product.specifications?.color) {
        for (const [color, keywords] of Object.entries(colorKeywords)) {
          for (const keyword of keywords) {
            if (nameLower.includes(keyword.toLowerCase())) {
              if (!product.specifications) product.specifications = {};
              product.specifications.color = color;
              updated = true;
              break;
            }
          }
          if (updated) break;
        }
      }

      // Extract material
      if (!product.specifications?.material) {
        for (const [material, keywords] of Object.entries(materialKeywords)) {
          for (const keyword of keywords) {
            if (nameLower.includes(keyword.toLowerCase())) {
              if (!product.specifications) product.specifications = {};
              product.specifications.material = material;
              updated = true;
              break;
            }
          }
          if (updated) break;
        }
      }

      // Extract size
      if (!product.specifications?.size) {
        const sizeMatches = product.name.match(sizePattern);
        if (sizeMatches && sizeMatches.length > 0) {
          // Get the most relevant size (usually the first or largest)
          const size = sizeMatches[0].trim();
          if (!product.specifications) product.specifications = {};
          product.specifications.size = size;
          updated = true;
        }
      }

      // Set default warranty if not present
      if (!product.specifications?.warranty) {
        if (!product.specifications) product.specifications = {};
        product.specifications.warranty = '1 Year';
        updated = true;
      }

      if (updated) {
        await product.save();
        updatedCount++;
        
        if (updatedCount % 100 === 0) {
          console.log(`✓ Processed ${updatedCount} products...`);
        }
      }
    }

    console.log(`\n✅ Successfully extracted specifications for ${updatedCount} products!`);
    console.log('\nSample specifications extracted:');
    
    // Show some examples
    const samplesWithSpecs = await Product.find({
      'specifications.color': { $exists: true }
    }).limit(5);
    
    samplesWithSpecs.forEach(p => {
      console.log(`\n  ${p.name.substring(0, 60)}...`);
      console.log(`    Color: ${p.specifications?.color || 'N/A'}`);
      console.log(`    Material: ${p.specifications?.material || 'N/A'}`);
      console.log(`    Size: ${p.specifications?.size || 'N/A'}`);
      console.log(`    Warranty: ${p.specifications?.warranty || 'N/A'}`);
    });

    console.log('\n✅ All done! Filters will now show automatically.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

extractSpecifications();
