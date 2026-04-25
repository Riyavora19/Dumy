const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');
const Product = require('./models/Product');
const Company = require('./models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

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

const companies = [
  { name: 'Kohler', description: 'Premium bathroom fixtures and fittings', isActive: true, isPartner: true, rating: 4.8 },
  { name: 'Jaquar', description: 'Luxury bathroom solutions', isActive: true, isPartner: true, rating: 4.7 },
  { name: 'Hindware', description: 'Quality sanitaryware products', isActive: true, isPartner: true, rating: 4.6 },
  { name: 'Cera', description: 'Innovative bathroom products', isActive: true, isPartner: true, rating: 4.5 },
  { name: 'Parryware', description: 'Trusted bathroom brand', isActive: true, isPartner: false, rating: 4.4 }
];

// Product templates for each category with multiple companies
const productTemplates = {
  'Toilet': [
    {
      companies: ['Kohler', 'Jaquar', 'Hindware'],
      variants: [
        { name: 'Basic Toilet', price: 3500, originalPrice: 4500, description: 'Entry-level one-piece toilet' },
        { name: 'Standard Toilet', price: 5000, originalPrice: 6500, description: 'Standard one-piece toilet with efficient flushing' },
        { name: 'Comfort Toilet', price: 7500, originalPrice: 9500, description: 'Comfort height toilet with elongated bowl' },
        { name: 'Premium Toilet', price: 12000, originalPrice: 15000, description: 'Premium toilet with soft-close seat and dual flush' },
        { name: 'Deluxe Toilet', price: 18000, originalPrice: 22000, description: 'Deluxe toilet with advanced flushing technology' },
        { name: 'Smart Basic Toilet', price: 25000, originalPrice: 30000, description: 'Smart toilet with basic bidet functions' },
        { name: 'Smart Toilet', price: 35000, originalPrice: 42000, description: 'Smart toilet with bidet, heated seat, and auto functions' },
        { name: 'Smart Premium Toilet', price: 48000, originalPrice: 58000, description: 'Premium smart toilet with advanced features' },
        { name: 'Smart Luxury Toilet', price: 65000, originalPrice: 78000, description: 'Luxury smart toilet with all premium features' },
        { name: 'Smart Elite Toilet', price: 85000, originalPrice: 105000, description: 'Elite smart toilet with customizable settings' },
        { name: 'Smart Ultimate Toilet', price: 120000, originalPrice: 145000, description: 'Ultimate smart toilet with AI features' }
      ]
    }
  ],
  'Shower': [
    {
      companies: ['Kohler', 'Jaquar', 'Cera'],
      variants: [
        { name: 'Basic Shower', price: 1200, originalPrice: 1600, description: 'Basic shower head with chrome finish' },
        { name: 'Standard Shower', price: 1800, originalPrice: 2400, description: 'Standard shower head with adjustable spray' },
        { name: 'Premium Shower', price: 2800, originalPrice: 3500, description: 'Premium shower head with multiple settings' },
        { name: 'Rain Shower', price: 4500, originalPrice: 5500, description: 'Premium rain shower with adjustable settings' },
        { name: 'Overhead Shower', price: 6500, originalPrice: 8000, description: 'Large overhead rain shower' },
        { name: 'Shower Set', price: 9500, originalPrice: 12000, description: 'Complete shower set with hand shower' },
        { name: 'Shower Panel Basic', price: 12000, originalPrice: 15000, description: 'Basic shower panel with body jets' },
        { name: 'Shower Panel', price: 18000, originalPrice: 22000, description: 'Complete shower panel system with body jets' },
        { name: 'Shower Panel Premium', price: 25000, originalPrice: 30000, description: 'Premium shower panel with thermostatic control' },
        { name: 'Shower Panel Luxury', price: 35000, originalPrice: 42000, description: 'Luxury shower panel with LED and music' },
        { name: 'Shower Panel Elite', price: 48000, originalPrice: 58000, description: 'Elite shower panel with all features' }
      ]
    }
  ],
  'Wash Basin': [
    {
      companies: ['Hindware', 'Cera', 'Parryware'],
      variants: [
        { name: 'Basic Basin', price: 1800, originalPrice: 2400, description: 'Basic wall mounted wash basin' },
        { name: 'Table Top Basin Small', price: 2500, originalPrice: 3200, description: 'Small table top wash basin' },
        { name: 'Table Top Basin', price: 3500, originalPrice: 4500, description: 'Modern table top wash basin' },
        { name: 'Table Top Basin Large', price: 4800, originalPrice: 6000, description: 'Large table top wash basin' },
        { name: 'Wall Hung Basin', price: 4500, originalPrice: 5500, description: 'Space-saving wall mounted basin' },
        { name: 'Counter Basin', price: 5500, originalPrice: 7000, description: 'Under counter wash basin' },
        { name: 'Pedestal Basin', price: 6500, originalPrice: 8000, description: 'Classic pedestal wash basin' },
        { name: 'Designer Basin', price: 9500, originalPrice: 12000, description: 'Designer vessel basin' },
        { name: 'Luxury Basin', price: 14000, originalPrice: 18000, description: 'Luxury stone basin' },
        { name: 'Premium Basin', price: 18000, originalPrice: 22000, description: 'Premium marble basin' },
        { name: 'Elite Basin', price: 25000, originalPrice: 30000, description: 'Elite custom basin' }
      ]
    }
  ],
  'Faucet': [
    {
      companies: ['Jaquar', 'Kohler', 'Cera'],
      variants: [
        { name: 'Economy Faucet', price: 600, originalPrice: 900, description: 'Economy chrome faucet' },
        { name: 'Basic Faucet', price: 1000, originalPrice: 1400, description: 'Basic chrome faucet' },
        { name: 'Standard Faucet', price: 1500, originalPrice: 2000, description: 'Standard chrome faucet' },
        { name: 'Premium Faucet', price: 2200, originalPrice: 2800, description: 'Premium brushed nickel faucet' },
        { name: 'Designer Faucet', price: 3200, originalPrice: 4000, description: 'Designer faucet with modern styling' },
        { name: 'Luxury Faucet', price: 4800, originalPrice: 6000, description: 'Luxury matte black faucet' },
        { name: 'Sensor Faucet Basic', price: 6500, originalPrice: 8000, description: 'Basic touchless sensor faucet' },
        { name: 'Sensor Faucet', price: 9500, originalPrice: 12000, description: 'Touchless sensor faucet' },
        { name: 'Sensor Faucet Premium', price: 14000, originalPrice: 17000, description: 'Premium sensor faucet with temperature control' },
        { name: 'Smart Faucet', price: 22000, originalPrice: 27000, description: 'Smart faucet with voice control' },
        { name: 'Smart Faucet Elite', price: 32000, originalPrice: 38000, description: 'Elite smart faucet with all features' }
      ]
    }
  ],
  'Bathtub': [
    {
      companies: ['Kohler', 'Jaquar'],
      variants: [
        { name: 'Basic Bathtub', price: 12000, originalPrice: 15000, description: 'Basic acrylic bathtub' },
        { name: 'Standard Bathtub', price: 18000, originalPrice: 22000, description: 'Standard acrylic bathtub' },
        { name: 'Premium Bathtub', price: 25000, originalPrice: 30000, description: 'Premium acrylic bathtub' },
        { name: 'Freestanding Bathtub', price: 38000, originalPrice: 45000, description: 'Elegant freestanding bathtub' },
        { name: 'Designer Bathtub', price: 52000, originalPrice: 62000, description: 'Designer freestanding bathtub' },
        { name: 'Jacuzzi Basic', price: 68000, originalPrice: 82000, description: 'Basic jacuzzi bathtub with jets' },
        { name: 'Jacuzzi Bathtub', price: 95000, originalPrice: 115000, description: 'Luxury jacuzzi bathtub with jets' },
        { name: 'Jacuzzi Premium', price: 125000, originalPrice: 150000, description: 'Premium jacuzzi with advanced features' },
        { name: 'Spa Bathtub', price: 165000, originalPrice: 195000, description: 'Spa bathtub with chromotherapy' },
        { name: 'Spa Premium', price: 220000, originalPrice: 260000, description: 'Premium spa bathtub with all features' },
        { name: 'Spa Ultimate', price: 300000, originalPrice: 350000, description: 'Ultimate spa bathtub experience' }
      ]
    }
  ],
  'Mirror': [
    {
      companies: ['Kohler', 'Hindware', 'Cera'],
      variants: [
        { name: 'Basic Mirror', price: 800, originalPrice: 1200, description: 'Basic bathroom mirror' },
        { name: 'Standard Mirror', price: 1400, originalPrice: 1800, description: 'Standard bathroom mirror' },
        { name: 'Framed Mirror', price: 2200, originalPrice: 2800, description: 'Framed bathroom mirror' },
        { name: 'LED Mirror Basic', price: 3500, originalPrice: 4500, description: 'Basic LED backlit mirror' },
        { name: 'LED Mirror', price: 5500, originalPrice: 7000, description: 'LED backlit bathroom mirror' },
        { name: 'LED Mirror Premium', price: 8500, originalPrice: 10500, description: 'Premium LED mirror with dimmer' },
        { name: 'Smart Mirror Basic', price: 12000, originalPrice: 15000, description: 'Basic smart mirror with touch controls' },
        { name: 'Smart Mirror', price: 18000, originalPrice: 22000, description: 'Smart mirror with touch controls and defogger' },
        { name: 'Smart Mirror Premium', price: 25000, originalPrice: 30000, description: 'Premium smart mirror with Bluetooth' },
        { name: 'Smart Mirror Luxury', price: 35000, originalPrice: 42000, description: 'Luxury smart mirror with display' },
        { name: 'Smart Mirror Elite', price: 48000, originalPrice: 58000, description: 'Elite smart mirror with AI features' }
      ]
    }
  ],
  'Tiles': [
    {
      companies: ['Cera', 'Parryware', 'Hindware'],
      variants: [
        { name: 'Ceramic Tiles Basic', price: 35, originalPrice: 50, description: 'Basic ceramic floor tiles (per sq ft)' },
        { name: 'Ceramic Tiles', price: 55, originalPrice: 75, description: 'Standard ceramic floor tiles (per sq ft)' },
        { name: 'Ceramic Tiles Premium', price: 85, originalPrice: 110, description: 'Premium ceramic tiles (per sq ft)' },
        { name: 'Porcelain Tiles Basic', price: 120, originalPrice: 150, description: 'Basic porcelain tiles (per sq ft)' },
        { name: 'Porcelain Tiles', price: 180, originalPrice: 220, description: 'Premium porcelain tiles (per sq ft)' },
        { name: 'Porcelain Tiles Premium', price: 250, originalPrice: 300, description: 'Premium porcelain tiles (per sq ft)' },
        { name: 'Marble Tiles Basic', price: 350, originalPrice: 450, description: 'Basic marble tiles (per sq ft)' },
        { name: 'Marble Tiles', price: 550, originalPrice: 680, description: 'Standard marble tiles (per sq ft)' },
        { name: 'Marble Tiles Premium', price: 850, originalPrice: 1050, description: 'Premium marble tiles (per sq ft)' },
        { name: 'Italian Marble Tiles', price: 1200, originalPrice: 1500, description: 'Italian marble tiles (per sq ft)' },
        { name: 'Designer Tiles', price: 1800, originalPrice: 2200, description: 'Designer luxury tiles (per sq ft)' }
      ]
    }
  ],
  'Cabinet': [
    {
      companies: ['Kohler', 'Jaquar', 'Hindware'],
      variants: [
        { name: 'Basic Cabinet', price: 3500, originalPrice: 4500, description: 'Basic wall mounted cabinet' },
        { name: 'Wall Cabinet', price: 5500, originalPrice: 7000, description: 'Wall mounted storage cabinet' },
        { name: 'Wall Cabinet Premium', price: 8500, originalPrice: 10500, description: 'Premium wall cabinet with mirror' },
        { name: 'Floor Cabinet', price: 9500, originalPrice: 12000, description: 'Floor standing cabinet' },
        { name: 'Vanity Cabinet Basic', price: 12000, originalPrice: 15000, description: 'Basic bathroom vanity with sink' },
        { name: 'Vanity Cabinet', price: 18000, originalPrice: 22000, description: 'Bathroom vanity with sink' },
        { name: 'Vanity Cabinet Premium', price: 25000, originalPrice: 30000, description: 'Premium vanity with marble top' },
        { name: 'Mirror Cabinet', price: 14000, originalPrice: 17000, description: 'Cabinet with integrated mirror' },
        { name: 'Designer Cabinet', price: 32000, originalPrice: 38000, description: 'Designer bathroom cabinet' },
        { name: 'Luxury Cabinet', price: 45000, originalPrice: 55000, description: 'Luxury wood cabinet' },
        { name: 'Elite Cabinet', price: 65000, originalPrice: 78000, description: 'Elite custom cabinet' }
      ]
    }
  ]
};

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Company.deleteMany({});
    console.log('✓ Cleared existing data\n');

    // Create companies
    console.log('Creating companies...');
    const createdCompanies = await Company.insertMany(companies);
    console.log(`✓ Created ${createdCompanies.length} companies\n`);

    // Create categories
    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✓ Created ${createdCategories.length} categories\n`);

    // Helper to get company by name
    const getCompany = (name) => createdCompanies.find(c => c.name === name);
    const getCategory = (name) => createdCategories.find(c => c.name === name);

    // Create products
    console.log('Creating products...');
    const products = [];
    let productCount = 0;

    for (const [categoryName, templates] of Object.entries(productTemplates)) {
      const category = getCategory(categoryName);
      if (!category) continue;

      console.log(`\n${category.icon} ${categoryName}:`);

      for (const template of templates) {
        for (const companyName of template.companies) {
          const company = getCompany(companyName);
          if (!company) continue;

          console.log(`  📦 ${companyName}:`);

          for (const variant of template.variants) {
            const product = {
              name: variant.name,
              variant: companyName, // Use company name as variant
              variantDescription: `${companyName} ${variant.name}`,
              description: variant.description,
              category: category._id,
              company: company._id,
              companyName: company.name,
              price: variant.price,
              originalPrice: variant.originalPrice,
              discount: Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100),
              stock: Math.floor(Math.random() * 50) + 10,
              sku: `${categoryName.substring(0, 3).toUpperCase()}-${companyName.substring(0, 3).toUpperCase()}-${String(productCount).padStart(3, '0')}`,
              isActive: true,
              images: ['/uploads/1776849067517-337759119.png'],
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
            console.log(`    - ${variant.name} - ₹${variant.price.toLocaleString()}`);
            productCount++;
          }
        }
      }
    }

    const createdProducts = await Product.insertMany(products);
    console.log(`\n✓ Created ${createdProducts.length} products\n`);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Companies: ${createdCompanies.length}`);
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    
    // Show products per category
    console.log('\n📁 Products per Category:');
    for (const cat of createdCategories) {
      const count = createdProducts.filter(p => p.category.toString() === cat._id.toString()).length;
      console.log(`   ${cat.icon} ${cat.name}: ${count} products`);
    }

    // Show products per company
    console.log('\n🏢 Products per Company:');
    for (const comp of createdCompanies) {
      const count = createdProducts.filter(p => p.company.toString() === comp._id.toString()).length;
      console.log(`   ${comp.name}: ${count} products`);
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedData();
