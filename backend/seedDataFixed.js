const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');
const Product = require('./models/Product');
const Company = require('./models/Company');
const ProductItemType = require('./models/ProductItemType');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

const categories = [
  { name: 'Bathroom', icon: '🚽', color: '#e8f0e0', description: 'Complete bathroom solutions', isActive: true },
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

const itemTypes = [
  { name: 'Wall Cabinet', categoryName: 'Cabinet', description: 'Wall-mounted storage cabinets' },
  { name: 'Floor Cabinet', categoryName: 'Cabinet', description: 'Floor-standing cabinets' },
  { name: 'Vanity Unit', categoryName: 'Cabinet', description: 'Bathroom vanity units' },
  { name: 'Medicine Cabinet', categoryName: 'Cabinet', description: 'Medicine storage cabinets' },
  { name: 'Wall Mirror', categoryName: 'Mirror', description: 'Wall-mounted mirrors' },
  { name: 'LED Mirror', categoryName: 'Mirror', description: 'LED backlit mirrors' },
  { name: 'Cabinet Mirror', categoryName: 'Mirror', description: 'Mirror with storage cabinet' },
  { name: 'One Piece Toilet', categoryName: 'Toilet', description: 'One-piece toilet design' },
  { name: 'Two Piece Toilet', categoryName: 'Toilet', description: 'Two-piece toilet design' },
  { name: 'Wall Hung Toilet', categoryName: 'Toilet', description: 'Wall-mounted toilet' }
];

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Company.deleteMany({});
    await ProductItemType.deleteMany({});
    console.log('✓ Cleared existing data\n');

    // Create companies
    console.log('Creating companies...');
    const createdCompanies = await Company.insertMany(companies);
    console.log(`✓ Created ${createdCompanies.length} companies\n`);

    // Create categories
    console.log('Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✓ Created ${createdCategories.length} categories\n`);

    // Create item types
    console.log('Creating item types...');
    const itemTypesToCreate = itemTypes.map(it => ({
      name: it.name,
      description: it.description,
      category: createdCategories.find(c => c.name === it.categoryName)?._id
    })).filter(it => it.category); // Only include if category found
    
    const createdItemTypes = await ProductItemType.insertMany(itemTypesToCreate);
    console.log(`✓ Created ${createdItemTypes.length} item types\n`);

    // Helper function to get random company
    const getCompany = (preferredName = null) => {
      if (preferredName) {
        const company = createdCompanies.find(c => c.name === preferredName);
        if (company) return company;
      }
      return createdCompanies[Math.floor(Math.random() * createdCompanies.length)];
    };

    // Helper function to get category
    const getCategory = (name) => createdCategories.find(c => c.name === name);

    // Helper function to get item type
    const getItemType = (name) => createdItemTypes.find(it => it.name === name);

    // Create products
    console.log('Creating products...');
    const products = [];

    // Cabinet products with descriptive names
    const cabinetCat = getCategory('Cabinet');
    const bathroomCat = getCategory('Bathroom');
    
    // Wall Cabinets
    const wallCabinetType = getItemType('Wall Cabinet');
    products.push(
      {
        name: 'Wall Cabinet with Mirror',
        variant: 'Basic White',
        variantDescription: 'Basic white wall cabinet with integrated mirror',
        description: 'Space-saving wall cabinet with built-in mirror, perfect for small bathrooms',
        category: cabinetCat._id,
        company: getCompany('Kohler')._id,
        companyName: 'Kohler',
        itemType: wallCabinetType._id,
        itemTypeName: 'Wall Cabinet',
        price: 4500,
        originalPrice: 5500,
        discount: 18,
        stock: 35,
        sku: 'KOH-WCM-BAS-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'MDF with laminate finish',
          size: '24" x 30"',
          color: 'White',
          weight: '12kg',
          dimensions: '24" W x 30" H x 6" D',
          warranty: '2 Years',
          features: ['Integrated Mirror', 'Soft-close hinges', 'Moisture resistant', 'Easy installation']
        }
      },
      {
        name: 'Wall Cabinet with Mirror',
        variant: 'Premium Oak',
        variantDescription: 'Premium oak finish wall cabinet with LED mirror',
        description: 'Elegant oak finish wall cabinet with LED-lit mirror and premium hardware',
        category: cabinetCat._id,
        company: getCompany('Kohler')._id,
        companyName: 'Kohler',
        itemType: wallCabinetType._id,
        itemTypeName: 'Wall Cabinet',
        price: 8500,
        originalPrice: 10500,
        discount: 19,
        stock: 25,
        sku: 'KOH-WCM-PRE-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Solid oak wood',
          size: '30" x 36"',
          color: 'Natural Oak',
          weight: '18kg',
          dimensions: '30" W x 36" H x 8" D',
          warranty: '3 Years',
          features: ['LED Mirror', 'Soft-close hinges', 'Adjustable shelves', 'Premium finish']
        }
      },
      {
        name: 'Wall Cabinet with Mirror',
        variant: 'Luxury Walnut',
        variantDescription: 'Luxury walnut wall cabinet with smart mirror',
        description: 'High-end walnut cabinet with smart mirror featuring touch controls and defogger',
        category: cabinetCat._id,
        company: getCompany('Kohler')._id,
        companyName: 'Kohler',
        price: 15000,
        originalPrice: 18000,
        discount: 17,
        stock: 15,
        sku: 'KOH-WCM-LUX-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Premium walnut wood',
          size: '36" x 42"',
          color: 'Dark Walnut',
          weight: '25kg',
          dimensions: '36" W x 42" H x 10" D',
          warranty: '5 Years',
          features: ['Smart Mirror', 'Touch controls', 'Defogger', 'USB charging port', 'Soft-close doors']
        }
      }
    );

    // Vanity Cabinets
    const vanityType = getItemType('Vanity Unit');
    products.push(
      {
        name: 'Bathroom Vanity Cabinet',
        variant: 'Single Sink Basic',
        variantDescription: 'Basic single sink vanity unit',
        description: 'Compact single sink vanity perfect for small bathrooms',
        category: cabinetCat._id,
        company: getCompany('Jaquar')._id,
        companyName: 'Jaquar',
        itemType: vanityType._id,
        itemTypeName: 'Vanity Unit',
        price: 12000,
        originalPrice: 15000,
        discount: 20,
        stock: 30,
        sku: 'JAQ-VAN-BAS-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Engineered wood',
          size: '24" vanity',
          color: 'White',
          weight: '35kg',
          dimensions: '24" W x 34" H x 18" D',
          warranty: '2 Years',
          features: ['Ceramic sink included', 'Soft-close drawers', 'Water resistant', 'Pre-drilled for faucet']
        }
      },
      {
        name: 'Bathroom Vanity Cabinet',
        variant: 'Double Sink Premium',
        variantDescription: 'Premium double sink vanity unit',
        description: 'Spacious double sink vanity with ample storage',
        category: cabinetCat._id,
        company: getCompany('Jaquar')._id,
        companyName: 'Jaquar',
        itemType: vanityType._id,
        itemTypeName: 'Vanity Unit',
        price: 28000,
        originalPrice: 35000,
        discount: 20,
        stock: 18,
        sku: 'JAQ-VAN-PRE-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Solid wood',
          size: '60" vanity',
          color: 'Espresso',
          weight: '75kg',
          dimensions: '60" W x 34" H x 22" D',
          warranty: '3 Years',
          features: ['Dual ceramic sinks', 'Marble countertop', 'Soft-close drawers', 'Chrome hardware']
        }
      }
    );

    // Toilet products
    const toiletCat = getCategory('Toilet');
    const onePieceType = getItemType('One Piece Toilet');
    const twoPieceType = getItemType('Two Piece Toilet');
    
    products.push(
      {
        name: 'One Piece Toilet',
        variant: 'Basic White',
        variantDescription: 'Basic one-piece toilet',
        description: 'Standard one-piece toilet with efficient flushing system',
        category: toiletCat._id,
        company: getCompany('Hindware')._id,
        companyName: 'Hindware',
        itemType: onePieceType._id,
        itemTypeName: 'One Piece Toilet',
        price: 8000,
        originalPrice: 10000,
        discount: 20,
        stock: 40,
        sku: 'HIN-TOI-BAS-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Vitreous china',
          size: 'Standard',
          color: 'White',
          weight: '45kg',
          dimensions: '28" L x 16" W x 30" H',
          warranty: '5 Years',
          features: ['Dual flush', 'Soft-close seat', 'Easy clean glaze', 'Water efficient']
        }
      },
      {
        name: 'Smart Toilet',
        variant: 'Premium',
        variantDescription: 'Premium smart toilet with bidet',
        description: 'Advanced smart toilet with integrated bidet and heated seat',
        category: toiletCat._id,
        company: getCompany('Kohler')._id,
        companyName: 'Kohler',
        itemType: onePieceType._id,
        itemTypeName: 'One Piece Toilet',
        price: 45000,
        originalPrice: 55000,
        discount: 18,
        stock: 12,
        sku: 'KOH-TOI-SMA-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Premium vitreous china',
          size: 'Elongated',
          color: 'White',
          weight: '55kg',
          dimensions: '30" L x 18" W x 32" H',
          warranty: '5 Years',
          features: ['Integrated bidet', 'Heated seat', 'Auto open/close lid', 'Night light', 'Remote control']
        }
      }
    );

    // Mirror products
    const mirrorCat = getCategory('Mirror');
    const ledMirrorType = getItemType('LED Mirror');
    
    products.push(
      {
        name: 'LED Bathroom Mirror',
        variant: 'Basic',
        variantDescription: 'Basic LED mirror',
        description: 'Simple LED backlit bathroom mirror',
        category: mirrorCat._id,
        company: getCompany('Cera')._id,
        companyName: 'Cera',
        itemType: ledMirrorType._id,
        itemTypeName: 'LED Mirror',
        price: 3500,
        originalPrice: 4500,
        discount: 22,
        stock: 50,
        sku: 'CER-MIR-LED-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Glass with LED strip',
          size: '24" x 32"',
          color: 'Clear',
          weight: '8kg',
          dimensions: '24" W x 32" H x 1" D',
          warranty: '2 Years',
          features: ['LED backlight', 'Energy efficient', 'Easy installation', 'Modern design']
        }
      },
      {
        name: 'Smart LED Mirror',
        variant: 'Premium',
        variantDescription: 'Premium smart LED mirror',
        description: 'Smart LED mirror with touch controls and defogger',
        category: mirrorCat._id,
        company: getCompany('Kohler')._id,
        companyName: 'Kohler',
        itemType: ledMirrorType._id,
        itemTypeName: 'LED Mirror',
        price: 12000,
        originalPrice: 15000,
        discount: 20,
        stock: 25,
        sku: 'KOH-MIR-SMA-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Premium glass with LED',
          size: '36" x 48"',
          color: 'Clear',
          weight: '15kg',
          dimensions: '36" W x 48" H x 2" D',
          warranty: '3 Years',
          features: ['Touch controls', 'Defogger', 'Dimmable LED', 'Color temperature adjustment', 'Bluetooth speaker']
        }
      }
    );

    // Shower products
    const showerCat = getCategory('Shower');
    products.push(
      {
        name: 'Rain Shower Head',
        variant: 'Basic Chrome',
        variantDescription: 'Basic chrome rain shower',
        description: 'Standard rain shower head with chrome finish',
        category: showerCat._id,
        company: getCompany('Jaquar')._id,
        companyName: 'Jaquar',
        price: 2500,
        originalPrice: 3200,
        discount: 22,
        stock: 60,
        sku: 'JAQ-SHO-BAS-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Brass with chrome plating',
          size: '8 inch',
          color: 'Chrome',
          weight: '1.5kg',
          dimensions: '8" diameter',
          warranty: '2 Years',
          features: ['Rain shower effect', 'Easy clean nozzles', 'Universal fitting', 'Water efficient']
        }
      },
      {
        name: 'Shower Panel System',
        variant: 'Premium',
        variantDescription: 'Premium shower panel',
        description: 'Complete shower panel with multiple jets and rain shower',
        category: showerCat._id,
        company: getCompany('Kohler')._id,
        companyName: 'Kohler',
        price: 18000,
        originalPrice: 22000,
        discount: 18,
        stock: 20,
        sku: 'KOH-SHO-PAN-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Stainless steel',
          size: 'Full panel',
          color: 'Brushed Nickel',
          weight: '12kg',
          dimensions: '8" W x 60" H',
          warranty: '3 Years',
          features: ['Rain shower', 'Body jets', 'Hand shower', 'Thermostatic control', 'LED display']
        }
      }
    );

    // Wash Basin products
    const basinCat = getCategory('Wash Basin');
    products.push(
      {
        name: 'Counter Top Basin',
        variant: 'Round White',
        variantDescription: 'Round white counter basin',
        description: 'Modern round counter top wash basin',
        category: basinCat._id,
        company: getCompany('Hindware')._id,
        companyName: 'Hindware',
        price: 3500,
        originalPrice: 4500,
        discount: 22,
        stock: 45,
        sku: 'HIN-BAS-ROU-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Ceramic',
          size: '16 inch',
          color: 'White',
          weight: '8kg',
          dimensions: '16" diameter x 6" H',
          warranty: '2 Years',
          features: ['Counter top design', 'Easy clean glaze', 'Overflow protection', 'Modern style']
        }
      },
      {
        name: 'Pedestal Basin',
        variant: 'Premium',
        variantDescription: 'Premium pedestal basin',
        description: 'Elegant pedestal wash basin with full pedestal',
        category: basinCat._id,
        company: getCompany('Cera')._id,
        companyName: 'Cera',
        price: 6500,
        originalPrice: 8000,
        discount: 19,
        stock: 30,
        sku: 'CER-BAS-PED-001',
        isActive: true,
        images: ['/uploads/1776849067517-337759119.png'],
        specifications: {
          material: 'Vitreous china',
          size: '22 inch',
          color: 'White',
          weight: '25kg',
          dimensions: '22" W x 18" D x 34" H',
          warranty: '3 Years',
          features: ['Full pedestal', 'Pre-drilled tap hole', 'Overflow protection', 'Classic design']
        }
      }
    );

    const createdProducts = await Product.insertMany(products);
    console.log(`✓ Created ${createdProducts.length} products\n`);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Companies: ${createdCompanies.length}`);
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Item Types: ${createdItemTypes.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Price Range: ₹2,500 - ₹45,000`);
    console.log('\n📦 Products created:');
    createdProducts.forEach(p => {
      console.log(`   - ${p.name} (${p.variant}) - ₹${p.price.toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedData();
