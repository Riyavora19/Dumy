const express = require('express');
const router = express.Router();
const BudgetPlan = require('../models/BudgetPlan');
const RoomTemplate = require('../models/RoomTemplate');
const Product = require('../models/Product');
const Company = require('../models/Company');
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

// Middleware to extract staff info from token (optional)
const extractStaffInfo = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const staff = await Staff.findById(decoded.id).select('name employeeId role');
      
      if (staff) {
        req.staffInfo = {
          id: staff._id,
          name: staff.name,
          employeeId: staff.employeeId,
          role: staff.role
        };
      }
    }
  } catch (error) {
    // Token invalid or expired, continue without staff info
  }
  next();
};

// Get all budget plans (with optional filters)
router.get('/', extractStaffInfo, async (req, res) => {
  try {
    const { userId, status, createdBy } = req.query;
    const query = {};
    
    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (createdBy) query.createdBy = createdBy;
    
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
router.post('/', extractStaffInfo, async (req, res) => {
  try {
    const planData = { ...req.body };
    
    // Add staff info if available
    if (req.staffInfo) {
      planData.createdBy = req.staffInfo.id;
      planData.createdByName = req.staffInfo.name;
    }
    
    const plan = new BudgetPlan(planData);
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
router.put('/:id', extractStaffInfo, async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Add staff info if available
    if (req.staffInfo) {
      updateData.updatedBy = req.staffInfo.id;
    }
    
    const plan = await BudgetPlan.findByIdAndUpdate(
      req.params.id,
      updateData,
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
    const { roomTemplateId, budget } = req.body;
    
    if (!roomTemplateId || !budget) {
      return res.status(400).json({ 
        message: 'Room template ID and budget are required' 
      });
    }
    
    // Get room template with required items
    const template = await RoomTemplate.findById(roomTemplateId)
      .populate('requiredItems.itemType');
    
    if (!template) {
      return res.status(404).json({ message: 'Room template not found' });
    }
    
    // Generate recommendations for each required item
    const recommendations = [];
    
    for (const item of template.requiredItems) {
      // Calculate budget allocation for this item
      const itemBudget = (budget * item.budgetAllocation) / 100;
      
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
    
    res.json({
      roomTemplate: template,
      totalBudget: budget,
      recommendations
    });
    
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
