const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const ProductItemType = require('./models/ProductItemType');
const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

// Mapping from category to budget planner itemType
const categoryToItemTypeMap = {
  'Toilet': 'Toilet Seat',
  'Shower': 'Shower Head',
  'Wash Basin': 'Wash Basin',
  'Faucet': 'Tap/Faucet',
  'Bathtub': 'Toilet Seat', // No bathtub in budget planner, use toilet
  'Mirror': 'Mirror',
  'Tiles': 'Bathroom Tiles',
  'Cabinet': 'Bathroom Cabinet'
};

async function updateProductItemTypes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const categories = await Category.find();
    const itemTypes = await ProductItemType.find();
    
    console.log('Updating products with budget planner itemTypes...\n');
    
    let updated = 0;
    
    for (const category of categories) {
      const targetItemTypeName = categoryToItemTypeMap[category.name];
      if (!targetItemTypeName) {
        console.log(`⚠️  No mapping for category: ${category.name}`);
        continue;
      }
      
      const itemType = itemTypes.find(it => it.name === targetItemTypeName);
      if (!itemType) {
        console.log(`⚠️  ItemType not found: ${targetItemTypeName}`);
        continue;
      }
      
      const result = await Product.updateMany(
        { category: category._id },
        { 
          $set: { 
            itemType: itemType._id,
            itemTypeName: itemType.name
          } 
        }
      );
      
      console.log(`✓ ${category.icon} ${category.name} → ${itemType.name}: ${result.modifiedCount} products updated`);
      updated += result.modifiedCount;
    }
    
    console.log(`\n✅ Total products updated: ${updated}`);
    
    // Verify
    const withItemType = await Product.countDocuments({ itemType: { $ne: null } });
    const total = await Product.countDocuments();
    console.log(`\n📊 Products with itemType: ${withItemType}/${total}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

updateProductItemTypes();
