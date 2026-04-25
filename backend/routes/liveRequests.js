const express = require('express');
const router = express.Router();
const LiveRequest = require('../models/LiveRequest');
const { sendQuotationEmail } = require('../services/emailService');

// Get all live requests
router.get('/', async (req, res) => {
  try {
    const { status, requestType, urgency, priority, search } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (requestType) query.requestType = requestType;
    if (urgency) query.urgency = urgency;
    if (priority) query.priority = priority;
    
    if (search) {
      query.$or = [
        { requestNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } },
        { clientPhone: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    const requests = await LiveRequest.find(query)
      .populate('client')
      .populate('category')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching live requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live requests',
      error: error.message
    });
  }
});

// Get statistics - MUST be before /:id route
router.get('/stats/overview', async (req, res) => {
  try {
    const totalRequests = await LiveRequest.countDocuments();
    const newRequests = await LiveRequest.countDocuments({ status: 'new' });
    const inProgressRequests = await LiveRequest.countDocuments({ status: 'in-progress' });
    const completedRequests = await LiveRequest.countDocuments({ status: 'completed' });
    
    const requestsByType = await LiveRequest.aggregate([
      {
        $group: {
          _id: '$requestType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const requestsByUrgency = await LiveRequest.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totalRequests,
        newRequests,
        inProgressRequests,
        completedRequests,
        requestsByType,
        requestsByUrgency
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Convert budget plan to live request - MUST be before /:id route
router.post('/from-budget-plan/:budgetPlanId', async (req, res) => {
  console.log('=== Convert Budget Plan Route Hit ===');
  console.log('Budget Plan ID:', req.params.budgetPlanId);
  
  try {
    const BudgetPlan = require('../models/BudgetPlan');
    
    console.log('Finding budget plan...');
    const budgetPlan = await BudgetPlan.findById(req.params.budgetPlanId);
    
    console.log('Budget plan found:', budgetPlan ? 'Yes' : 'No');
    
    if (!budgetPlan) {
      console.log('Budget plan not found');
      return res.status(404).json({
        success: false,
        message: 'Budget plan not found'
      });
    }
    
    console.log('Budget plan data:', {
      userName: budgetPlan.userName,
      userEmail: budgetPlan.userEmail,
      userPhone: budgetPlan.userPhone,
      roomName: budgetPlan.roomName
    });
    
    // Validate required user information
    if (!budgetPlan.userName || !budgetPlan.userEmail || !budgetPlan.userPhone) {
      console.log('Missing user information');
      return res.status(400).json({
        success: false,
        message: 'Budget plan is missing required user information (name, email, or phone)'
      });
    }
    
    console.log('Creating description...');
    // Create description from selected products
    const productsList = budgetPlan.selectedProducts
      .map(item => `${item.itemName}: ${item.productName} (${item.companyName || 'N/A'}) - Qty: ${item.quantity} × ₹${item.unitPrice.toLocaleString('en-IN')} = ₹${item.totalPrice.toLocaleString('en-IN')}`)
      .join('\n');
    
    const description = `Budget Plan Conversion: ${budgetPlan.roomName}\n\nTotal Budget: ₹${budgetPlan.totalBudget.toLocaleString('en-IN')}\nEstimated Cost: ₹${budgetPlan.totalCost.toLocaleString('en-IN')}\n\nSelected Products:\n${productsList}\n\n${budgetPlan.notes ? 'Additional Notes:\n' + budgetPlan.notes : ''}`;
    
    console.log('Generating request number...');
    // Generate request number manually
    const count = await LiveRequest.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const requestNumber = `REQ${year}${month}${(count + 1).toString().padStart(4, '0')}`;
    console.log('Request number:', requestNumber);
    
    console.log('Creating live request...');
    // Create live request from budget plan with structured product data
    const liveRequest = new LiveRequest({
      requestNumber: requestNumber,
      clientName: budgetPlan.userName,
      clientEmail: budgetPlan.userEmail,
      clientPhone: budgetPlan.userPhone,
      requestType: 'quote',
      title: `${budgetPlan.roomName} - Budget Plan Request`,
      description: description,
      budget: {
        min: budgetPlan.totalCost,
        max: budgetPlan.totalBudget,
        currency: 'INR'
      },
      estimatedCost: budgetPlan.totalCost,
      urgency: 'medium',
      status: 'new',
      priority: 'medium',
      source: 'website',
      tags: ['budget-plan', budgetPlan.roomName.toLowerCase()],
      // Store budget plan products for easy quotation generation
      notes: [{
        text: `BUDGET PLAN PRODUCTS:\n${JSON.stringify(budgetPlan.selectedProducts.map(item => ({
          description: `${item.productName} (${item.companyName || 'N/A'}) - ${item.itemName}`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.totalPrice
        })), null, 2)}`,
        addedBy: 'System',
        addedAt: new Date()
      }]
    });
    
    console.log('Saving live request...');
    await liveRequest.save();
    console.log('Live request saved:', liveRequest._id);
    
    console.log('Updating budget plan status...');
    // Update budget plan status and link to live request
    budgetPlan.status = 'inquiry_sent';
    await budgetPlan.save();
    console.log('Budget plan status updated');
    
    console.log('=== Conversion Successful ===');
    res.status(201).json({
      success: true,
      message: 'Budget plan converted to live request successfully',
      data: liveRequest
    });
  } catch (error) {
    console.error('=== ERROR in conversion ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to convert budget plan to live request',
      error: error.message
    });
  }
});

// Get single live request
router.get('/:id', async (req, res) => {
  try {
    const request = await LiveRequest.findById(req.params.id)
      .populate('client')
      .populate('category');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Live request not found'
      });
    }
    
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching live request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live request',
      error: error.message
    });
  }
});

// Create new live request
router.post('/', async (req, res) => {
  try {
    // Generate request number manually for reliability
    if (!req.body.requestNumber) {
      const count = await LiveRequest.countDocuments();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      req.body.requestNumber = `REQ${year}${month}${(count + 1).toString().padStart(4, '0')}`;
    }
    
    const request = new LiveRequest(req.body);
    await request.save();
    
    res.status(201).json({
      success: true,
      message: 'Live request created successfully',
      data: request
    });
  } catch (error) {
    console.error('Error creating live request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create live request',
      error: error.message
    });
  }
});

// Update live request
router.put('/:id', async (req, res) => {
  try {
    const request = await LiveRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Live request not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Live request updated successfully',
      data: request
    });
  } catch (error) {
    console.error('Error updating live request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update live request',
      error: error.message
    });
  }
});

// Delete live request
router.delete('/:id', async (req, res) => {
  try {
    const request = await LiveRequest.findByIdAndDelete(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Live request not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Live request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting live request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete live request',
      error: error.message
    });
  }
});

// Add note to live request
router.post('/:id/notes', async (req, res) => {
  try {
    const { text, addedBy } = req.body;
    
    const request = await LiveRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Live request not found'
      });
    }
    
    request.notes.push({
      text,
      addedBy,
      addedAt: new Date()
    });
    
    await request.save();
    
    res.json({
      success: true,
      message: 'Note added successfully',
      data: request
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
});

// Send quotation email
router.post('/:id/send-quotation-email', async (req, res) => {
  try {
    const request = await LiveRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Live request not found'
      });
    }

    const { quotationData } = req.body;

    // Prepare email data
    const emailData = {
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      requestNumber: request.requestNumber,
      ...quotationData
    };

    // Send email
    const emailResult = await sendQuotationEmail(emailData);

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Quotation email sent successfully',
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: emailResult.message,
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Error sending quotation email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send quotation email',
      error: error.message
    });
  }
});

module.exports = router;
