const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Contact = require('../models/Contact');
const Relationship = require('../models/Relationship');
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

// Middleware to extract staff info from token (optional)
const extractStaffInfo = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, 'your-secret-key-change-this-in-production');
      
      // Try to find as staff first
      let staff = await Staff.findById(decoded.id).select('name employeeId role');
      
      // If not found as staff, try as admin
      if (!staff) {
        const Admin = require('../models/Admin');
        const admin = await Admin.findById(decoded.id).select('name email');
        
        if (admin) {
          // Convert admin to staff-like object
          req.staffInfo = {
            id: admin._id,
            name: admin.name || admin.email,
            employeeId: 'ADMIN',
            role: 'admin'
          };
          console.log('Admin token detected:', req.staffInfo.name);
        }
      } else {
        req.staffInfo = {
          id: staff._id,
          name: staff.name,
          employeeId: staff.employeeId,
          role: staff.role
        };
        console.log('Staff token detected:', req.staffInfo.name);
      }
    }
  } catch (error) {
    // Token invalid or expired, continue without staff info
    console.log('No valid token found');
  }
  next();
};

// Get all orders
router.get('/', extractStaffInfo, async (req, res) => {
  try {
    const { 
      status, 
      paymentStatus,
      customerId,
      referrerId,
      search,
      createdBy,
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (customerId) query.customer = customerId;
    if (referrerId) query.referrer = referrerId;
    if (createdBy) query.createdBy = createdBy;
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('customer referrer relationship')
      .populate('products.product products.company products.category')
      .sort({ orderDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer referrer relationship billToContact')
      .populate('products.product products.company products.category')
      .populate('referralChain.contact');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

// Create new order
router.post('/', extractStaffInfo, async (req, res) => {
  try {
    console.log('Received order data:', JSON.stringify(req.body, null, 2));
    
    const orderData = { ...req.body };
    
    // Add staff info if available from token
    if (req.staffInfo) {
      orderData.createdBy = req.staffInfo.id;
      orderData.createdByName = req.staffInfo.name;
      console.log('Staff info added:', req.staffInfo.name);
    } else {
      // If no staff info, remove createdBy field to avoid validation error
      delete orderData.createdBy;
      delete orderData.createdByName;
      console.log('No staff token found, creating order without staff tracking');
    }
    
    // Generate order number manually (since we removed pre-save hook)
    if (!orderData.orderNumber) {
      try {
        const count = await Order.countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        orderData.orderNumber = `ORD${year}${month}${(count + 1).toString().padStart(5, '0')}`;
      } catch (error) {
        console.error('Error generating order number:', error);
        const timestamp = Date.now().toString().slice(-6);
        orderData.orderNumber = `ORD${timestamp}`;
      }
    }
    
    // Calculate totals manually (since we removed pre-save hook)
    orderData.subtotal = orderData.products.reduce((sum, item) => sum + item.totalPrice, 0);
    
    let discountAmount = 0;
    if (orderData.discountType === 'percentage') {
      discountAmount = (orderData.subtotal * orderData.discount) / 100;
    } else if (orderData.discountType === 'flat') {
      discountAmount = orderData.discount;
    }
    
    const taxableAmount = orderData.subtotal - discountAmount;
    const taxAmount = (taxableAmount * orderData.taxRate) / 100;
    orderData.tax = taxAmount;
    orderData.total = taxableAmount + taxAmount + parseFloat(orderData.shippingCharges || 0);
    
    // Calculate commission if referrer exists
    if (orderData.referrer && orderData.referrerCommission && orderData.referrerCommission.rate > 0) {
      orderData.referrerCommission.amount = (orderData.total * orderData.referrerCommission.rate) / 100;
    }
    
    console.log('Creating order with number:', orderData.orderNumber);
    console.log('Order totals - Subtotal:', orderData.subtotal, 'Tax:', orderData.tax, 'Total:', orderData.total);
    
    const order = new Order(orderData);
    await order.save();

    console.log('Order saved successfully:', order.orderNumber);

    // Update contact statistics
    if (order.customer) {
      await Contact.findByIdAndUpdate(order.customer, {
        $inc: { 
          totalOrders: 1,
          totalRevenue: order.total
        },
        lastContactDate: new Date()
      });
    }

    if (order.referrer) {
      await Contact.findByIdAndUpdate(order.referrer, {
        $inc: { 
          totalRevenue: order.total,
          totalCommissionEarned: order.referrerCommission.amount
        }
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('customer referrer relationship')
      .populate('products.product products.company products.category');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Send detailed error for debugging
    res.status(400).json({ 
      message: 'Error creating order', 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

// Update order
router.put('/:id', extractStaffInfo, async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Add staff info if available
    if (req.staffInfo) {
      updateData.lastUpdatedBy = req.staffInfo.id;
      updateData.lastUpdatedByName = req.staffInfo.name;
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('customer referrer relationship')
    .populate('products.product products.company products.category');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ message: 'Error updating order', error: error.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
});

// Approve commission
router.put('/:id/commission/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        'referrerCommission.status': 'approved',
        'referrerCommission.approvedBy': approvedBy,
        'referrerCommission.approvedDate': new Date()
      },
      { new: true }
    ).populate('customer referrer');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error approving commission:', error);
    res.status(500).json({ message: 'Error approving commission', error: error.message });
  }
});

// Mark commission as paid
router.put('/:id/commission/pay', async (req, res) => {
  try {
    const { paymentMethod, notes } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        'referrerCommission.status': 'paid',
        'referrerCommission.paidDate': new Date(),
        'referrerCommission.paymentMethod': paymentMethod,
        'referrerCommission.notes': notes
      },
      { new: true }
    ).populate('customer referrer');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update referrer's paid commission
    if (order.referrer) {
      await Contact.findByIdAndUpdate(order.referrer, {
        $inc: { totalCommissionPaid: order.referrerCommission.amount }
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Error marking commission as paid:', error);
    res.status(500).json({ message: 'Error marking commission as paid', error: error.message });
  }
});

// Get orders by referrer
router.get('/referrer/:referrerId', async (req, res) => {
  try {
    const orders = await Order.find({ referrer: req.params.referrerId })
      .populate('customer')
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders by referrer:', error);
    res.status(500).json({ message: 'Error fetching orders by referrer', error: error.message });
  }
});

// Get orders by customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.customerId })
      .populate('referrer')
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders by customer:', error);
    res.status(500).json({ message: 'Error fetching orders by customer', error: error.message });
  }
});

module.exports = router;
