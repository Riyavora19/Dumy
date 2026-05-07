const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify staff or admin token
const verifyStaffToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    console.log('🔐 Token verification started');
    console.log('Token present:', !!token);
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded, user ID:', decoded.id);
    
    // Try to find as staff first
    let staff = await Staff.findById(decoded.id).select('-password');
    console.log('Staff found:', !!staff);
    
    // If not found as staff, try as admin
    if (!staff) {
      console.log('🔍 Not found as staff, checking admin...');
      const admin = await Admin.findById(decoded.id).select('-password');
      console.log('Admin found:', !!admin);
      
      if (admin) {
        console.log('✅ Admin authenticated:', admin.email);
        // Convert admin to staff-like object for consistency
        req.staff = {
          _id: admin._id,
          name: admin.name || admin.username,
          email: admin.email,
          role: 'admin',
          status: 'active',
          permissions: {
            canCreateQuotation: true,
            canViewAllQuotations: true,
            canEditQuotation: true,
            canDeleteQuotation: true,
            canCreateOrder: true,
            canViewAllOrders: true,
            canEditOrder: true,
            canDeleteOrder: true,
            canManageProducts: true,
            canManageCategories: true,
            canViewInventory: true,
            canManageContacts: true,
            canViewAllContacts: true,
            canManageStaff: true,
            canManageSettings: true,
            canViewReports: true,
            canViewOwnReports: true
          }
        };
        return next();
      }
    }
    
    if (!staff || staff.status !== 'active') {
      console.log('❌ Invalid or inactive account');
      return res.status(401).json({ message: 'Invalid or inactive account' });
    }
    
    console.log('✅ Staff authenticated:', staff.email);
    req.staff = staff;
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check admin permission
const requireAdmin = (req, res, next) => {
  if (req.staff.role !== 'admin' && !req.staff.permissions?.canManageStaff) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Staff Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find staff by email
    const staff = await Staff.findOne({ email: email.toLowerCase() });
    
    if (!staff) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if staff is active
    if (staff.status !== 'active') {
      return res.status(401).json({ message: 'Your account is inactive. Please contact admin.' });
    }
    
    // Verify password
    const isMatch = await staff.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Update last login
    staff.lastLogin = new Date();
    await staff.save();
    
    // Generate token
    const token = jwt.sign(
      { id: staff._id, role: staff.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return staff data without password
    const staffData = staff.toObject();
    delete staffData.password;
    
    res.json({
      success: true,
      token,
      staff: {
        ...staffData,
        staffId: staff.staffId // Ensure staffId is included
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current staff profile
router.get('/profile', verifyStaffToken, async (req, res) => {
  try {
    res.json(req.staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Get all staff (Admin only)
router.get('/', verifyStaffToken, requireAdmin, async (req, res) => {
  try {
    const { status, role } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    
    const staff = await Staff.find(filter)
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Error fetching staff' });
  }
});

// Get single staff by ID
router.get('/:id', verifyStaffToken, async (req, res) => {
  try {
    // Staff can view their own profile, admin can view all
    if (req.staff._id.toString() !== req.params.id && req.staff.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const staff = await Staff.findById(req.params.id)
      .select('-password')
      .populate('createdBy', 'name email');
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff' });
  }
});

// Create new staff (Admin only)
router.post('/', verifyStaffToken, requireAdmin, async (req, res) => {
  try {
    console.log('📝 Creating new staff...');
    console.log('Request body:', req.body);
    console.log('Created by:', req.staff._id, 'Role:', req.staff.role);
    
    const { name, email, password, phone, role, status } = req.body;
    
    // Check if email already exists
    const existingStaff = await Staff.findOne({ email: email.toLowerCase() });
    if (existingStaff) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Hash password manually
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate employee ID manually
    const count = await Staff.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
    
    // Set permissions based on role
    let permissions = {};
    switch (role) {
      case 'admin':
        permissions = {
          canCreateQuotation: true,
          canViewAllQuotations: true,
          canEditQuotation: true,
          canDeleteQuotation: true,
          canCreateOrder: true,
          canViewAllOrders: true,
          canEditOrder: true,
          canDeleteOrder: true,
          canManageProducts: true,
          canManageCategories: true,
          canViewInventory: true,
          canManageContacts: true,
          canViewAllContacts: true,
          canManageStaff: true,
          canManageSettings: true,
          canViewReports: true,
          canViewOwnReports: true
        };
        break;
      case 'manager':
        permissions = {
          canCreateQuotation: true,
          canViewAllQuotations: true,
          canEditQuotation: true,
          canDeleteQuotation: true,
          canCreateOrder: true,
          canViewAllOrders: true,
          canEditOrder: true,
          canDeleteOrder: false,
          canManageProducts: false,
          canManageCategories: false,
          canViewInventory: true,
          canManageContacts: true,
          canViewAllContacts: true,
          canManageStaff: false,
          canManageSettings: false,
          canViewReports: true,
          canViewOwnReports: true
        };
        break;
      case 'sales_staff':
        permissions = {
          canCreateQuotation: true,
          canViewAllQuotations: false,
          canEditQuotation: true,
          canDeleteQuotation: false,
          canCreateOrder: true,
          canViewAllOrders: false,
          canEditOrder: false,
          canDeleteOrder: false,
          canManageProducts: false,
          canManageCategories: false,
          canViewInventory: true,
          canManageContacts: true,
          canViewAllContacts: false,
          canManageStaff: false,
          canManageSettings: false,
          canViewReports: false,
          canViewOwnReports: true
        };
        break;
      case 'inventory_staff':
        permissions = {
          canCreateQuotation: false,
          canViewAllQuotations: false,
          canEditQuotation: false,
          canDeleteQuotation: false,
          canCreateOrder: false,
          canViewAllOrders: false,
          canEditOrder: false,
          canDeleteOrder: false,
          canManageProducts: true,
          canManageCategories: true,
          canViewInventory: true,
          canManageContacts: false,
          canViewAllContacts: false,
          canManageStaff: false,
          canManageSettings: false,
          canViewReports: false,
          canViewOwnReports: false
        };
        break;
      default:
        permissions = {
          canCreateQuotation: true,
          canViewAllQuotations: false,
          canEditQuotation: true,
          canDeleteQuotation: false,
          canCreateOrder: true,
          canViewAllOrders: false,
          canEditOrder: false,
          canDeleteOrder: false,
          canManageProducts: false,
          canManageCategories: false,
          canViewInventory: true,
          canManageContacts: true,
          canViewAllContacts: false,
          canManageStaff: false,
          canManageSettings: false,
          canViewReports: false,
          canViewOwnReports: true
        };
    }
    
    // Create new staff
    const staff = new Staff({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || 'sales_staff',
      status: status || 'active',
      permissions,
      employeeId,
      createdBy: req.staff._id,
      createdByModel: req.staff.role === 'admin' ? 'Admin' : 'Staff'
    });
    
    console.log('💾 Saving staff to database...');
    await staff.save();
    console.log('✅ Staff saved successfully:', staff.employeeId);
    
    // Return staff without password
    const staffData = staff.toObject();
    delete staffData.password;
    
    res.status(201).json({
      message: 'Staff created successfully',
      staff: staffData
    });
  } catch (error) {
    console.error('❌ Error creating staff:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error creating staff', error: error.message });
  }
});

// Update staff (Admin or self for limited fields)
router.put('/:id', verifyStaffToken, async (req, res) => {
  try {
    const isSelf = req.staff._id.toString() === req.params.id;
    const isAdmin = req.staff.role === 'admin' || req.staff.permissions.canManageStaff;
    
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    // Fields that can be updated by self
    if (isSelf) {
      if (req.body.name) staff.name = req.body.name;
      if (req.body.phone) staff.phone = req.body.phone;
      if (req.body.password) staff.password = req.body.password;
    }
    
    // Fields that can only be updated by admin
    if (isAdmin) {
      if (req.body.name) staff.name = req.body.name;
      if (req.body.email) staff.email = req.body.email.toLowerCase();
      if (req.body.phone) staff.phone = req.body.phone;
      if (req.body.role) staff.role = req.body.role;
      if (req.body.status) staff.status = req.body.status;
      if (req.body.permissions) staff.permissions = { ...staff.permissions, ...req.body.permissions };
      if (req.body.password) staff.password = req.body.password;
    }
    
    await staff.save();
    
    const staffData = staff.toObject();
    delete staffData.password;
    
    res.json({
      message: 'Staff updated successfully',
      staff: staffData
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ message: 'Error updating staff' });
  }
});

// Delete staff (Admin only)
router.delete('/:id', verifyStaffToken, requireAdmin, async (req, res) => {
  try {
    // Prevent deleting self
    if (req.staff._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const staff = await Staff.findByIdAndDelete(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ message: 'Error deleting staff' });
  }
});

// Change password
router.post('/change-password', verifyStaffToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const staff = await Staff.findById(req.staff._id);
    
    // Verify current password
    const isMatch = await staff.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    staff.password = newPassword;
    await staff.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Get staff statistics (Admin only)
router.get('/stats/overview', verifyStaffToken, requireAdmin, async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments();
    const activeStaff = await Staff.countDocuments({ status: 'active' });
    const inactiveStaff = await Staff.countDocuments({ status: 'inactive' });
    
    const staffByRole = await Staff.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalStaff,
      activeStaff,
      inactiveStaff,
      staffByRole
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = { router, verifyStaffToken };
