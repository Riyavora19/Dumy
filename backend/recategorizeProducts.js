const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function recategorizeProducts() {
  try {
    console.log('🔄 Starting product recategorization...\n');

    // Get the 3 correct categories
    const faucetCat = await Category.findOne({ name: /^Faucet$/i });
    const accessoriesCat = await Category.findOne({ name: /^Accessories$/i });
    const tilesCat = await Category.findOne({ name: /^Tiles$/i });

    if (!faucetCat || !accessoriesCat || !tilesCat) {
      console.error('❌ One or more required categories not found!');
      console.log('Faucet:', faucetCat?._id);
      console.log('Accessories:', accessoriesCat?._id);
      console.log('Tiles:', tilesCat?._id);
      process.exit(1);
    }

    console.log('✅ Found categories:');
    console.log('  - Faucet:', faucetCat._id);
    console.log('  - Accessories:', accessoriesCat._id);
    console.log('  - Tiles:', tilesCat._id);
    console.log('');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to recategorize\n`);

    // Categorization keywords
    const categoryKeywords = {
      'Faucet': [
        'faucet', 'tap', 'mixer', 'spout', 'shower', 'basin', 'sink', 
        'diverter', 'valve', 'cock', 'bib', 'pillar', 'wall mixer',
        'overhead', 'hand shower', 'telephonic', 'concealed', 'exposed',
        'lever', 'aquamax'
      ],
      'Accessories': [
        'accessories', 'accessory', 'soap', 'dispenser', 'holder', 'rack',
        'towel', 'robe', 'hook', 'shelf', 'grab bar', 'rail', 'ring',
        'tumbler', 'brush', 'paper holder', 'napkin', 'mirror', 'glass',
        'bottle', 'tray', 'basket', 'corner', 'stand'
      ],
      'Tiles': [
        'tile', 'tiles', 'ceramic', 'porcelain', 'vitrified', 'mosaic',
        'wall tile', 'floor tile', 'slab', 'marble', 'granite'
      ]
    };

    let faucetCount = 0;
    let accessoriesCount = 0;
    let tilesCount = 0;

    // Recategorize each product
    for (const product of products) {
      const nameLower = product.name.toLowerCase();
      let newCategory = accessoriesCat._id; // Default to Accessories
      let categoryName = 'Accessories';

      // Check for Faucet keywords
      for (const keyword of categoryKeywords.Faucet) {
        if (nameLower.includes(keyword)) {
          newCategory = faucetCat._id;
          categoryName = 'Faucet';
          faucetCount++;
          break;
        }
      }

      // Check for Tiles keywords (if not already Faucet)
      if (categoryName === 'Accessories') {
        for (const keyword of categoryKeywords.Tiles) {
          if (nameLower.includes(keyword)) {
            newCategory = tilesCat._id;
            categoryName = 'Tiles';
            tilesCount++;
            break;
          }
        }
      }

      // Check for Accessories keywords (if still default)
      if (categoryName === 'Accessories') {
        let foundAccessory = false;
        for (const keyword of categoryKeywords.Accessories) {
          if (nameLower.includes(keyword)) {
            foundAccessory = true;
            break;
          }
        }
        if (foundAccessory || categoryName === 'Accessories') {
          accessoriesCount++;
        }
      }

      // Update product category
      product.category = newCategory;
      await product.save();
      console.log(`✓ ${product.name.substring(0, 50)}... → ${categoryName}`);
    }

    console.log('\n✅ Recategorization complete!');
    console.log(`  - Faucet: ${faucetCount} products`);
    console.log(`  - Accessories: ${accessoriesCount} products`);
    console.log(`  - Tiles: ${tilesCount} products`);
    console.log('');

    // Delete old unwanted categories
    console.log('🗑️  Deleting old categories...');
    const oldCategories = await Category.find({
      name: { $nin: ['Faucet', 'Accessories', 'Tiles'] }
    });

    for (const cat of oldCategories) {
      await Category.findByIdAndDelete(cat._id);
      console.log(`  ✓ Deleted: ${cat.name}`);
    }

    console.log('\n✅ All done! You now have only 3 categories.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

recategorizeProducts();
