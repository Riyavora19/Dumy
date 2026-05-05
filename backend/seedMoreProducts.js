const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const ProductItemType = require('./models/ProductItemType');
const Category = require('./models/Category');
const Company = require('./models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

// Additional products to fill gaps
const additionalProducts = [
  // More WC Area Products
  {
    name: 'Wall Hung One Piece WC',
    itemTypeName: 'Toilet Seat',
    companyName: 'kohler',
    variant: 'Wall Mounted',
    price: 22500,
    originalPrice: 28000,
    description: 'Modern wall hung one piece toilet',
    specifications: {
      material: 'Ceramic',
      type: 'Wall Hung',
      warranty: '3 Years',
      features: ['Space Saving', 'Easy Clean', 'Modern Design']
    },
    rating: 4.7,
    reviewCount: 45,
    stock: 35,
    tags: ['wall-hung', 'one-piece', 'modern', 'wc', 'toilet']
  },
  {
    name: 'Two Piece WC Toilet',
    itemTypeName: 'Toilet Seat',
    companyName: 'kohler',
    variant: 'Floor Mounted',
    price: 15500,
    originalPrice: 19000,
    description: 'Traditional two piece toilet with dual flush',
    specifications: {
      material: 'Ceramic',
      type: 'Floor Mounted',
      warranty: '2 Years',
      features: ['Dual Flush', 'Easy Install', 'Durable']
    },
    rating: 4.4,
    reviewCount: 78,
    stock: 60,
    tags: ['two-piece', 'traditional', 'wc', 'toilet', 'flush']
  },
  {
    name: 'Smart Toilet WC with Bidet',
    itemTypeName: 'Toilet Seat',
    companyName: 'kohler',
    variant: 'Smart Technology',
    price: 45000,
    originalPrice: 55000,
    description: 'High-tech smart toilet with integrated bidet',
    specifications: {
      material: 'Premium Ceramic',
      type: 'Floor Mounted',
      warranty: '5 Years',
      features: ['Auto Flush', 'Heated Seat', 'Bidet Function', 'Remote Control']
    },
    rating: 4.9,
    reviewCount: 32,
    stock: 15,
    tags: ['smart', 'luxury', 'bidet', 'wc', 'toilet', 'premium']
  },
  {
    name: 'Concealed Cistern Flush Tank',
    itemTypeName: 'Flush Tank',
    companyName: 'kohler',
    variant: 'In-Wall',
    price: 8500,
    originalPrice: 11000,
    description: 'Space-saving concealed cistern for wall hung toilets',
    specifications: {
      material: 'Plastic',
      capacity: '6 Liters',
      warranty: '3 Years',
      features: ['Concealed', 'Dual Flush', 'Space Saving']
    },
    rating: 4.5,
    reviewCount: 56,
    stock: 40,
    tags: ['concealed', 'cistern', 'flush', 'wc', 'wall-hung']
  },
  {
    name: 'Chrome Flush Plate',
    itemTypeName: 'Flush Tank',
    companyName: 'kohler',
    variant: 'Dual Button',
    price: 2500,
    originalPrice: 3500,
    description: 'Premium chrome finish flush plate',
    specifications: {
      material: 'Chrome Plated ABS',
      warranty: '2 Years',
      features: ['Dual Button', 'Easy Clean', 'Modern Design']
    },
    rating: 4.3,
    reviewCount: 67,
    stock: 80,
    tags: ['flush-plate', 'chrome', 'modern', 'wc']
  },
  {
    name: 'Health Faucet Spray',
    itemTypeName: 'Tap/Faucet',
    companyName: 'kohler',
    variant: 'Jet Spray',
    price: 650,
    originalPrice: 950,
    description: 'Stainless steel health faucet for toilet',
    specifications: {
      material: 'Stainless Steel',
      warranty: '1 Year',
      features: ['High Pressure', 'Easy Grip', 'Durable']
    },
    rating: 4.1,
    reviewCount: 145,
    stock: 200,
    tags: ['health-faucet', 'spray', 'wc', 'toilet']
  },
  {
    name: 'Soft Close Toilet Seat Cover',
    itemTypeName: 'Toilet Seat',
    companyName: 'kohler',
    variant: 'Universal Fit',
    price: 1850,
    originalPrice: 2500,
    description: 'Universal soft close toilet seat cover',
    specifications: {
      material: 'Plastic',
      warranty: '1 Year',
      features: ['Soft Close', 'Easy Install', 'Universal Fit']
    },
    rating: 4.2,
    reviewCount: 98,
    stock: 120,
    tags: ['seat-cover', 'soft-close', 'wc', 'toilet']
  },

  // More Shower Area Products
  {
    name: 'Overhead Rain Shower Panel',
    itemTypeName: 'Shower Head',
    companyName: 'kohler',
    variant: 'Multi-Function',
    price: 12500,
    originalPrice: 16000,
    description: 'Complete shower panel with overhead rain shower',
    specifications: {
      material: 'Stainless Steel',
      size: '12 inches',
      warranty: '3 Years',
      features: ['Rain Shower', 'Body Jets', 'Hand Shower', 'Thermostatic']
    },
    rating: 4.8,
    reviewCount: 42,
    stock: 25,
    tags: ['shower-panel', 'rain', 'overhead', 'luxury', 'shower']
  },
  {
    name: 'Thermostatic Shower Mixer',
    itemTypeName: 'Tap/Faucet',
    companyName: 'kohler',
    variant: 'Temperature Control',
    price: 8500,
    originalPrice: 11000,
    description: 'Thermostatic shower mixer with temperature control',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '3 Years',
      features: ['Temperature Control', 'Anti-Scald', 'Dual Control']
    },
    rating: 4.6,
    reviewCount: 54,
    stock: 45,
    tags: ['shower-mixer', 'thermostatic', 'mixer', 'shower']
  },
  {
    name: '3-Way Shower Diverter',
    itemTypeName: 'Tap/Faucet',
    companyName: 'kohler',
    variant: 'Chrome Finish',
    price: 3500,
    originalPrice: 4800,
    description: '3-way diverter for multiple shower outlets',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '2 Years',
      features: ['3-Way Control', 'Smooth Operation', 'Durable']
    },
    rating: 4.4,
    reviewCount: 67,
    stock: 70,
    tags: ['diverter', '3-way', 'shower', 'mixer']
  },
  {
    name: 'Shower Body Jets Set',
    itemTypeName: 'Shower Head',
    companyName: 'kohler',
    variant: '4 Jets',
    price: 6500,
    originalPrice: 8500,
    description: 'Set of 4 body jets for spa-like shower experience',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '2 Years',
      features: ['4 Body Jets', 'Adjustable', 'Massage Effect']
    },
    rating: 4.5,
    reviewCount: 38,
    stock: 35,
    tags: ['body-jets', 'spa', 'shower', 'luxury']
  },
  {
    name: 'Adjustable Shower Arm',
    itemTypeName: 'Shower Head',
    companyName: 'kohler',
    variant: 'Extension Arm',
    price: 1200,
    originalPrice: 1800,
    description: 'Adjustable shower arm for overhead showers',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      length: '12 inches',
      warranty: '1 Year',
      features: ['Adjustable', 'Easy Install', 'Durable']
    },
    rating: 4.2,
    reviewCount: 89,
    stock: 100,
    tags: ['shower-arm', 'adjustable', 'shower', 'overhead']
  },
  {
    name: 'Sliding Rail Kit with Hand Shower',
    itemTypeName: 'Shower Head',
    companyName: 'kohler',
    variant: 'Complete Kit',
    price: 3500,
    originalPrice: 4800,
    description: 'Complete sliding rail kit with hand shower',
    specifications: {
      material: 'Stainless Steel',
      length: '24 inches',
      warranty: '2 Years',
      features: ['Adjustable Height', 'Hand Shower', 'Soap Holder']
    },
    rating: 4.4,
    reviewCount: 72,
    stock: 55,
    tags: ['sliding-rail', 'rail-kit', 'hand-shower', 'shower']
  },
  {
    name: 'Bath Spout with Diverter',
    itemTypeName: 'Tap/Faucet',
    companyName: 'kohler',
    variant: 'Wall Mount',
    price: 2800,
    originalPrice: 3800,
    description: 'Bath spout with integrated diverter',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '2 Years',
      features: ['Diverter', 'Wall Mount', 'Easy Clean']
    },
    rating: 4.3,
    reviewCount: 61,
    stock: 65,
    tags: ['bath-spout', 'spout', 'diverter', 'shower']
  },

  // More Basin Area Products
  {
    name: 'Table Top Countertop Basin',
    itemTypeName: 'Wash Basin',
    companyName: 'kohler',
    variant: 'Oval Design',
    price: 8500,
    originalPrice: 11000,
    description: 'Elegant oval table top basin',
    specifications: {
      material: 'Ceramic',
      size: '20x16 inches',
      warranty: '2 Years',
      features: ['Table Top', 'Oval Design', 'Premium Finish']
    },
    rating: 4.6,
    reviewCount: 48,
    stock: 40,
    tags: ['table-top', 'countertop', 'basin', 'washbasin']
  },
  {
    name: 'Under Counter Basin Sink',
    itemTypeName: 'Wash Basin',
    companyName: 'kohler',
    variant: 'Under Mount',
    price: 7500,
    originalPrice: 9800,
    description: 'Under counter basin for seamless look',
    specifications: {
      material: 'Ceramic',
      size: '18x14 inches',
      warranty: '2 Years',
      features: ['Under Counter', 'Seamless', 'Easy Clean']
    },
    rating: 4.5,
    reviewCount: 52,
    stock: 45,
    tags: ['under-counter', 'under-mount', 'basin', 'sink']
  },
  {
    name: 'Semi Recessed Basin',
    itemTypeName: 'Wash Basin',
    companyName: 'kohler',
    variant: 'Half Inset',
    price: 6800,
    originalPrice: 8800,
    description: 'Semi recessed basin for compact spaces',
    specifications: {
      material: 'Ceramic',
      size: '19x15 inches',
      warranty: '2 Years',
      features: ['Semi Recessed', 'Space Saving', 'Modern']
    },
    rating: 4.4,
    reviewCount: 44,
    stock: 50,
    tags: ['semi-recessed', 'half-inset', 'basin', 'washbasin']
  },
  {
    name: 'Full Pedestal Basin Classic',
    itemTypeName: 'Wash Basin',
    companyName: 'kohler',
    variant: 'Traditional',
    price: 10500,
    originalPrice: 13500,
    description: 'Classic full pedestal basin',
    specifications: {
      material: 'Ceramic',
      size: '24x20 inches',
      warranty: '3 Years',
      features: ['Full Pedestal', 'Classic Design', 'Sturdy']
    },
    rating: 4.6,
    reviewCount: 58,
    stock: 35,
    tags: ['full-pedestal', 'pedestal', 'classic', 'basin']
  },
  {
    name: 'Half Pedestal Basin Modern',
    itemTypeName: 'Wash Basin',
    companyName: 'kohler',
    variant: 'Contemporary',
    price: 8800,
    originalPrice: 11500,
    description: 'Modern half pedestal basin',
    specifications: {
      material: 'Ceramic',
      size: '22x18 inches',
      warranty: '2 Years',
      features: ['Half Pedestal', 'Modern Design', 'Space Saving']
    },
    rating: 4.5,
    reviewCount: 46,
    stock: 42,
    tags: ['half-pedestal', 'pedestal', 'modern', 'basin']
  },
  {
    name: 'Single Lever Basin Mixer',
    itemTypeName: 'Tap/Faucet',
    companyName: 'kohler',
    variant: 'Tall Spout',
    price: 4500,
    originalPrice: 6000,
    description: 'Tall spout basin mixer for counter top basins',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '2 Years',
      features: ['Single Lever', 'Tall Spout', '360° Swivel']
    },
    rating: 4.5,
    reviewCount: 76,
    stock: 85,
    tags: ['basin-mixer', 'mixer', 'tall-spout', 'basin', 'tap']
  },
  {
    name: 'Pillar Cock Basin Tap Set',
    itemTypeName: 'Tap/Faucet',
    companyName: 'kohler',
    variant: 'Pair',
    price: 3200,
    originalPrice: 4500,
    description: 'Traditional pillar cock tap set',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '2 Years',
      features: ['Hot & Cold', 'Traditional Design', 'Durable']
    },
    rating: 4.3,
    reviewCount: 92,
    stock: 95,
    tags: ['pillar-cock', 'traditional', 'basin', 'tap']
  },
  {
    name: 'Vanity Unit with Basin',
    itemTypeName: 'Bathroom Cabinet',
    companyName: 'kohler',
    variant: '24 inch',
    price: 18500,
    originalPrice: 24000,
    description: 'Complete vanity unit with integrated basin',
    specifications: {
      material: 'MDF',
      size: '24x18x32 inches',
      warranty: '3 Years',
      features: ['Integrated Basin', 'Soft Close', 'Storage']
    },
    rating: 4.7,
    reviewCount: 38,
    stock: 25,
    tags: ['vanity-unit', 'vanity', 'cabinet', 'basin', 'storage']
  },
  {
    name: 'LED Mirror Cabinet',
    itemTypeName: 'Mirror',
    companyName: 'kohler',
    variant: 'With Storage',
    price: 12500,
    originalPrice: 16000,
    description: 'LED mirror with built-in storage cabinet',
    specifications: {
      size: '32x24 inches',
      warranty: '3 Years',
      features: ['LED Lights', 'Storage Cabinet', 'Anti-Fog', 'Touch Sensor']
    },
    rating: 4.8,
    reviewCount: 42,
    stock: 30,
    tags: ['mirror-cabinet', 'led', 'storage', 'mirror', 'basin']
  },

  // More Urinal Products
  {
    name: 'Flat Back Urinal',
    itemTypeName: 'Urinal',
    companyName: 'kohler',
    variant: 'Wall Mounted',
    price: 5500,
    originalPrice: 7200,
    description: 'Space-saving flat back urinal',
    specifications: {
      material: 'Ceramic',
      type: 'Wall Mounted',
      warranty: '2 Years',
      features: ['Flat Back', 'Space Saving', 'Easy Clean']
    },
    rating: 4.3,
    reviewCount: 48,
    stock: 45,
    tags: ['flat-back', 'urinal', 'wall-mounted', 'space-saving']
  },
  {
    name: 'Corner Urinal Compact',
    itemTypeName: 'Urinal',
    companyName: 'kohler',
    variant: 'Corner Mount',
    price: 6200,
    originalPrice: 8000,
    description: 'Compact corner urinal for small spaces',
    specifications: {
      material: 'Ceramic',
      type: 'Corner Mount',
      warranty: '2 Years',
      features: ['Corner Design', 'Compact', 'Space Efficient']
    },
    rating: 4.4,
    reviewCount: 36,
    stock: 35,
    tags: ['corner', 'urinal', 'compact', 'space-saving']
  },
  {
    name: 'Manual Flush Urinal',
    itemTypeName: 'Urinal',
    companyName: 'kohler',
    variant: 'Push Button',
    price: 3800,
    originalPrice: 5000,
    description: 'Manual flush urinal with push button',
    specifications: {
      material: 'Ceramic',
      type: 'Wall Hung',
      warranty: '2 Years',
      features: ['Manual Flush', 'Push Button', 'Reliable']
    },
    rating: 4.1,
    reviewCount: 62,
    stock: 55,
    tags: ['manual', 'urinal', 'push-button', 'flush']
  },
  {
    name: 'Urinal Spreader Chrome',
    itemTypeName: 'Tap/Faucet',
    companyName: 'kohler',
    variant: 'Auto Flush',
    price: 2500,
    originalPrice: 3500,
    description: 'Chrome urinal spreader with auto flush',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '2 Years',
      features: ['Auto Flush', 'Chrome Finish', 'Easy Install']
    },
    rating: 4.2,
    reviewCount: 54,
    stock: 70,
    tags: ['urinal-spreader', 'spreader', 'auto-flush', 'urinal']
  },
  {
    name: 'Urinal Flush Valve Sensor',
    itemTypeName: 'Flush Tank',
    companyName: 'kohler',
    variant: 'Automatic',
    price: 4500,
    originalPrice: 6000,
    description: 'Automatic sensor flush valve for urinals',
    specifications: {
      material: 'Brass',
      warranty: '3 Years',
      features: ['Sensor', 'Automatic', 'Water Saving', 'Battery Operated']
    },
    rating: 4.6,
    reviewCount: 44,
    stock: 50,
    tags: ['flush-valve', 'sensor', 'automatic', 'urinal']
  },
  {
    name: 'Urinal Partition Panel',
    itemTypeName: 'Bathroom Cabinet',
    companyName: 'kohler',
    variant: 'Privacy Screen',
    price: 8500,
    originalPrice: 11000,
    description: 'Privacy partition panel for urinals',
    specifications: {
      material: 'Compact Laminate',
      size: '48x60 inches',
      warranty: '5 Years',
      features: ['Water Resistant', 'Easy Clean', 'Durable']
    },
    rating: 4.4,
    reviewCount: 28,
    stock: 20,
    tags: ['urinal-partition', 'partition', 'privacy', 'urinal']
  }
];

async function seedMoreProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Get categories
    const bathroomCategory = await Category.findOne({ name: 'Bathroom' });
    
    if (!bathroomCategory) {
      console.error('Bathroom category not found');
      return;
    }

    // Get company
    const company = await Company.findOne({ name: /kohler/i });
    if (!company) {
      console.error('Company not found');
      return;
    }

    console.log(`Found company: ${company.name}`);

    // Get all item types
    const itemTypes = await ProductItemType.find();
    const itemTypeMap = {};
    itemTypes.forEach(it => {
      itemTypeMap[it.name] = it;
    });

    console.log('\nCreating additional products...\n');

    let created = 0;
    let skipped = 0;

    for (const productData of additionalProducts) {
      // Check if product already exists
      const existing = await Product.findOne({
        name: productData.name,
        variant: productData.variant
      });

      if (existing) {
        console.log(`- Product already exists: ${productData.name} (${productData.variant})`);
        skipped++;
        continue;
      }

      // Get item type
      const itemType = itemTypeMap[productData.itemTypeName];
      if (!itemType) {
        console.log(`✗ Item type not found: ${productData.itemTypeName}`);
        continue;
      }

      // Create product
      const product = new Product({
        name: productData.name,
        description: productData.description,
        category: bathroomCategory._id,
        company: company._id,
        companyName: company.name,
        itemType: itemType._id,
        itemTypeName: itemType.name,
        variant: productData.variant,
        variantDescription: productData.description,
        price: productData.price,
        originalPrice: productData.originalPrice,
        discount: productData.originalPrice 
          ? Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)
          : 0,
        images: ['/uploads/placeholder-product.jpg'],
        sku: `${itemType.name.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        stock: productData.stock,
        specifications: productData.specifications,
        isActive: true,
        tags: productData.tags || [],
        rating: productData.rating || 0,
        reviewCount: productData.reviewCount || 0,
        popularity: Math.floor(Math.random() * 100)
      });

      await product.save();
      console.log(`✓ Created: ${productData.name} (${productData.variant}) - ₹${productData.price}`);
      created++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Additional products seeding completed!');
    console.log('='.repeat(60));
    console.log(`Products created: ${created}`);
    console.log(`Products skipped: ${skipped}`);
    console.log(`Total new products: ${created + skipped}`);

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedMoreProducts();
