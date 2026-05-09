const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Company = require('../models/Company');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for logo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'company-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Find or create company by name (used during Excel import)
router.post('/find-or-create', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    const trimmedName = name.trim();

    // Try to find existing company (case-insensitive)
    let company = await Company.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });

    if (company) {
      return res.json({
        success: true,
        created: false,
        data: company
      });
    }

    // Create new company with just the name
    company = new Company({
      name: trimmedName,
      isActive: true,
      isPartner: false
    });

    await company.save();

    res.status(201).json({
      success: true,
      created: true,
      data: company
    });
  } catch (error) {
    console.error('Error in find-or-create company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find or create company',
      error: error.message
    });
  }
});

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().populate('categories').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
});

// Get active companies
router.get('/active', async (req, res) => {
  try {
    const companies = await Company.find({ isActive: true }).populate('categories').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    console.error('Error fetching active companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
});

// Get single company
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('categories');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company',
      error: error.message
    });
  }
});

// Create new company
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const { name, description, categories, website, email, phone, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this name already exists'
      });
    }

    // Parse categories if it's a string
    let categoryArray = [];
    if (categories) {
      categoryArray = typeof categories === 'string' ? JSON.parse(categories) : categories;
    }

    const company = new Company({
      name,
      description,
      categories: categoryArray,
      logo: req.file ? `/uploads/${req.file.filename}` : null,
      website,
      email,
      phone,
      isActive: isActive === 'true' || isActive === true
    });

    await company.save();
    await company.populate('categories');

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create company',
      error: error.message
    });
  }
});

// Update company
router.put('/:id', upload.single('logo'), async (req, res) => {
  try {
    const { name, description, categories, website, email, phone, isActive, existingLogo } = req.body;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Parse categories if it's a string
    let categoryArray = [];
    if (categories) {
      categoryArray = typeof categories === 'string' ? JSON.parse(categories) : categories;
    }

    // Handle logo
    let logo = existingLogo || company.logo;
    if (req.file) {
      logo = `/uploads/${req.file.filename}`;
      // Delete old logo if exists
      if (company.logo) {
        const oldLogoPath = path.join(__dirname, '..', company.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
    }

    company.name = name || company.name;
    company.description = description || company.description;
    company.categories = categoryArray.length > 0 ? categoryArray : company.categories;
    company.logo = logo;
    company.website = website || company.website;
    company.email = email || company.email;
    company.phone = phone || company.phone;
    company.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : company.isActive;

    await company.save();
    await company.populate('categories');

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: error.message
    });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Delete logo if exists
    if (company.logo) {
      const logoPath = path.join(__dirname, '..', company.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.message
    });
  }
});

module.exports = router;
