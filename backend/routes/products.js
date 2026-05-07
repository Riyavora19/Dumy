const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Get all products
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      itemType, 
      minPrice, 
      maxPrice, 
      company, 
      partnerOnly,
      isActive
    } = req.query;
    
    const query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by item type
    if (itemType) {
      query.itemType = itemType;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Filter by company
    if (company) {
      query.company = company;
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Build populate options for company
    let populateOptions = [
      { path: 'category' },
      { path: 'itemType' }
    ];
    
    if (partnerOnly === 'true') {
      populateOptions.push({
        path: 'company',
        match: { isPartner: true, isActive: true }
      });
    } else {
      populateOptions.push({ path: 'company' });
    }
    
    // Build sort object - default to newest first (createdAt descending)
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order || 'desc';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };
    
    let products = await Product.find(query)
      .populate(populateOptions)
      .sort(sortObj);
    
    // Filter out products with null company if partnerOnly is true
    if (partnerOnly === 'true') {
      products = products.filter(p => p.company !== null);
    }
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { partnerOnly, minPrice, maxPrice, itemType } = req.query;
    
    const query = { 
      category: req.params.categoryId,
      isActive: true 
    };
    
    // Filter by item type
    if (itemType) {
      query.itemType = itemType;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    let populateOptions = [
      { path: 'category' },
      { path: 'itemType' }
    ];
    
    if (partnerOnly === 'true') {
      populateOptions.push({
        path: 'company',
        match: { isPartner: true, isActive: true }
      });
    } else {
      populateOptions.push({ path: 'company' });
    }
    
    let products = await Product.find(query)
      .populate(populateOptions)
      .sort({ createdAt: -1 });
    
    // Filter out products with null company if partnerOnly is true
    if (partnerOnly === 'true') {
      products = products.filter(p => p.company !== null);
    }
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get products by item type
router.get('/by-item-type/:itemTypeId', async (req, res) => {
  try {
    const { minPrice, maxPrice, company, sortBy = 'price', order = 'asc' } = req.query;
    
    const query = {
      itemType: req.params.itemTypeId,
      isActive: true
    };
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Filter by company
    if (company) {
      query.company = company;
    }
    
    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };
    
    // Only show products from partner companies
    let products = await Product.find(query)
      .populate('category')
      .populate('itemType')
      .populate({
        path: 'company',
        match: { isPartner: true, isActive: true }
      })
      .sort(sortObj);
    
    // Filter out products with null company (non-partner)
    products = products.filter(p => p.company !== null);
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products by item type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Create new product with images
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      company,
      companyName,
      brand,
      itemType,
      itemTypeName,
      price, 
      sku, 
      stock, 
      isActive,
      variant,
      variantDescription,
      originalPrice,
      discount,
      specifications,
      tags,
      rating,
      reviewCount,
      popularity,
      existingImages
    } = req.body;

    console.log('📦 Creating product with data:', {
      name,
      category,
      price,
      variant,
      brand,
      company
    });

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and price are required'
      });
    }

    // Get image URLs - either from uploaded files or existing images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (existingImages) {
      images = Array.isArray(existingImages) ? existingImages : [existingImages];
    }

    // Images are optional - allow products without images (for Excel imports)
    // if (images.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'At least one image is required'
    //   });
    // }

    // Parse specifications if it's a string
    let parsedSpecs = {};
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        parsedSpecs = specifications;
      }
    }

    const product = new Product({
      name,
      description,
      category,
      company: company && company.length === 24 ? company : undefined, // Only set if it's a valid ObjectId
      companyName: company || companyName, // Use company name from Excel or form
      brand,
      itemType: itemType && itemType.length === 24 ? itemType : undefined,
      itemTypeName,
      price: parseFloat(price),
      images,
      sku,
      stock: stock ? parseInt(stock) : 0,
      isActive: isActive === 'true' || isActive === true,
      variant: variant || '',
      variantDescription,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      discount: discount ? parseFloat(discount) : undefined,
      specifications: parsedSpecs,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      rating: rating ? parseFloat(rating) : 0,
      reviewCount: reviewCount ? parseInt(reviewCount) : 0,
      popularity: popularity ? parseInt(popularity) : 0
    });

    await product.save();
    await product.populate('category');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// Update product
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      company,
      companyName,
      brand,
      itemType,
      itemTypeName,
      price, 
      sku, 
      stock, 
      isActive, 
      existingImages,
      variant,
      variantDescription,
      originalPrice,
      discount,
      specifications,
      tags,
      rating,
      reviewCount,
      popularity
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Handle images
    let images = [];
    if (existingImages) {
      images = Array.isArray(existingImages) ? existingImages : [existingImages];
    }
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
    }

    // Parse specifications if it's a string
    let parsedSpecs = product.specifications || {};
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        parsedSpecs = specifications;
      }
    }

    // Update product
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.company = company && company.length === 24 ? company : product.company; // Only set if valid ObjectId
    product.companyName = company || companyName || product.companyName; // Use company name from Excel or form
    product.brand = brand !== undefined ? brand : product.brand;
    product.itemType = itemType && itemType.length === 24 ? itemType : product.itemType;
    product.itemTypeName = itemTypeName || product.itemTypeName;
    product.price = price ? parseFloat(price) : product.price;
    product.sku = sku || product.sku;
    product.stock = stock !== undefined ? parseInt(stock) : product.stock;
    product.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : product.isActive;
    product.images = images.length > 0 ? images : product.images;
    product.variant = variant !== undefined ? variant : product.variant;
    product.variantDescription = variantDescription || product.variantDescription;
    product.originalPrice = originalPrice ? parseFloat(originalPrice) : product.originalPrice;
    product.discount = discount ? parseFloat(discount) : product.discount;
    product.specifications = parsedSpecs;
    product.tags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : product.tags;
    product.rating = rating !== undefined ? parseFloat(rating) : product.rating;
    product.reviewCount = reviewCount !== undefined ? parseInt(reviewCount) : product.reviewCount;
    product.popularity = popularity !== undefined ? parseInt(popularity) : product.popularity;

    await product.save();
    await product.populate('category');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete associated images
    product.images.forEach(imagePath => {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// Get product variants by name and category
router.get('/variants/:categoryId/:productName', async (req, res) => {
  try {
    const { categoryId, productName } = req.params;

    const products = await Product.find({
      category: categoryId,
      name: { $regex: productName, $options: 'i' },
      isActive: true
    })
    .populate('category')
    .populate('company')
    .sort({ price: 1 });

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching product variants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product variants',
      error: error.message
    });
  }
});

// Search products
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    console.log('🔍 Search query:', query);

    if (!query || query.trim().length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Search by product name, description, companyName, or SKU
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { companyName: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { variant: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    })
    .populate('category')
    .populate('company')
    .limit(10)
    .sort({ createdAt: -1 });

    console.log(`✅ Found ${products.length} products`);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
});

module.exports = router;
