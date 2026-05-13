const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const Company = require('../models/Company');
const { detectItemType } = require('../services/autoItemTypeService');

// Helper: when a product links a company + category, add that category to the company's categories array
const linkCompanyToCategory = async (companyId, categoryId) => {
  if (!companyId || !categoryId) return;
  try {
    await Company.findByIdAndUpdate(
      companyId,
      { $addToSet: { categories: categoryId } }, // $addToSet prevents duplicates
      { new: true }
    );
  } catch (err) {
    console.warn('Could not link company to category:', err.message);
  }
};

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
      isActive,
      flag
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
    
    // Filter by flag (e.g., Featured)
    if (flag) {
      query.flag = flag;
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
      itemCode,
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
      existingImages,
      // Pricing fields
      mrp,
      nrp,
      sdp,
      npp,
      clp,
      effectivePriceListDate,
      hsnCode,
      gst,
      // Classification fields
      broadCategory,
      cat,
      subCat,
      range,
      segment,
      flag,
      channelType,
      schemeType
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
      company: company && company.length === 24 ? company : undefined,
      companyName: company || companyName,
      brand,
      itemType: itemType && itemType.length === 24 ? itemType : undefined,
      itemTypeName,
      price: parseFloat(price),
      images,
      sku,
      itemCode,
      stock: stock ? parseInt(stock) : 0,
      isActive: isActive === 'true' || isActive === true,
      variant: variant || '',
      variantDescription,
      mrp: mrp ? parseFloat(mrp) : (originalPrice ? parseFloat(originalPrice) : parseFloat(price)),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      nrp: nrp ? parseFloat(nrp) : undefined,
      sdp: sdp ? parseFloat(sdp) : undefined,
      npp: npp ? parseFloat(npp) : undefined,
      clp: clp ? parseFloat(clp) : undefined,
      effectivePriceListDate,
      discount: discount ? parseFloat(discount) : undefined,
      specifications: parsedSpecs,
      hsnCode,
      gst: gst ? parseFloat(gst) : undefined,
      broadCategory,
      cat,
      subCat,
      range,
      segment,
      flag,
      channelType,
      schemeType,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      rating: rating ? parseFloat(rating) : 0,
      reviewCount: reviewCount ? parseInt(reviewCount) : 0,
      popularity: popularity ? parseInt(popularity) : 0
    });

    // Auto-assign itemType if not already set
    if (!product.itemType) {
      const autoItemTypeId = await detectItemType({
        name, variant, itemTypeName, broadCategory, cat, subCat, description,
        category: product.category
      });
      if (autoItemTypeId) {
        product.itemType = autoItemTypeId;
        console.log(`🏷️  Auto-assigned itemType ${autoItemTypeId} to "${name}"`);
      }
    }

    await product.save();
    await product.populate('category');

    // Auto-link company to category so it shows in Categories > Companies column
    if (product.company && product.category) {
      await linkCompanyToCategory(product.company, product.category);
    }

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
      itemCode,
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
      popularity,
      // Pricing fields
      mrp,
      nrp,
      sdp,
      npp,
      clp,
      effectivePriceListDate,
      hsnCode,
      gst,
      // Classification fields
      broadCategory,
      cat,
      subCat,
      range,
      segment,
      flag,
      channelType,
      schemeType
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
    product.company = company && company.length === 24 ? company : product.company;
    product.companyName = company || companyName || product.companyName;
    product.brand = brand !== undefined ? brand : product.brand;
    product.itemType = itemType && itemType.length === 24 ? itemType : product.itemType;
    product.itemTypeName = itemTypeName || product.itemTypeName;
    product.price = price ? parseFloat(price) : product.price;
    product.sku = sku || product.sku;
    product.itemCode = itemCode !== undefined ? itemCode : product.itemCode;
    product.stock = stock !== undefined ? parseInt(stock) : product.stock;
    product.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : product.isActive;
    product.images = images.length > 0 ? images : product.images;
    product.variant = variant !== undefined ? variant : product.variant;
    product.variantDescription = variantDescription || product.variantDescription;
    product.mrp = mrp ? parseFloat(mrp) : (originalPrice ? parseFloat(originalPrice) : product.mrp);
    product.originalPrice = originalPrice ? parseFloat(originalPrice) : product.originalPrice;
    product.nrp = nrp ? parseFloat(nrp) : product.nrp;
    product.sdp = sdp ? parseFloat(sdp) : product.sdp;
    product.npp = npp ? parseFloat(npp) : product.npp;
    product.clp = clp ? parseFloat(clp) : product.clp;
    product.effectivePriceListDate = effectivePriceListDate || product.effectivePriceListDate;
    product.discount = discount ? parseFloat(discount) : product.discount;
    product.specifications = parsedSpecs;
    product.hsnCode = hsnCode !== undefined ? hsnCode : product.hsnCode;
    product.gst = gst ? parseFloat(gst) : product.gst;
    product.broadCategory = broadCategory !== undefined ? broadCategory : product.broadCategory;
    product.cat = cat !== undefined ? cat : product.cat;
    product.subCat = subCat !== undefined ? subCat : product.subCat;
    product.range = range !== undefined ? range : product.range;
    product.segment = segment !== undefined ? segment : product.segment;
    product.flag = flag !== undefined ? flag : product.flag;
    product.channelType = channelType !== undefined ? channelType : product.channelType;
    product.schemeType = schemeType !== undefined ? schemeType : product.schemeType;
    product.tags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : product.tags;
    product.rating = rating !== undefined ? parseFloat(rating) : product.rating;
    product.reviewCount = reviewCount !== undefined ? parseInt(reviewCount) : product.reviewCount;
    product.popularity = popularity !== undefined ? parseInt(popularity) : product.popularity;

    // Auto-assign itemType if not already set (or if name/variant changed)
    if (!product.itemType || name || variant) {
      const autoItemTypeId = await detectItemType({
        name: product.name,
        variant: product.variant,
        itemTypeName: product.itemTypeName,
        broadCategory: product.broadCategory,
        cat: product.cat,
        subCat: product.subCat,
        description: product.description,
        category: product.category
      });
      if (autoItemTypeId && !product.itemType) {
        product.itemType = autoItemTypeId;
        console.log(`🏷️  Auto-assigned itemType ${autoItemTypeId} to "${product.name}"`);
      }
    }

    await product.save();
    await product.populate('category');

    // Auto-link company to category so it shows in Categories > Companies column
    if (product.company && product.category) {
      await linkCompanyToCategory(product.company, product.category);
    }

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

// Get product with company-specific pricing (without companyId)
router.get('/:id/pricing', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('category')
      .populate('itemType')
      .populate('company');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    let finalPrice = product.price;
    let discountPercentage = product.discountPercentage || 0;
    
    res.json({
      success: true,
      data: {
        ...product.toObject(),
        finalPrice,
        discountPercentage,
        savings: product.mrp ? product.mrp - finalPrice : 0
      }
    });
  } catch (error) {
    console.error('Error fetching product pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product pricing',
      error: error.message
    });
  }
});

// Get product with company-specific pricing (with companyId)
router.get('/:id/pricing/:companyId', async (req, res) => {
  try {
    const { id, companyId } = req.params;
    
    const product = await Product.findById(id)
      .populate('category')
      .populate('itemType')
      .populate('company');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    let finalPrice = product.price;
    let discountPercentage = product.discountPercentage || 0;
    
    // Check for company-specific pricing
    if (companyId && product.companyPricing && product.companyPricing.length > 0) {
      const companyPrice = product.companyPricing.find(
        cp => cp.company.toString() === companyId
      );
      
      if (companyPrice) {
        if (companyPrice.specialPrice) {
          finalPrice = companyPrice.specialPrice;
        } else if (companyPrice.discountPercentage) {
          discountPercentage = companyPrice.discountPercentage;
          finalPrice = product.mrp * (1 - discountPercentage / 100);
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        ...product.toObject(),
        finalPrice,
        discountPercentage,
        savings: product.mrp ? product.mrp - finalPrice : 0
      }
    });
  } catch (error) {
    console.error('Error fetching product pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product pricing',
      error: error.message
    });
  }
});

// Update company-specific pricing for a product
router.put('/:id/company-pricing', async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, companyName, discountPercentage, specialPrice } = req.body;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Initialize companyPricing array if it doesn't exist
    if (!product.companyPricing) {
      product.companyPricing = [];
    }
    
    // Check if company pricing already exists
    const existingIndex = product.companyPricing.findIndex(
      cp => cp.company.toString() === companyId
    );
    
    const pricingData = {
      company: companyId,
      companyName,
      discountPercentage: discountPercentage || 0,
      specialPrice: specialPrice || null
    };
    
    if (existingIndex >= 0) {
      // Update existing
      product.companyPricing[existingIndex] = pricingData;
    } else {
      // Add new
      product.companyPricing.push(pricingData);
    }
    
    await product.save();
    
    res.json({
      success: true,
      message: 'Company pricing updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating company pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company pricing',
      error: error.message
    });
  }
});

// Bulk auto-assign itemType to all products that don't have one
// POST /api/products/auto-assign-item-types
router.post('/auto-assign-item-types', async (req, res) => {
  try {
    const { force } = req.body; // if force=true, reassign even if already set
    const query = force ? {} : { $or: [{ itemType: null }, { itemType: { $exists: false } }] };
    const products = await Product.find(query).populate('category');

    let assigned = 0;
    let skipped = 0;

    for (const product of products) {
      const autoId = await detectItemType({
        name: product.name,
        variant: product.variant,
        itemTypeName: product.itemTypeName,
        broadCategory: product.broadCategory,
        cat: product.cat,
        subCat: product.subCat,
        description: product.description,
        category: product.category
      });

      if (autoId) {
        product.itemType = autoId;
        await product.save();
        assigned++;
      } else {
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `Auto-assignment complete. Assigned: ${assigned}, No match found: ${skipped}`,
      assigned,
      skipped
    });
  } catch (error) {
    console.error('Error in auto-assign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync all existing products — links each company to its product categories
// Call once: POST /api/products/sync-company-categories
router.post('/sync-company-categories', async (req, res) => {
  try {
    const products = await Product.find({ company: { $exists: true, $ne: null } });
    let synced = 0;
    for (const p of products) {
      if (p.company && p.category) {
        await linkCompanyToCategory(p.company, p.category);
        synced++;
      }
    }
    res.json({ success: true, message: `Synced ${synced} products` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
