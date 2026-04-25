const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

// Create new inquiry (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, products } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const inquiry = new Inquiry({
      name,
      email,
      phone,
      message,
      products: products || []
    });

    await inquiry.save();

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inquiry',
      error: error.message
    });
  }
});

// Get all inquiries (admin)
router.get('/', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
});

// Get single inquiry (admin)
router.get('/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry',
      error: error.message
    });
  }
});

// Update inquiry status (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['new', 'read', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry',
      error: error.message
    });
  }
});

// Delete inquiry (admin)
router.delete('/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry',
      error: error.message
    });
  }
});

// Convert inquiry to live request (admin)
router.post('/:id/convert-to-live-request', async (req, res) => {
  console.log('=== Convert Inquiry to Live Request ===');
  console.log('Inquiry ID:', req.params.id);
  
  try {
    const LiveRequest = require('../models/LiveRequest');
    
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      console.log('Inquiry not found');
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }
    
    console.log('Inquiry found:', {
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone
    });
    
    // Create description from inquiry message and products
    let description = inquiry.message;
    
    if (inquiry.products && inquiry.products.length > 0) {
      description += '\n\nRequested Products:\n';
      inquiry.products.forEach((product, index) => {
        description += `${index + 1}. ${product.name}`;
        if (product.company) description += ` (${product.company})`;
        if (product.quantity) description += ` - Qty: ${product.quantity}`;
        description += '\n';
      });
    }
    
    // Generate request number
    const count = await LiveRequest.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const requestNumber = `REQ${year}${month}${(count + 1).toString().padStart(4, '0')}`;
    
    console.log('Creating live request with number:', requestNumber);
    
    // Create live request from inquiry
    const liveRequest = new LiveRequest({
      requestNumber: requestNumber,
      clientName: inquiry.name,
      clientEmail: inquiry.email,
      clientPhone: inquiry.phone || 'Not provided',
      requestType: 'quote',
      title: `Inquiry from ${inquiry.name}`,
      description: description,
      urgency: 'medium',
      status: 'new',
      priority: 'medium',
      source: 'website',
      tags: ['inquiry-conversion'],
      notes: [{
        text: `Converted from inquiry on ${new Date().toLocaleDateString()}`,
        addedBy: 'System',
        addedAt: new Date()
      }]
    });
    
    await liveRequest.save();
    console.log('Live request created:', liveRequest._id);
    
    // Update inquiry status to closed
    inquiry.status = 'closed';
    await inquiry.save();
    console.log('Inquiry status updated to closed');
    
    console.log('=== Conversion Successful ===');
    res.status(201).json({
      success: true,
      message: 'Inquiry converted to live request successfully',
      data: liveRequest
    });
  } catch (error) {
    console.error('=== ERROR in conversion ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to convert inquiry to live request',
      error: error.message
    });
  }
});

module.exports = router;
