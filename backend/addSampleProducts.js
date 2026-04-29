const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Company = require('./models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

const addProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected...');

    // Get first category and company (or create defaults)
    let category = await Category.findOne();
    if (!category) {
      category = await Category.create({
        name: 'Bathroom Fittings',
        description: 'Bathroom products and accessories',
        isActive: true
      });
      console.log('Created default category');
    }

    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({
        name: 'Premium Fittings Co.',
        description: 'Quality bathroom products',
        isActive: true
      });
      console.log('Created default company');
    }

    // Sample products
    const products = [
      {
        name: 'Premium Toilet Seat',
        description: 'Soft-close premium toilet seat with quick-release hinges',
        category: category._id,
        company: company._id,
        companyName: company.name,
        variant: 'White Ceramic',
        price: 8500,
        originalPrice: 10000,
        images: ['/uploads/product-placeholder.jpg'],
        sku: 'PTS-001',
        stock: 50,
        specifications: {
          material: 'Ceramic',
          color: 'White',
          warranty: '2 years'
        },
        isActive: true
      },
      {
        name: 'Basin Mixer Tap',
        description: 'Single lever basin mixer with aerator',
        category: category._id,
        company: company._id,
        companyName: company.name,
        variant: 'Chrome Finish',
        price: 4500,
        originalPrice: 5500,
        images: ['/uploads/product-placeholder.jpg'],
        sku: 'BMT-002',
        stock: 75,
        specifications: {
          material: 'Brass',
          color: 'Chrome',
          warranty: '5 years'
        },
        isActive: true
      },
      {
        name: 'Shower Panel',
        description: 'Stainless steel shower panel with rain shower',
        category: category._id,
        company: company._id,
        companyName: company.name,
        variant: 'Stainless Steel',
        price: 15000,
        originalPrice: 18000,
        images: ['/uploads/product-placeholder.jpg'],
        sku: 'SP-003',
        stock: 30,
        specifications: {
          material: 'Stainless Steel',
          warranty: '3 years'
        },
        isActive: true
      },
      {
        name: 'Wall Hung Basin',
        description: 'Modern wall-mounted ceramic basin',
        category: category._id,
        company: company._id,
        companyName: company.name,
        variant: 'White Ceramic',
        price: 6500,
        originalPrice: 7500,
        images: ['/uploads/product-placeholder.jpg'],
        sku: 'WHB-004',
        stock: 40,
        specifications: {
          material: 'Ceramic',
          size: '550mm x 450mm',
          warranty: '2 years'
        },
        isActive: true
      },
      {
        name: 'Mirror Cabinet',
        description: 'LED mirror cabinet with storage',
        category: category._id,
        company: company._id,
        companyName: company.name,
        variant: 'LED Illuminated',
        price: 12000,
        originalPrice: 14000,
        images: ['/uploads/product-placeholder.jpg'],
        sku: 'MC-005',
        stock: 25,
        specifications: {
          material: 'Glass & Aluminum',
          size: '600mm x 700mm',
          warranty: '1 year'
        },
        isActive: true
      },
      {
        name: 'Flush Tank',
        description: 'Dual flush concealed cistern',
        category: category._id,
        company: company._id,
        companyName: company.name,
        variant: 'Dual Flush',
        price: 5500,
        originalPrice: 6500,
        images: ['/uploads/product-placeholder.jpg'],
        sku: 'FT-006',
        stock: 60,
        specifications: {
          material: 'Plastic',
          warranty: '3 years'
        },
        isActive: true
      },
      {
        name: 'Towel Rail',
        description: 'Stainless steel towel rail',
        category: category._id,
        company: company._id,
        companyName: company.name,
        variant: 'Chrome Finish',
        price: 2500,
        originalPrice: 3000,
        images: ['/uploads/product-placeholder.jpg'],
        sku: 'TR-007',
        stock: 100,
        specifications: {
          material: 'Stainless Steel',
          size: '600mm',
          warranty: '5 years'
        },
        isActive: true
      },
      {
        name: 'Exhaust Fan',
        description: 'Silent operation exhaust fan',
        category: category._id,
        company: company._id,
        companyName: company.name,
        variant: 'White',
        price: 3500,
        originalPrice: 4000,
        images: ['/uploads/product-placeholder.jpg'],
        sku: 'EF-008',
        stock: 80,
        specifications: {
          material: 'Plastic & Metal',
          size: '200mm',
          warranty: '2 years'
        },
        isActive: true
      }
    ];

    const created = await Product.insertMany(products);
    console.log(`\n✅ Successfully added ${created.length} products!`);
    
    console.log('\nProducts added:');
    created.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - ₹${p.price} (SKU: ${p.sku})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding products:', error);
    process.exit(1);
  }
};

addProducts();
