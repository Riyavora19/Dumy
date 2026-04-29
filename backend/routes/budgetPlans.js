const express = require('express');
const router = express.Router();
const BudgetPlan = require('../models/BudgetPlan');
const RoomTemplate = require('../models/RoomTemplate');
const Product = require('../models/Product');
const Company = require('../models/Company');

// Get all budget plans (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { userId, status } = req.query;
    const query = {};
    
    if (userId) query.userId = userId;
    if (status) query.status = status;
    
    const plans = await BudgetPlan.find(query)
      .populate('roomTemplate')
      .populate('selectedProducts.itemType')
      .populate('selectedProducts.product')
      .populate('selectedProducts.company')
      .sort({ createdAt: -1 });
    
    res.json(plans);
  } catch (error) {
    console.error('Error fetching budget plans:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single budget plan by ID
router.get('/:id', async (req, res) => {
  try {
    const plan = await BudgetPlan.findById(req.params.id)
      .populate('roomTemplate')
      .populate('selectedProducts.itemType')
      .populate('selectedProducts.product')
      .populate('selectedProducts.company');
    
    if (!plan) {
      return res.status(404).json({ message: 'Budget plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error fetching budget plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new budget plan
router.post('/', async (req, res) => {
  try {
    const plan = new BudgetPlan(req.body);
    await plan.save();
    
    const populated = await BudgetPlan.findById(plan._id)
      .populate('roomTemplate')
      .populate('selectedProducts.itemType')
      .populate('selectedProducts.product')
      .populate('selectedProducts.company');
    
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating budget plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update budget plan
router.put('/:id', async (req, res) => {
  try {
    const plan = await BudgetPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('roomTemplate')
      .populate('selectedProducts.itemType')
      .populate('selectedProducts.product')
      .populate('selectedProducts.company');
    
    if (!plan) {
      return res.status(404).json({ message: 'Budget plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error updating budget plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete budget plan
router.delete('/:id', async (req, res) => {
  try {
    const plan = await BudgetPlan.findByIdAndDelete(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Budget plan not found' });
    }
    
    res.json({ message: 'Budget plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate budget recommendations
router.post('/generate-recommendations', async (req, res) => {
  try {
    console.log('📊 Generate recommendations request:', req.body);
    
    const { roomTemplateId, budget } = req.body;
    
    if (!roomTemplateId || !budget) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'Room template ID and budget are required' 
      });
    }
    
    console.log(`🔍 Finding template: ${roomTemplateId}`);
    
    // Get room template with required items
    const template = await RoomTemplate.findById(roomTemplateId)
      .populate('requiredItems.itemType');
    
    if (!template) {
      console.log('❌ Template not found');
      return res.status(404).json({ message: 'Room template not found' });
    }
    
    console.log(`✅ Template found: ${template.name}`);
    console.log(`📋 Required items: ${template.requiredItems.length}`);
    
    // Generate recommendations for each required item
    const recommendations = [];
    
    for (const item of template.requiredItems) {
      // Calculate budget allocation for this item
      const itemBudget = (budget * item.budgetAllocation) / 100;
      
      console.log(`\n🔍 Searching for: ${item.itemName} (${item.itemType?.name})`);
      console.log(`   Budget: ₹${itemBudget}`);
      
      // Find products for this item type from partner companies only
      const products = await Product.find({
        itemType: item.itemType._id,
        isActive: true,
        price: { 
          $gte: Math.max(0, itemBudget * 0.5), // 50% below budget
          $lte: itemBudget * 1.5 // 50% above budget
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
      
      // Filter out products with null company (non-partner)
      const partnerProducts = products.filter(p => p.company !== null);
      
      console.log(`   Found ${partnerProducts.length} products`);
      
      // Categorize products by price range
      const budgetOptions = partnerProducts.filter(p => p.price <= itemBudget * 0.8);
      const midRangeOptions = partnerProducts.filter(p => 
        p.price > itemBudget * 0.8 && p.price <= itemBudget * 1.2
      );
      const premiumOptions = partnerProducts.filter(p => p.price > itemBudget * 1.2);
      
      recommendations.push({
        itemType: item.itemType,
        itemName: item.itemName,
        isEssential: item.isEssential,
        suggestedBudget: itemBudget,
        quantity: item.quantity,
        products: {
          budget: budgetOptions.slice(0, 3),
          midRange: midRangeOptions.slice(0, 3),
          premium: premiumOptions.slice(0, 3),
          all: partnerProducts
        }
      });
    }
    
    console.log(`\n✅ Generated ${recommendations.length} recommendations`);
    
    res.json({
      roomTemplate: template,
      totalBudget: budget,
      recommendations
    });
    
  } catch (error) {
    console.error('❌ Error generating recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
