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
  { name: 'Kohler', description: 'Premium bathroom fixtures', isActive: true },
  { name: 'Jaquar', description: 'Luxury bathroom solutions', isActive: true },
  { name: 'Hindware', description: 'Quality sanitaryware', isActive: true }
];

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Create companies
    console.log('Creating companies...');
    await Company.deleteMany({});
    const createdCompanies = await Company.insertMany(companies);
    console.log(`✓ Created ${createdCompanies.length} companies\n`);

    // Create categories
    console.log('Creating categories...');
    await Category.deleteMany({});
    const createdCategories = await Category.insertMany(categories);
    console.log(`✓ Created ${createdCategories.length} categories\n`);

    // Create products
    console.log('Creating products...');
    await Product.deleteMany({});
    
    const products = [];
    const defaultCompanyId = createdCompanies[0]._id; // Use ObjectId instead of name

    // Toilet products
    const toiletCat = createdCategories.find(c => c.name === 'Toilet');
    products.push(
      { name: 'Toilet', variant: 'Basic', variantDescription: 'Basic model', description: 'Standard toilet', category: toiletCat._id, company: defaultCompanyId, price: 2000, originalPrice: 2500, discount: 20, stock: 50, sku: 'TOI-BAS-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Toilet', variant: 'Premium', variantDescription: 'Premium model', description: 'Premium toilet with comfort seat', category: toiletCat._id, company: defaultCompanyId, price: 12000, originalPrice: 15000, discount: 20, stock: 30, sku: 'TOI-PRE-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Toilet', variant: 'Smart', variantDescription: 'Smart toilet', description: 'Smart toilet with bidet', category: toiletCat._id, company: defaultCompanyId, price: 35000, originalPrice: 42000, discount: 17, stock: 15, sku: 'TOI-SMA-001', isActive: true, images: ['/uploads/placeholder.png'] }
    );

    // Shower products
    const showerCat = createdCategories.find(c => c.name === 'Shower');
    products.push(
      { name: 'Shower', variant: 'Basic', variantDescription: 'Basic shower', description: 'Standard shower head', category: showerCat._id, company: defaultCompanyId, price: 500, originalPrice: 700, discount: 29, stock: 100, sku: 'SHO-BAS-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Shower', variant: 'Premium', variantDescription: 'Premium shower', description: 'Premium rain shower', category: showerCat._id, company: defaultCompanyId, price: 2500, originalPrice: 3000, discount: 17, stock: 50, sku: 'SHO-PRE-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Shower', variant: 'Luxury', variantDescription: 'Luxury shower', description: 'Luxury multi-function shower', category: showerCat._id, company: defaultCompanyId, price: 8000, originalPrice: 10000, discount: 20, stock: 25, sku: 'SHO-LUX-001', isActive: true, images: ['/uploads/placeholder.png'] }
    );

    // Wash Basin products
    const basinCat = createdCategories.find(c => c.name === 'Wash Basin');
    products.push(
      { name: 'Wash Basin', variant: 'Basic Round', variantDescription: 'Basic round basin', description: 'Standard round wash basin', category: basinCat._id, company: defaultCompanyId, price: 1500, originalPrice: 2000, discount: 25, stock: 60, sku: 'BAS-BAS-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Wash Basin', variant: 'Premium Square', variantDescription: 'Premium square basin', description: 'Premium square wash basin', category: basinCat._id, company: defaultCompanyId, price: 4000, originalPrice: 5000, discount: 20, stock: 40, sku: 'BAS-PRE-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Wash Basin', variant: 'Designer', variantDescription: 'Designer basin', description: 'Designer vessel basin', category: basinCat._id, company: defaultCompanyId, price: 10000, originalPrice: 12500, discount: 20, stock: 20, sku: 'BAS-DES-001', isActive: true, images: ['/uploads/placeholder.png'] }
    );

    // Faucet products
    const faucetCat = createdCategories.find(c => c.name === 'Faucet');
    products.push(
      { name: 'Faucet', variant: 'Economy', variantDescription: 'Economy faucet', description: 'Basic chrome faucet', category: faucetCat._id, company: defaultCompanyId, price: 300, originalPrice: 400, discount: 25, stock: 150, sku: 'FAU-ECO-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Faucet', variant: 'Premium', variantDescription: 'Premium faucet', description: 'Premium brushed nickel faucet', category: faucetCat._id, company: defaultCompanyId, price: 1500, originalPrice: 2000, discount: 25, stock: 80, sku: 'FAU-PRE-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Faucet', variant: 'Designer', variantDescription: 'Designer faucet', description: 'Designer matte black faucet', category: faucetCat._id, company: defaultCompanyId, price: 3000, originalPrice: 3500, discount: 14, stock: 40, sku: 'FAU-DES-001', isActive: true, images: ['/uploads/placeholder.png'] }
    );

    // Bathtub products
    const bathtubCat = createdCategories.find(c => c.name === 'Bathtub');
    products.push(
      { name: 'Bathtub', variant: 'Basic', variantDescription: 'Basic bathtub', description: 'Standard acrylic bathtub', category: bathtubCat._id, company: defaultCompanyId, price: 8000, originalPrice: 10000, discount: 20, stock: 25, sku: 'BAT-BAS-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Bathtub', variant: 'Premium', variantDescription: 'Premium bathtub', description: 'Premium freestanding bathtub', category: bathtubCat._id, company: defaultCompanyId, price: 25000, originalPrice: 30000, discount: 17, stock: 15, sku: 'BAT-PRE-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Bathtub', variant: 'Jacuzzi', variantDescription: 'Jacuzzi bathtub', description: 'Luxury jacuzzi bathtub', category: bathtubCat._id, company: defaultCompanyId, price: 65000, originalPrice: 78000, discount: 17, stock: 8, sku: 'BAT-JAC-001', isActive: true, images: ['/uploads/placeholder.png'] }
    );

    // Mirror products
    const mirrorCat = createdCategories.find(c => c.name === 'Mirror');
    products.push(
      { name: 'Mirror', variant: 'Basic', variantDescription: 'Basic mirror', description: 'Standard bathroom mirror', category: mirrorCat._id, company: defaultCompanyId, price: 500, originalPrice: 700, discount: 29, stock: 100, sku: 'MIR-BAS-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Mirror', variant: 'LED', variantDescription: 'LED mirror', description: 'LED backlit mirror', category: mirrorCat._id, company: defaultCompanyId, price: 2500, originalPrice: 3000, discount: 17, stock: 50, sku: 'MIR-LED-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Mirror', variant: 'Smart', variantDescription: 'Smart mirror', description: 'Smart mirror with touch controls', category: mirrorCat._id, company: defaultCompanyId, price: 8000, originalPrice: 10000, discount: 20, stock: 25, sku: 'MIR-SMA-001', isActive: true, images: ['/uploads/placeholder.png'] }
    );

    // Tiles products
    const tilesCat = createdCategories.find(c => c.name === 'Tiles');
    products.push(
      { name: 'Tiles', variant: 'Ceramic Basic', variantDescription: 'Basic ceramic tiles', description: 'Standard ceramic floor tiles', category: tilesCat._id, company: defaultCompanyId, price: 25, originalPrice: 35, discount: 29, stock: 1000, sku: 'TIL-CER-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Tiles', variant: 'Porcelain', variantDescription: 'Porcelain tiles', description: 'Premium porcelain tiles', category: tilesCat._id, company: defaultCompanyId, price: 150, originalPrice: 180, discount: 17, stock: 500, sku: 'TIL-POR-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Tiles', variant: 'Marble', variantDescription: 'Marble tiles', description: 'Luxury marble tiles', category: tilesCat._id, company: defaultCompanyId, price: 700, originalPrice: 850, discount: 18, stock: 200, sku: 'TIL-MAR-001', isActive: true, images: ['/uploads/placeholder.png'] }
    );

    // Cabinet products
    const cabinetCat = createdCategories.find(c => c.name === 'Cabinet');
    products.push(
      { name: 'Cabinet', variant: 'Basic', variantDescription: 'Basic cabinet', description: 'Standard bathroom cabinet', category: cabinetCat._id, company: defaultCompanyId, price: 3000, originalPrice: 3800, discount: 21, stock: 40, sku: 'CAB-BAS-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Cabinet', variant: 'Premium', variantDescription: 'Premium cabinet', description: 'Premium wood cabinet', category: cabinetCat._id, company: defaultCompanyId, price: 12000, originalPrice: 15000, discount: 20, stock: 25, sku: 'CAB-PRE-001', isActive: true, images: ['/uploads/placeholder.png'] },
      { name: 'Cabinet', variant: 'Designer', variantDescription: 'Designer cabinet', description: 'Designer vanity cabinet', category: cabinetCat._id, company: defaultCompanyId, price: 20000, originalPrice: 24000, discount: 17, stock: 15, sku: 'CAB-DES-001', isActive: true, images: ['/uploads/placeholder.png'] }
    );

    const createdProducts = await Product.insertMany(products);
    console.log(`✓ Created ${createdProducts.length} products\n`);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Companies: ${createdCompanies.length}`);
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Price Range: ₹25 - ₹65,000`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedData();
