require('dotenv').config();
const mongoose = require('mongoose');
const RoomTemplate = require('./models/RoomTemplate');
const ProductItemType = require('./models/ProductItemType');

async function checkRoomTemplates() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI not found in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Check room templates
    const templates = await RoomTemplate.find();
    console.log(`\n📋 Found ${templates.length} room templates in database`);
    
    if (templates.length > 0) {
      templates.forEach(t => {
        console.log(`  - ${t.name} (${t.requiredItems?.length || 0} items)`);
      });
    } else {
      console.log('⚠️  No room templates found!');
      console.log('\nCreating sample room templates...');
      
      // Get some item types to use
      const itemTypes = await ProductItemType.find().limit(5);
      console.log(`Found ${itemTypes.length} item types to use`);
      
      if (itemTypes.length === 0) {
        console.log('❌ No item types found. Please create item types first.');
        process.exit(1);
      }
      
      // Create sample bathroom template
      const bathroomTemplate = new RoomTemplate({
        name: 'Standard Bathroom',
        description: 'A complete bathroom with all essential fixtures',
        icon: '🚿',
        requiredItems: itemTypes.slice(0, 3).map((itemType, index) => ({
          itemType: itemType._id,
          itemName: itemType.name,
          isEssential: true,
          quantity: { min: 1, max: 2 },
          budgetAllocation: 30,
          priceRange: { min: 5000, max: 50000 },
          priority: index + 1
        })),
        estimatedBudget: {
          min: 50000,
          max: 200000,
          recommended: 100000
        },
        isActive: true,
        displayOrder: 1
      });
      
      await bathroomTemplate.save();
      console.log('✓ Created Standard Bathroom template');
      
      // Create sample toilet template
      const toiletTemplate = new RoomTemplate({
        name: 'Powder Room',
        description: 'A compact toilet with essential fixtures',
        icon: '🚽',
        requiredItems: itemTypes.slice(0, 2).map((itemType, index) => ({
          itemType: itemType._id,
          itemName: itemType.name,
          isEssential: true,
          quantity: { min: 1, max: 1 },
          budgetAllocation: 40,
          priceRange: { min: 3000, max: 30000 },
          priority: index + 1
        })),
        estimatedBudget: {
          min: 30000,
          max: 100000,
          recommended: 50000
        },
        isActive: true,
        displayOrder: 2
      });
      
      await toiletTemplate.save();
      console.log('✓ Created Powder Room template');
      
      console.log('\n✅ Sample templates created successfully!');
    }
    
    // Test the populate
    console.log('\n🔍 Testing populate...');
    const populatedTemplates = await RoomTemplate.find({ isActive: true })
      .populate({
        path: 'requiredItems.itemType',
        select: 'name description icon priceRange',
        options: { strictPopulate: false }
      })
      .sort({ displayOrder: 1, name: 1 });
    
    console.log(`✓ Successfully populated ${populatedTemplates.length} templates`);
    populatedTemplates.forEach(t => {
      console.log(`  - ${t.name}:`);
      t.requiredItems.forEach(item => {
        const typeName = item.itemType?.name || 'Unknown';
        console.log(`    • ${item.itemName} (${typeName})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

checkRoomTemplates();
