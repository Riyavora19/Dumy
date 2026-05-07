require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Company = require('./models/Company');
const ProductItemType = require('./models/ProductItemType');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function reseedWithDiscounts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Get existing companies with their discount percentages
    const companies = await Company.find();
    console.log('📊 Companies with discounts:');
    companies.forEach(c => {
      console.log(`   ${c.name}: ${c.defaultDiscountPercentage}% discount`);
    });
    console.log('');

    // Clear only products, categories, and item types (keep companies)
    console.log('Clearing existing products, categories, and item types...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await ProductItemType.deleteMany({});
    console.log('✓ Cleared\n');

    // Create categories
    const categories = [
      { name: 'Toilet', icon: '🚽', color: '#e8f0e0', description: 'Premium toilets and commodes', isActive: true },
      { name: 'Shower', icon: '🚿', color: '#d6e4f0', description: 'Modern shower systems', isActive: true },
      { name: 'Wash Basin', icon: '🚰', color: '#ffe4e8', description: 'Elegant wash basins and sinks', isActive: true },
      { name: 'Faucet', icon: '🚰', color: '#fff4e0', description: 'Designer faucets and taps', isActive: true },
      { name: 'Bathtub', icon: '🛁', color: '#f0e8ff', description: 'Luxury bathtubs and jacuzzis', isActive: true },
      { name: 'Mirror', icon: '🪞', color: '#e0f7ff', description: 'Bathroom mirrors and cabinets', isActive: true },
      { name: 'Tiles', icon: '⬜', color: '#f5f5f5', description: 'Floor and wall tiles', isActive: true },
      { name: 'Cabinet', icon: '🗄️', color: '#ffe8d6', description: 'Storage cabinets and vanities', isActive: true }
    ];

    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✓ Created ${createdCategories.length} categories\n`);

    // Create item types
    const itemTypes = [
      { name: 'One Piece Toilet', categoryName: 'Toilet', description: 'One-piece toilet design' },
      { name: 'Two Piece Toilet', categoryName: 'Toilet', description: 'Two-piece toilet design' },
      { name: 'Wall Hung Toilet', categoryName: 'Toilet', description: 'Wall-mounted toilet' },
      { name: 'Smart Toilet', categoryName: 'Toilet', description: 'Smart toilet with advanced features' },
      { name: 'Shower Head', categoryName: 'Shower', description: 'Shower heads and fixtures' },
      { name: 'Shower Panel', categoryName: 'Shower', description: 'Complete shower panel systems' },
      { name: 'Rain Shower', categoryName: 'Shower', description: 'Rain shower systems' },
      { name: 'Table Top Basin', categoryName: 'Wash Basin', description: 'Table top wash basins' },
      { name: 'Wall Hung Basin', categoryName: 'Wash Basin', description: 'Wall mounted basins' },
      { name: 'Pedestal Basin', categoryName: 'Wash Basin', description: 'Pedestal wash basins' },
      { name: 'Basin Faucet', categoryName: 'Faucet', description: 'Basin faucets and taps' },
      { name: 'Sensor Faucet', categoryName: 'Faucet', description: 'Touchless sensor faucets' },
      { name: 'Freestanding Bathtub', categoryName: 'Bathtub', description: 'Freestanding bathtubs' },
      { name: 'Jacuzzi', categoryName: 'Bathtub', description: 'Jacuzzi and spa bathtubs' },
      { name: 'LED Mirror', categoryName: 'Mirror', description: 'LED backlit mirrors' },
      { name: 'Smart Mirror', categoryName: 'Mirror', description: 'Smart mirrors with features' },
      { name: 'Floor Tiles', categoryName: 'Tiles', description: 'Floor tiles' },
      { name: 'Wall Tiles', categoryName: 'Tiles', description: 'Wall tiles' },
      { name: 'Wall Cabinet', categoryName: 'Cabinet', description: 'Wall mounted cabinets' },
      { name: 'Vanity Cabinet', categoryName: 'Cabinet', description: 'Vanity cabinets with sink' }
    ];

    console.log('Creating item types...');
    const itemTypesToCreate = itemTypes.map(it => ({
      name: it.name,
      description: it.description,
      category: createdCategories.find(c => c.name === it.categoryName)?._id
    })).filter(it => it.category);
    
    const createdItemTypes = await ProductItemType.insertMany(itemTypesToCreate);
    console.log(`✓ Created ${createdItemTypes.length} item types\n`);

    // Helper functions
    const getCompany = (name) => companies.find(c => c.name === name);
    const getCategory = (name) => createdCategories.find(c => c.name === name);
    const getItemType = (name) => createdItemTypes.find(it => it.name === name);

    // Product templates (same as seedComprehensive.js but we'll apply company discounts)
    const productTemplates = {
      'Toilet': [
        {
          companies: ['Kohler', 'Jaquar', 'Hindware'],
          itemTypeName: 'One Piece Toilet',
          variants: [
            { name: 'Basic Toilet', mrp: 4500 },
            { name: 'Standard Toilet', mrp: 6500 },
            { name: 'Comfort Toilet', mrp: 9500 },
            { name: 'Premium Toilet', mrp: 15000 },
            { name: 'Deluxe Toilet', mrp: 22000 },
            { name: 'Smart Basic Toilet', mrp: 30000, itemTypeName: 'Smart Toilet' },
            { name: 'Smart Toilet', mrp: 42000, itemTypeName: 'Smart Toilet' },
            { name: 'Smart Premium Toilet', mrp: 58000, itemTypeName: 'Smart Toilet' },
            { name: 'Smart Luxury Toilet', mrp: 78000, itemTypeName: 'Smart Toilet' },
            { name: 'Smart Elite Toilet', mrp: 105000, itemTypeName: 'Smart Toilet' },
            { name: 'Smart Ultimate Toilet', mrp: 145000, itemTypeName: 'Smart Toilet' }
          ]
        }
      ],
      'Shower': [
        {
          companies: ['Kohler', 'Jaquar', 'Cera'],
          itemTypeName: 'Shower Head',
          variants: [
            { name: 'Basic Shower', mrp: 1600 },
            { name: 'Standard Shower', mrp: 2400 },
            { name: 'Premium Shower', mrp: 3500 },
            { name: 'Rain Shower', mrp: 5500 },
            { name: 'Overhead Shower', mrp: 8000 },
            { name: 'Shower Set', mrp: 12000 },
            { name: 'Shower Panel Basic', mrp: 15000 },
            { name: 'Shower Panel', mrp: 22000 },
            { name: 'Shower Panel Premium', mrp: 30000 },
            { name: 'Shower Panel Luxury', mrp: 42000 },
            { name: 'Shower Panel Elite', mrp: 58000 }
          ]
        }
      ],
      'Wash Basin': [
        {
          companies: ['Hindware', 'Cera', 'Parryware'],
          itemTypeName: 'Table Top Basin',
          variants: [
            { name: 'Basic Basin', mrp: 2400, itemTypeName: 'Wall Hung Basin' },
            { name: 'Table Top Basin Small', mrp: 3200 },
            { name: 'Table Top Basin', mrp: 4500 },
            { name: 'Table Top Basin Large', mrp: 6000 },
            { name: 'Wall Hung Basin', mrp: 5500, itemTypeName: 'Wall Hung Basin' },
            { name: 'Counter Basin', mrp: 7000 },
            { name: 'Pedestal Basin', mrp: 8000, itemTypeName: 'Pedestal Basin' },
            { name: 'Designer Basin', mrp: 12000 },
            { name: 'Luxury Basin', mrp: 18000 },
            { name: 'Premium Basin', mrp: 22000 },
            { name: 'Elite Basin', mrp: 30000 }
          ]
        }
      ],
      'Faucet': [
        {
          companies: ['Jaquar', 'Kohler', 'Cera'],
          itemTypeName: 'Basin Faucet',
          variants: [
            { name: 'Economy Faucet', mrp: 900 },
            { name: 'Basic Faucet', mrp: 1400 },
            { name: 'Standard Faucet', mrp: 2000 },
            { name: 'Premium Faucet', mrp: 2800 },
            { name: 'Designer Faucet', mrp: 4000 },
            { name: 'Luxury Faucet', mrp: 6000 },
            { name: 'Sensor Faucet Basic', mrp: 8000, itemTypeName: 'Sensor Faucet' },
            { name: 'Sensor Faucet', mrp: 12000, itemTypeName: 'Sensor Faucet' },
            { name: 'Sensor Faucet Premium', mrp: 17000, itemTypeName: 'Sensor Faucet' },
            { name: 'Smart Faucet', mrp: 27000, itemTypeName: 'Sensor Faucet' },
            { name: 'Smart Faucet Elite', mrp: 38000, itemTypeName: 'Sensor Faucet' }
          ]
        }
      ],
      'Bathtub': [
        {
          companies: ['Kohler', 'Jaquar'],
          itemTypeName: 'Freestanding Bathtub',
          variants: [
            { name: 'Basic Bathtub', mrp: 15000 },
            { name: 'Standard Bathtub', mrp: 22000 },
            { name: 'Premium Bathtub', mrp: 30000 },
            { name: 'Freestanding Bathtub', mrp: 45000 },
            { name: 'Designer Bathtub', mrp: 62000 },
            { name: 'Jacuzzi Basic', mrp: 82000, itemTypeName: 'Jacuzzi' },
            { name: 'Jacuzzi Bathtub', mrp: 115000, itemTypeName: 'Jacuzzi' },
            { name: 'Jacuzzi Premium', mrp: 150000, itemTypeName: 'Jacuzzi' },
            { name: 'Spa Bathtub', mrp: 195000, itemTypeName: 'Jacuzzi' },
            { name: 'Spa Premium', mrp: 260000, itemTypeName: 'Jacuzzi' },
            { name: 'Spa Ultimate', mrp: 350000, itemTypeName: 'Jacuzzi' }
          ]
        }
      ],
      'Mirror': [
        {
          companies: ['Kohler', 'Hindware', 'Cera'],
          itemTypeName: 'LED Mirror',
          variants: [
            { name: 'Basic Mirror', mrp: 1000 },
            { name: 'Standard Mirror', mrp: 1800 },
            { name: 'Framed Mirror', mrp: 2800 },
            { name: 'LED Mirror Basic', mrp: 4500 },
            { name: 'LED Mirror', mrp: 7000 },
            { name: 'LED Mirror Premium', mrp: 10500 },
            { name: 'Smart Mirror Basic', mrp: 15000, itemTypeName: 'Smart Mirror' },
            { name: 'Smart Mirror', mrp: 22000, itemTypeName: 'Smart Mirror' },
            { name: 'Smart Mirror Premium', mrp: 30000, itemTypeName: 'Smart Mirror' },
            { name: 'Smart Mirror Luxury', mrp: 42000, itemTypeName: 'Smart Mirror' },
            { name: 'Smart Mirror Elite', mrp: 58000, itemTypeName: 'Smart Mirror' }
          ]
        }
      ],
      'Tiles': [
        {
          companies: ['Cera', 'Parryware', 'Hindware'],
          itemTypeName: 'Floor Tiles',
          variants: [
            { name: 'Ceramic Tiles Basic', mrp: 45 },
            { name: 'Ceramic Tiles', mrp: 70 },
            { name: 'Ceramic Tiles Premium', mrp: 105 },
            { name: 'Porcelain Tiles Basic', mrp: 150 },
            { name: 'Porcelain Tiles', mrp: 220 },
            { name: 'Porcelain Tiles Premium', mrp: 310 },
            { name: 'Marble Tiles Basic', mrp: 430 },
            { name: 'Marble Tiles', mrp: 680 },
            { name: 'Marble Tiles Premium', mrp: 1050 },
            { name: 'Italian Marble Tiles', mrp: 1500 },
            { name: 'Designer Tiles', mrp: 2200 }
          ]
        }
      ],
      'Cabinet': [
        {
          companies: ['Kohler', 'Jaquar', 'Hindware'],
          itemTypeName: 'Wall Cabinet',
          variants: [
            { name: 'Basic Cabinet', mrp: 4500 },
            { name: 'Wall Cabinet', mrp: 7000 },
            { name: 'Wall Cabinet Premium', mrp: 10500 },
            { name: 'Floor Cabinet', mrp: 12000 },
            { name: 'Vanity Cabinet Basic', mrp: 15000, itemTypeName: 'Vanity Cabinet' },
            { name: 'Vanity Cabinet', mrp: 22000, itemTypeName: 'Vanity Cabinet' },
            { name: 'Vanity Cabinet Premium', mrp: 30000, itemTypeName: 'Vanity Cabinet' },
            { name: 'Mirror Cabinet', mrp: 17000 },
            { name: 'Designer Cabinet', mrp: 38000 },
            { name: 'Luxury Cabinet', mrp: 55000 },
            { name: 'Elite Cabinet', mrp: 78000 }
          ]
        }
      ]
    };

    // Create products with company-specific discounts
    console.log('Creating products with company-specific discounts...\n');
    const products = [];
    let productCount = 0;

    for (const [categoryName, templates] of Object.entries(productTemplates)) {
      const category = getCategory(categoryName);
      if (!category) continue;

      console.log(`${category.icon} ${categoryName}:`);

      for (const template of templates) {
        for (const companyName of template.companies) {
          const company = getCompany(companyName);
          if (!company) continue;

          const discount = company.defaultDiscountPercentage || 0;
          console.log(`  📦 ${companyName} (${discount}% discount):`);

          for (const variant of template.variants) {
            const itemTypeName = variant.itemTypeName || template.itemTypeName;
            const itemType = getItemType(itemTypeName);

            // Calculate discounted price from MRP
            const mrp = variant.mrp;
            const price = Math.round(mrp * (1 - discount / 100));

            const product = {
              name: variant.name,
              variant: companyName,
              variantDescription: `${companyName} ${variant.name}`,
              description: `Premium ${variant.name.toLowerCase()} from ${companyName}`,
              category: category._id,
              company: company._id,
              companyName: company.name,
              itemType: itemType?._id,
              itemTypeName: itemType?.name,
              mrp: mrp,
              price: price,
              originalPrice: mrp,
              discountPercentage: discount,
              discount: discount,
              stock: Math.floor(Math.random() * 50) + 10,
              sku: `${categoryName.substring(0, 3).toUpperCase()}-${companyName.substring(0, 3).toUpperCase()}-${String(productCount).padStart(3, '0')}`,
              isActive: true,
              images: [], // No images - will show placeholder
              specifications: {
                material: 'Premium Grade',
                size: 'Standard',
                color: 'White',
                weight: `${Math.floor(Math.random() * 20) + 5}kg`,
                dimensions: 'Standard size',
                warranty: '2 Years',
                features: ['Easy Installation', 'Durable Construction', 'Modern Design', 'Water Efficient']
              }
            };

            products.push(product);
            console.log(`    - ${variant.name}: MRP ₹${mrp.toLocaleString()} → ₹${price.toLocaleString()} (${discount}% OFF)`);
            productCount++;
          }
          console.log('');
        }
      }
    }

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products with company-specific discounts!\n`);

    console.log('📊 Summary:');
    console.log(`   Companies: ${companies.length}`);
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Item Types: ${createdItemTypes.length}`);
    console.log(`   Products: ${createdProducts.length}\n`);

    console.log('🏢 Company Discounts Applied:');
    for (const comp of companies) {
      const count = createdProducts.filter(p => p.company.toString() === comp._id.toString()).length;
      console.log(`   ${comp.name}: ${comp.defaultDiscountPercentage}% discount on ${count} products`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

reseedWithDiscounts();
