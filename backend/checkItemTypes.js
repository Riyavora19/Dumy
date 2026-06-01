require('dotenv').config();
const mongoose = require('mongoose');
const ProductItemType = require('./models/ProductItemType');
const RoomTemplate = require('./models/RoomTemplate');

async function checkItemTypes() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Check item types
    const itemTypes = await ProductItemType.find();
    console.log(`📦 Found ${itemTypes.length} ProductItemTypes:`);
    itemTypes.forEach(it => {
      console.log(`  - ${it.name} (ID: ${it._id})`);
    });

    // Check room template references
    console.log('\n🔍 Checking room template references...');
    const templates = await RoomTemplate.find();
    
    for (const template of templates) {
      console.log(`\n📋 ${template.name}:`);
      for (const item of template.requiredItems) {
        const exists = itemTypes.find(it => it._id.toString() === item.itemType.toString());
        if (exists) {
          console.log(`  ✓ ${item.itemName} → ${exists.name}`);
        } else {
          console.log(`  ❌ ${item.itemName} → BROKEN REFERENCE (${item.itemType})`);
        }
      }
    }

    console.log('\n💡 Solution: Either create the missing ProductItemTypes or update room templates with valid itemType IDs');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

checkItemTypes();
