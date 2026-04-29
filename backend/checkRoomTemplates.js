const mongoose = require('mongoose');
require('dotenv').config();
const RoomTemplate = require('./models/RoomTemplate');
const ProductItemType = require('./models/ProductItemType');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function checkRoomTemplates() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const templates = await RoomTemplate.find().populate('requiredItems.itemType');
    
    console.log(`Found ${templates.length} room templates:\n`);
    
    templates.forEach(template => {
      console.log(`📋 ${template.name}`);
      console.log(`   ID: ${template._id}`);
      console.log(`   Required Items: ${template.requiredItems.length}`);
      template.requiredItems.forEach(item => {
        console.log(`     - ${item.itemName}: ${item.itemType?.name || 'N/A'} (${item.budgetAllocation}%)`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkRoomTemplates();
