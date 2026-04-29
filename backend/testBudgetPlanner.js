const mongoose = require('mongoose');
require('dotenv').config();
const RoomTemplate = require('./models/RoomTemplate');
const Product = require('./models/Product');
const ProductItemType = require('./models/ProductItemType');
const Company = require('./models/Company');
const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function testBudgetPlanner() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Get the "Basic Toilet" room template
    const template = await RoomTemplate.findOne({ name: 'Basic Toilet' })
      .populate('requiredItems.itemType');
    
    if (!template) {
      console.log('❌ Room template not found');
      return;
    }
    
    console.log(`📋 Testing Budget Planner for: ${template.name}`);
    console.log(`💰 Budget: ₹1,47,000\n`);
    
    const budget = 147000;
    const recommendations = [];
    
    for (const item of template.requiredItems) {
      const itemBudget = (budget * item.budgetAllocation) / 100;
      
      console.log(`\n🔍 ${item.itemName} (${item.budgetAllocation}%)`);
      console.log(`   Allocated Budget: ₹${itemBudget.toLocaleString()}`);
      console.log(`   ItemType: ${item.itemType?.name || 'N/A'}`);
      
      // Find products for this item type
      const products = await Product.find({
        itemType: item.itemType._id,
        isActive: true,
        price: { 
          $gte: Math.max(0, itemBudget * 0.5),
          $lte: itemBudget * 1.5
        }
      })
        .populate({
          path: 'company',
          match: { isPartner: true, isActive: true }
        })
        .populate('category')
        .populate('itemType')
        .sort({ price: 1, rating: -1 })
        .limit(10);
      
      const partnerProducts = products.filter(p => p.company !== null);
      
      console.log(`   Found ${partnerProducts.length} products`);
      
      if (partnerProducts.length > 0) {
        console.log(`   Price range: ₹${partnerProducts[0].price} - ₹${partnerProducts[partnerProducts.length - 1].price}`);
        console.log(`   Sample products:`);
        partnerProducts.slice(0, 3).forEach(p => {
          console.log(`     - ${p.name} (${p.companyName}): ₹${p.price.toLocaleString()}`);
        });
      } else {
        console.log(`   ⚠️  No products found in price range!`);
      }
      
      recommendations.push({
        itemType: item.itemType,
        itemName: item.itemName,
        suggestedBudget: itemBudget,
        productsFound: partnerProducts.length
      });
    }
    
    console.log(`\n\n✅ Budget Planner Test Complete!`);
    console.log(`\n📊 Summary:`);
    recommendations.forEach(r => {
      console.log(`   ${r.itemName}: ${r.productsFound} products (₹${r.suggestedBudget.toLocaleString()})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testBudgetPlanner();
