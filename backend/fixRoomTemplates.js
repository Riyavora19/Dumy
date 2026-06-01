require('dotenv').config();
const mongoose = require('mongoose');
const RoomTemplate = require('./models/RoomTemplate');

async function fixRoomTemplates() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    const templates = await RoomTemplate.find();
    console.log(`📋 Fixing ${templates.length} room templates...\n`);

    for (const template of templates) {
      console.log(`Fixing: ${template.name}`);
      
      // Remove itemType references from all requiredItems
      template.requiredItems = template.requiredItems.map(item => ({
        itemName: item.itemName,
        isEssential: item.isEssential,
        quantity: item.quantity,
        budgetAllocation: item.budgetAllocation,
        priceRange: item.priceRange,
        priority: item.priority
        // itemType is removed
      }));
      
      await template.save();
      console.log(`  ✓ Removed ${template.requiredItems.length} broken itemType references`);
    }

    console.log('\n✅ All room templates fixed!');
    console.log('Room templates now work without ProductItemType references.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

fixRoomTemplates();
