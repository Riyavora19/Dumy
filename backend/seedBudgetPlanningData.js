const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');
const ProductItemType = require('./models/ProductItemType');
const RoomTemplate = require('./models/RoomTemplate');
const Company = require('./models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

// Sample data
const itemTypesData = [
  // Bathroom/Toilet Items
  { name: 'Toilet Seat', category: 'Bathroom', icon: '🚽', priceRange: { min: 2000, max: 50000 } },
  { name: 'Flush Tank', category: 'Bathroom', icon: '💧', priceRange: { min: 1500, max: 15000 } },
  { name: 'Urinal', category: 'Bathroom', icon: '🚻', priceRange: { min: 3000, max: 20000 } },
  { name: 'Tap/Faucet', category: 'Bathroom', icon: '🚰', priceRange: { min: 100, max: 15000 } },
  { name: 'Wash Basin', category: 'Bathroom', icon: '🚿', priceRange: { min: 2000, max: 30000 } },
  { name: 'Mirror', category: 'Bathroom', icon: '🪞', priceRange: { min: 500, max: 10000 } },
  { name: 'Shower Head', category: 'Bathroom', icon: '🚿', priceRange: { min: 500, max: 20000 } },
  { name: 'Bathroom Tiles', category: 'Bathroom', icon: '⬜', priceRange: { min: 5000, max: 50000 } },
  { name: 'Towel Rack', category: 'Bathroom', icon: '🧴', priceRange: { min: 200, max: 3000 } },
  { name: 'Soap Dispenser', category: 'Bathroom', icon: '🧼', priceRange: { min: 100, max: 2000 } },
  { name: 'Bathroom Cabinet', category: 'Bathroom', icon: '🗄️', priceRange: { min: 3000, max: 25000 } },
  
  // Kitchen Items
  { name: 'Kitchen Sink', category: 'Kitchen', icon: '🚰', priceRange: { min: 2000, max: 30000 } },
  { name: 'Kitchen Tap', category: 'Kitchen', icon: '🚰', priceRange: { min: 500, max: 15000 } },
  { name: 'Kitchen Tiles', category: 'Kitchen', icon: '⬜', priceRange: { min: 5000, max: 60000 } },
  { name: 'Chimney', category: 'Kitchen', icon: '🏭', priceRange: { min: 5000, max: 50000 } },
  { name: 'Gas Stove', category: 'Kitchen', icon: '🔥', priceRange: { min: 3000, max: 30000 } },
  { name: 'Kitchen Cabinet', category: 'Kitchen', icon: '🗄️', priceRange: { min: 10000, max: 100000 } },
  { name: 'Countertop', category: 'Kitchen', icon: '📐', priceRange: { min: 5000, max: 50000 } },
];

const roomTemplatesData = [
  {
    name: 'Basic Toilet',
    description: 'Essential items for a functional toilet',
    icon: '🚽',
    estimatedBudget: { min: 15000, max: 100000, recommended: 40000 },
    displayOrder: 1,
    requiredItems: [
      { itemName: 'Toilet Seat', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 25, priceRange: { min: 3000, max: 15000 }, priority: 1 },
      { itemName: 'Flush Tank', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 15, priceRange: { min: 2000, max: 8000 }, priority: 2 },
      { itemName: 'Tap/Faucet', isEssential: true, quantity: { min: 1, max: 2 }, budgetAllocation: 10, priceRange: { min: 500, max: 5000 }, priority: 3 },
      { itemName: 'Wash Basin', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 20, priceRange: { min: 3000, max: 12000 }, priority: 4 },
      { itemName: 'Mirror', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 8, priceRange: { min: 1000, max: 5000 }, priority: 5 },
      { itemName: 'Bathroom Tiles', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 20, priceRange: { min: 8000, max: 30000 }, priority: 6 },
      { itemName: 'Towel Rack', isEssential: false, quantity: { min: 1, max: 2 }, budgetAllocation: 2, priceRange: { min: 300, max: 2000 }, priority: 7 },
    ]
  },
  {
    name: 'Full Bathroom',
    description: 'Complete bathroom with shower and all amenities',
    icon: '🛁',
    estimatedBudget: { min: 30000, max: 200000, recommended: 80000 },
    displayOrder: 2,
    requiredItems: [
      { itemName: 'Toilet Seat', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 15, priceRange: { min: 5000, max: 20000 }, priority: 1 },
      { itemName: 'Flush Tank', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 10, priceRange: { min: 3000, max: 10000 }, priority: 2 },
      { itemName: 'Shower Head', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 12, priceRange: { min: 2000, max: 15000 }, priority: 3 },
      { itemName: 'Tap/Faucet', isEssential: true, quantity: { min: 2, max: 3 }, budgetAllocation: 10, priceRange: { min: 1000, max: 8000 }, priority: 4 },
      { itemName: 'Wash Basin', isEssential: true, quantity: { min: 1, max: 2 }, budgetAllocation: 15, priceRange: { min: 5000, max: 20000 }, priority: 5 },
      { itemName: 'Mirror', isEssential: true, quantity: { min: 1, max: 2 }, budgetAllocation: 8, priceRange: { min: 2000, max: 8000 }, priority: 6 },
      { itemName: 'Bathroom Tiles', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 25, priceRange: { min: 15000, max: 50000 }, priority: 7 },
      { itemName: 'Bathroom Cabinet', isEssential: false, quantity: { min: 1, max: 2 }, budgetAllocation: 8, priceRange: { min: 5000, max: 20000 }, priority: 8 },
      { itemName: 'Towel Rack', isEssential: false, quantity: { min: 2, max: 3 }, budgetAllocation: 2, priceRange: { min: 500, max: 2500 }, priority: 9 },
      { itemName: 'Soap Dispenser', isEssential: false, quantity: { min: 1, max: 2 }, budgetAllocation: 1, priceRange: { min: 200, max: 1500 }, priority: 10 },
    ]
  },
  {
    name: 'Modular Kitchen',
    description: 'Complete modular kitchen setup',
    icon: '🍳',
    estimatedBudget: { min: 50000, max: 500000, recommended: 150000 },
    displayOrder: 3,
    requiredItems: [
      { itemName: 'Kitchen Cabinet', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 40, priceRange: { min: 30000, max: 150000 }, priority: 1 },
      { itemName: 'Kitchen Sink', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 12, priceRange: { min: 5000, max: 25000 }, priority: 2 },
      { itemName: 'Kitchen Tap', isEssential: true, quantity: { min: 1, max: 2 }, budgetAllocation: 8, priceRange: { min: 1500, max: 10000 }, priority: 3 },
      { itemName: 'Countertop', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 15, priceRange: { min: 10000, max: 40000 }, priority: 4 },
      { itemName: 'Kitchen Tiles', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 15, priceRange: { min: 10000, max: 50000 }, priority: 5 },
      { itemName: 'Chimney', isEssential: false, quantity: { min: 1, max: 1 }, budgetAllocation: 15, priceRange: { min: 8000, max: 40000 }, priority: 6 },
      { itemName: 'Gas Stove', isEssential: true, quantity: { min: 1, max: 1 }, budgetAllocation: 10, priceRange: { min: 5000, max: 25000 }, priority: 7 },
    ]
  }
];

async function seedBudgetPlanningData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Get or create categories
    const bathroomCategory = await Category.findOne({ name: 'Bathroom' }) || 
      await Category.create({ name: 'Bathroom', icon: '🛁', description: 'Bathroom and toilet products' });
    
    const kitchenCategory = await Category.findOne({ name: 'Kitchen' }) || 
      await Category.create({ name: 'Kitchen', icon: '🍳', description: 'Kitchen products and appliances' });

    console.log('Categories ready');

    // Create Product Item Types
    console.log('Creating product item types...');
    const itemTypeMap = {};
    
    for (const itemData of itemTypesData) {
      const category = itemData.category === 'Bathroom' ? bathroomCategory : kitchenCategory;
      
      const existing = await ProductItemType.findOne({ name: itemData.name });
      if (!existing) {
        const itemType = await ProductItemType.create({
          name: itemData.name,
          category: category._id,
          icon: itemData.icon,
          priceRange: itemData.priceRange
        });
        itemTypeMap[itemData.name] = itemType._id;
        console.log(`✓ Created item type: ${itemData.name}`);
      } else {
        itemTypeMap[itemData.name] = existing._id;
        console.log(`- Item type already exists: ${itemData.name}`);
      }
    }

    // Create Room Templates
    console.log('\nCreating room templates...');
    
    for (const roomData of roomTemplatesData) {
      const existing = await RoomTemplate.findOne({ name: roomData.name });
      
      if (!existing) {
        // Map item names to item type IDs
        const requiredItems = roomData.requiredItems.map(item => ({
          ...item,
          itemType: itemTypeMap[item.itemName]
        }));

        await RoomTemplate.create({
          ...roomData,
          requiredItems
        });
        console.log(`✓ Created room template: ${roomData.name}`);
      } else {
        console.log(`- Room template already exists: ${roomData.name}`);
      }
    }

    // Update existing companies to be partners
    console.log('\nUpdating companies as partners...');
    const companies = await Company.find();
    for (const company of companies) {
      if (!company.isPartner) {
        company.isPartner = true;
        await company.save();
        console.log(`✓ Updated ${company.name} as partner`);
      }
    }

    console.log('\n✅ Budget planning data seeded successfully!');
    console.log('\nSummary:');
    console.log(`- Product Item Types: ${Object.keys(itemTypeMap).length}`);
    console.log(`- Room Templates: ${roomTemplatesData.length}`);
    console.log(`- Partner Companies: ${companies.length}`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedBudgetPlanningData();
