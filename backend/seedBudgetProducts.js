const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const ProductItemType = require('./models/ProductItemType');
const Category = require('./models/Category');
const Company = require('./models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

// Sample products data
const productsData = [
  // BATHROOM PRODUCTS
  
  // Toilet Seats (WC Area)
  {
    name: 'Premium Ceramic WC Toilet Seat',
    itemTypeName: 'Toilet Seat',
    companyName: 'kohler',
    variant: 'White Ceramic',
    price: 12500,
    originalPrice: 15000,
    description: 'Premium quality ceramic toilet seat with soft-close mechanism',
    specifications: {
      material: 'Ceramic',
      color: 'White',
      warranty: '2 Years',
      features: ['Soft Close', 'Easy Clean', 'Durable']
    },
    rating: 4.5,
    reviewCount: 120,
    stock: 50,
    tags: ['premium', 'ceramic', 'soft-close', 'wc', 'toilet']
  },
  {
    name: 'Standard WC Toilet Seat',
    itemTypeName: 'Toilet Seat',
    companyName: 'kohler',
    variant: 'Basic White',
    price: 6500,
    originalPrice: 8000,
    description: 'Standard quality toilet seat, durable and affordable',
    specifications: {
      material: 'Ceramic',
      color: 'White',
      warranty: '1 Year',
      features: ['Standard Design', 'Easy Install']
    },
    rating: 4.0,
    reviewCount: 85,
    stock: 100,
    tags: ['budget-friendly', 'standard', 'wc', 'toilet']
  },
  {
    name: 'Luxury Designer WC Toilet Seat',
    itemTypeName: 'Toilet Seat',
    companyName: 'kohler',
    variant: 'Designer Series',
    price: 18500,
    originalPrice: 22000,
    description: 'Luxury designer toilet seat with advanced features',
    specifications: {
      material: 'Premium Ceramic',
      color: 'White/Ivory',
      warranty: '3 Years',
      features: ['Soft Close', 'Quick Release', 'Anti-Bacterial']
    },
    rating: 4.8,
    reviewCount: 65,
    stock: 30,
    tags: ['luxury', 'designer', 'premium', 'wc', 'toilet']
  },

  // Flush Tanks (WC Area)
  {
    name: 'Dual Flush Tank for WC',
    itemTypeName: 'Flush Tank',
    companyName: 'kohler',
    variant: 'Water Saving',
    price: 5500,
    originalPrice: 7000,
    description: 'Dual flush mechanism for water conservation',
    specifications: {
      material: 'Plastic',
      capacity: '6/3 Liters',
      warranty: '2 Years',
      features: ['Dual Flush', 'Water Saving', 'Easy Maintenance']
    },
    rating: 4.3,
    reviewCount: 95,
    stock: 75,
    tags: ['eco-friendly', 'water-saving', 'flush', 'wc']
  },
  {
    name: 'Standard Flush Tank for Toilet',
    itemTypeName: 'Flush Tank',
    companyName: 'kohler',
    variant: 'Single Flush',
    price: 3200,
    originalPrice: 4000,
    description: 'Standard single flush tank, reliable performance',
    specifications: {
      material: 'Plastic',
      capacity: '6 Liters',
      warranty: '1 Year',
      features: ['Single Flush', 'Durable']
    },
    rating: 4.0,
    reviewCount: 110,
    stock: 120,
    tags: ['budget-friendly', 'standard', 'flush', 'toilet']
  },

  // Urinals (Urinal Area)
  {
    name: 'Wall Hung Sensor Urinal',
    itemTypeName: 'Urinal',
    companyName: 'kohler',
    variant: 'Automatic Sensor',
    price: 8500,
    originalPrice: 11000,
    description: 'Modern wall hung urinal with automatic sensor flush',
    specifications: {
      material: 'Ceramic',
      type: 'Wall Hung',
      warranty: '3 Years',
      features: ['Sensor Flush', 'Water Saving', 'Easy Clean', 'Wall Mounted']
    },
    rating: 4.6,
    reviewCount: 58,
    stock: 40,
    tags: ['urinal', 'sensor', 'wall-hung', 'automatic', 'premium']
  },
  {
    name: 'Floor Mounted Urinal',
    itemTypeName: 'Urinal',
    companyName: 'kohler',
    variant: 'Standard',
    price: 4500,
    originalPrice: 6000,
    description: 'Durable floor mounted urinal for commercial use',
    specifications: {
      material: 'Ceramic',
      type: 'Floor Mounted',
      warranty: '2 Years',
      features: ['Floor Mounted', 'Durable', 'Easy Install']
    },
    rating: 4.2,
    reviewCount: 85,
    stock: 60,
    tags: ['urinal', 'floor-mounted', 'commercial', 'durable']
  },
  {
    name: 'Waterless Urinal Eco',
    itemTypeName: 'Urinal',
    companyName: 'kohler',
    variant: 'Eco Friendly',
    price: 12500,
    originalPrice: 15500,
    description: 'Eco-friendly waterless urinal system',
    specifications: {
      material: 'Ceramic',
      type: 'Wall Hung',
      warranty: '5 Years',
      features: ['Waterless', 'Eco Friendly', 'No Flush Required', 'Odor Free']
    },
    rating: 4.7,
    reviewCount: 42,
    stock: 30,
    tags: ['urinal', 'waterless', 'eco-friendly', 'premium', 'wall-hung']
  },

  // Taps/Faucets (Basin Area)
  {
    name: 'Chrome Basin Tap Faucet',
    itemTypeName: 'Tap/Faucet',
    companyName: 'kohler',
    variant: 'Chrome Plated',
    price: 2500,
    originalPrice: 3200,
    description: 'Premium chrome finish tap with smooth operation',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '2 Years',
      features: ['Corrosion Resistant', 'Smooth Flow', 'Easy Clean']
    },
    rating: 4.4,
    reviewCount: 150,
    stock: 200,
    tags: ['chrome', 'premium', 'basin', 'tap', 'faucet']
  },
  {
    name: 'Budget Basin Tap',
    itemTypeName: 'Tap/Faucet',
    companyName: 'kohler',
    variant: 'Basic',
    price: 850,
    originalPrice: 1200,
    description: 'Affordable tap for basic needs',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '1 Year',
      features: ['Basic Design', 'Functional']
    },
    rating: 3.8,
    reviewCount: 200,
    stock: 300,
    tags: ['budget-friendly', 'basic', 'basin', 'tap']
  },
  {
    name: 'Designer Sensor Basin Tap',
    itemTypeName: 'Tap/Faucet',
    companyName: 'kohler',
    variant: 'Automatic Sensor',
    price: 8500,
    originalPrice: 11000,
    description: 'Modern sensor tap with touchless operation',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '3 Years',
      features: ['Touchless', 'Water Saving', 'Battery Operated']
    },
    rating: 4.7,
    reviewCount: 45,
    stock: 50,
    tags: ['luxury', 'sensor', 'modern', 'basin', 'tap']
  },

  // Wash Basins (Basin Area)
  {
    name: 'Wall Mounted Washbasin',
    itemTypeName: 'Wash Basin',
    companyName: 'kohler',
    variant: 'Wall Mount',
    price: 6500,
    originalPrice: 8500,
    description: 'Space-saving wall mounted wash basin',
    specifications: {
      material: 'Ceramic',
      size: '18x16 inches',
      warranty: '2 Years',
      features: ['Wall Mounted', 'Space Saving', 'Easy Clean']
    },
    rating: 4.3,
    reviewCount: 88,
    stock: 60,
    tags: ['wall-mount', 'space-saving', 'basin', 'washbasin']
  },
  {
    name: 'Pedestal Washbasin',
    itemTypeName: 'Wash Basin',
    companyName: 'kohler',
    variant: 'With Pedestal',
    price: 9500,
    originalPrice: 12000,
    description: 'Classic pedestal basin with elegant design',
    specifications: {
      material: 'Ceramic',
      size: '22x18 inches',
      warranty: '2 Years',
      features: ['Pedestal Design', 'Elegant', 'Sturdy']
    },
    rating: 4.5,
    reviewCount: 72,
    stock: 45,
    tags: ['pedestal', 'classic', 'elegant', 'basin', 'washbasin']
  },
  {
    name: 'Counter Top Basin Sink',
    itemTypeName: 'Wash Basin',
    companyName: 'kohler',
    variant: 'Counter Mount',
    price: 12500,
    originalPrice: 15500,
    description: 'Modern counter top basin for contemporary bathrooms',
    specifications: {
      material: 'Ceramic',
      size: '20x16 inches',
      warranty: '3 Years',
      features: ['Counter Top', 'Modern Design', 'Premium Finish']
    },
    rating: 4.7,
    reviewCount: 55,
    stock: 35,
    tags: ['counter-top', 'modern', 'premium', 'basin', 'sink']
  },

  // Mirrors (Basin Area)
  {
    name: 'Basic Basin Mirror',
    itemTypeName: 'Mirror',
    companyName: 'kohler',
    variant: 'Plain',
    price: 1500,
    originalPrice: 2000,
    description: 'Simple bathroom mirror with frame',
    specifications: {
      size: '24x18 inches',
      warranty: '1 Year',
      features: ['Framed', 'Wall Mount']
    },
    rating: 4.0,
    reviewCount: 130,
    stock: 150,
    tags: ['budget-friendly', 'basic', 'mirror', 'basin']
  },
  {
    name: 'LED Basin Mirror',
    itemTypeName: 'Mirror',
    companyName: 'kohler',
    variant: 'With LED Lights',
    price: 5500,
    originalPrice: 7500,
    description: 'Modern LED mirror with built-in lighting',
    specifications: {
      size: '30x24 inches',
      warranty: '2 Years',
      features: ['LED Lights', 'Touch Sensor', 'Anti-Fog']
    },
    rating: 4.6,
    reviewCount: 68,
    stock: 40,
    tags: ['led', 'modern', 'premium', 'mirror', 'basin']
  },

  // Shower Heads (Shower Area)
  {
    name: 'Rain Shower Head Overhead',
    itemTypeName: 'Shower Head',
    companyName: 'kohler',
    variant: 'Overhead Rain',
    price: 4500,
    originalPrice: 6000,
    description: 'Luxurious rain shower experience',
    specifications: {
      material: 'Stainless Steel',
      size: '8 inches',
      warranty: '2 Years',
      features: ['Rain Effect', 'Anti-Clog', 'Easy Install']
    },
    rating: 4.5,
    reviewCount: 92,
    stock: 70,
    tags: ['rain', 'luxury', 'shower', 'overhead']
  },
  {
    name: 'Hand Shower Spray',
    itemTypeName: 'Shower Head',
    companyName: 'kohler',
    variant: 'Handheld',
    price: 1800,
    originalPrice: 2500,
    description: 'Flexible handheld shower with multiple spray modes',
    specifications: {
      material: 'ABS Plastic',
      warranty: '1 Year',
      features: ['Handheld', 'Multiple Modes', 'Flexible Hose']
    },
    rating: 4.2,
    reviewCount: 145,
    stock: 120,
    tags: ['handheld', 'flexible', 'shower', 'spray']
  },

  // Bathroom Tiles (All Areas - can be used in shower, basin, or WC areas)
  {
    name: 'Ceramic Floor Tiles for Shower Basin WC',
    itemTypeName: 'Bathroom Tiles',
    companyName: 'kohler',
    variant: 'Glossy Finish',
    price: 15000,
    originalPrice: 18000,
    description: 'Premium ceramic tiles for bathroom flooring (per 100 sq ft)',
    specifications: {
      material: 'Ceramic',
      size: '12x12 inches',
      finish: 'Glossy',
      warranty: '5 Years',
      features: ['Water Resistant', 'Easy Clean', 'Durable']
    },
    rating: 4.4,
    reviewCount: 78,
    stock: 200,
    tags: ['ceramic', 'glossy', 'premium', 'shower', 'basin', 'wc', 'toilet']
  },
  {
    name: 'Budget Bathroom Tiles Shower Basin WC',
    itemTypeName: 'Bathroom Tiles',
    companyName: 'kohler',
    variant: 'Standard',
    price: 8500,
    originalPrice: 11000,
    description: 'Affordable bathroom tiles (per 100 sq ft)',
    specifications: {
      material: 'Ceramic',
      size: '12x12 inches',
      finish: 'Matte',
      warranty: '2 Years',
      features: ['Water Resistant', 'Standard Quality']
    },
    rating: 3.9,
    reviewCount: 156,
    stock: 300,
    tags: ['budget-friendly', 'standard', 'shower', 'basin', 'wc', 'toilet']
  },

  // Towel Racks (Basin Area)
  {
    name: 'Stainless Steel Towel Rack for Basin',
    itemTypeName: 'Towel Rack',
    companyName: 'kohler',
    variant: 'Single Rod',
    price: 850,
    originalPrice: 1200,
    description: 'Durable stainless steel towel rack for basin area',
    specifications: {
      material: 'Stainless Steel',
      size: '24 inches',
      warranty: '1 Year',
      features: ['Rust Resistant', 'Wall Mount', 'Easy Install']
    },
    rating: 4.2,
    reviewCount: 165,
    stock: 200,
    tags: ['stainless-steel', 'durable', 'basin', 'washbasin']
  },

  // Soap Dispensers (Basin Area)
  {
    name: 'Automatic Basin Soap Dispenser',
    itemTypeName: 'Soap Dispenser',
    companyName: 'kohler',
    variant: 'Sensor Based',
    price: 1200,
    originalPrice: 1800,
    description: 'Touchless automatic soap dispenser for basin area',
    specifications: {
      material: 'Plastic',
      capacity: '300ml',
      warranty: '1 Year',
      features: ['Touchless', 'Battery Operated', 'Adjustable Dose']
    },
    rating: 4.3,
    reviewCount: 98,
    stock: 150,
    tags: ['automatic', 'touchless', 'basin', 'washbasin', 'sink']
  },

  // Bathroom Cabinets (Basin Area)
  {
    name: 'Basin Wall Cabinet with Mirror',
    itemTypeName: 'Bathroom Cabinet',
    companyName: 'kohler',
    variant: 'Mirror Door',
    price: 8500,
    originalPrice: 11000,
    description: 'Space-saving wall cabinet with mirror door for basin area',
    specifications: {
      material: 'MDF',
      size: '24x18x6 inches',
      warranty: '2 Years',
      features: ['Mirror Door', 'Multiple Shelves', 'Wall Mount']
    },
    rating: 4.4,
    reviewCount: 67,
    stock: 45,
    tags: ['wall-mount', 'mirror', 'storage', 'basin', 'washbasin', 'vanity']
  },

  // KITCHEN PRODUCTS
  // Note: Kitchen products are mapped to the 3 standard areas based on their function
  // Basin Area = Sink-related items (sinks, taps, countertops)
  // Shower Area = Cooking-related items (stoves, chimneys)
  // WC Area = Storage items (cabinets)

  // Kitchen Sinks (Basin Area - sink related)
  {
    name: 'Stainless Steel Kitchen Sink Basin',
    itemTypeName: 'Kitchen Sink',
    companyName: 'kohler',
    variant: 'Single Bowl',
    price: 6500,
    originalPrice: 8500,
    description: 'Durable stainless steel kitchen sink',
    specifications: {
      material: 'Stainless Steel 304',
      size: '24x18 inches',
      warranty: '5 Years',
      features: ['Rust Resistant', 'Easy Clean', 'Sound Dampening']
    },
    rating: 4.5,
    reviewCount: 125,
    stock: 80,
    tags: ['stainless-steel', 'durable', 'basin', 'sink', 'washbasin']
  },
  {
    name: 'Double Bowl Kitchen Sink Basin',
    itemTypeName: 'Kitchen Sink',
    companyName: 'kohler',
    variant: 'Double Bowl',
    price: 12500,
    originalPrice: 15500,
    description: 'Premium double bowl kitchen sink',
    specifications: {
      material: 'Stainless Steel 304',
      size: '32x18 inches',
      warranty: '5 Years',
      features: ['Double Bowl', 'Rust Resistant', 'Premium Finish']
    },
    rating: 4.7,
    reviewCount: 89,
    stock: 50,
    tags: ['double-bowl', 'premium', 'basin', 'sink', 'washbasin']
  },

  // Kitchen Taps (Basin Area - tap/faucet related)
  {
    name: 'Kitchen Mixer Tap Faucet',
    itemTypeName: 'Kitchen Tap',
    companyName: 'kohler',
    variant: 'Single Lever',
    price: 3500,
    originalPrice: 4800,
    description: 'Modern single lever kitchen mixer tap',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '2 Years',
      features: ['Single Lever', '360° Swivel', 'Easy Clean']
    },
    rating: 4.4,
    reviewCount: 112,
    stock: 100,
    tags: ['mixer', 'modern', 'tap', 'faucet', 'basin']
  },
  {
    name: 'Pull-Out Kitchen Tap Faucet',
    itemTypeName: 'Kitchen Tap',
    companyName: 'kohler',
    variant: 'Pull-Out Spray',
    price: 7500,
    originalPrice: 9800,
    description: 'Premium pull-out spray kitchen tap',
    specifications: {
      material: 'Brass',
      finish: 'Chrome',
      warranty: '3 Years',
      features: ['Pull-Out Spray', 'Dual Mode', 'Flexible Hose']
    },
    rating: 4.6,
    reviewCount: 76,
    stock: 60,
    tags: ['pull-out', 'premium', 'spray', 'tap', 'faucet', 'basin']
  },

  // Kitchen Tiles (All Areas)
  {
    name: 'Kitchen Backsplash Tiles Shower Basin WC',
    itemTypeName: 'Kitchen Tiles',
    companyName: 'kohler',
    variant: 'Glossy Ceramic',
    price: 12000,
    originalPrice: 15000,
    description: 'Premium ceramic tiles for kitchen backsplash (per 100 sq ft)',
    specifications: {
      material: 'Ceramic',
      size: '12x12 inches',
      finish: 'Glossy',
      warranty: '5 Years',
      features: ['Heat Resistant', 'Easy Clean', 'Stain Resistant']
    },
    rating: 4.5,
    reviewCount: 94,
    stock: 150,
    tags: ['backsplash', 'ceramic', 'glossy', 'shower', 'basin', 'wc']
  },

  // Chimneys (Shower Area - cooking/overhead items)
  {
    name: 'Auto Clean Chimney Overhead',
    itemTypeName: 'Chimney',
    companyName: 'kohler',
    variant: '60cm Auto Clean',
    price: 15500,
    originalPrice: 19500,
    description: 'Auto clean kitchen chimney with powerful suction',
    specifications: {
      size: '60cm',
      suction: '1200 m3/hr',
      warranty: '2 Years',
      features: ['Auto Clean', 'Touch Control', 'LED Lights', 'Baffle Filter']
    },
    rating: 4.5,
    reviewCount: 145,
    stock: 45,
    tags: ['auto-clean', 'powerful', 'shower', 'overhead', 'rain']
  },
  {
    name: 'Basic Kitchen Chimney Overhead',
    itemTypeName: 'Chimney',
    companyName: 'kohler',
    variant: '60cm Standard',
    price: 8500,
    originalPrice: 11500,
    description: 'Standard kitchen chimney for basic needs',
    specifications: {
      size: '60cm',
      suction: '800 m3/hr',
      warranty: '1 Year',
      features: ['Push Button', 'LED Lights', 'Cassette Filter']
    },
    rating: 4.0,
    reviewCount: 198,
    stock: 80,
    tags: ['budget-friendly', 'standard', 'shower', 'overhead']
  },

  // Gas Stoves (Shower Area - cooking items)
  {
    name: '3 Burner Gas Stove Shower',
    itemTypeName: 'Gas Stove',
    companyName: 'kohler',
    variant: 'Glass Top',
    price: 6500,
    originalPrice: 8500,
    description: '3 burner gas stove with toughened glass top',
    specifications: {
      burners: '3',
      material: 'Toughened Glass',
      warranty: '2 Years',
      features: ['Auto Ignition', 'Brass Burners', 'Spill Proof']
    },
    rating: 4.3,
    reviewCount: 167,
    stock: 70,
    tags: ['3-burner', 'glass-top', 'shower', 'spray']
  },
  {
    name: '4 Burner Gas Stove Shower',
    itemTypeName: 'Gas Stove',
    companyName: 'kohler',
    variant: 'Stainless Steel',
    price: 9500,
    originalPrice: 12500,
    description: '4 burner gas stove with stainless steel body',
    specifications: {
      burners: '4',
      material: 'Stainless Steel',
      warranty: '2 Years',
      features: ['Auto Ignition', 'Brass Burners', 'Heavy Duty']
    },
    rating: 4.5,
    reviewCount: 134,
    stock: 55,
    tags: ['4-burner', 'stainless-steel', 'premium', 'shower', 'spray']
  },

  // Kitchen Cabinets (WC Area - storage/cabinet items)
  {
    name: 'Modular Kitchen Cabinet WC Storage',
    itemTypeName: 'Kitchen Cabinet',
    companyName: 'kohler',
    variant: 'Complete Set',
    price: 85000,
    originalPrice: 110000,
    description: 'Complete modular kitchen cabinet set (8 feet)',
    specifications: {
      material: 'Marine Plywood',
      finish: 'Laminate',
      warranty: '5 Years',
      features: ['Soft Close', 'Modular Design', 'Water Resistant', 'Customizable']
    },
    rating: 4.6,
    reviewCount: 45,
    stock: 15,
    tags: ['modular', 'complete-set', 'premium', 'wc', 'cabinet']
  },

  // Countertops (Basin Area - counter/vanity items)
  {
    name: 'Granite Countertop Basin Counter',
    itemTypeName: 'Countertop',
    companyName: 'kohler',
    variant: 'Black Galaxy',
    price: 18500,
    originalPrice: 24000,
    description: 'Premium granite countertop (per running foot)',
    specifications: {
      material: 'Granite',
      thickness: '20mm',
      warranty: '10 Years',
      features: ['Heat Resistant', 'Scratch Resistant', 'Polished Finish']
    },
    rating: 4.7,
    reviewCount: 67,
    stock: 30,
    tags: ['granite', 'premium', 'durable', 'basin', 'counter', 'vanity']
  },
  {
    name: 'Quartz Countertop Basin Counter',
    itemTypeName: 'Countertop',
    companyName: 'kohler',
    variant: 'White Quartz',
    price: 25000,
    originalPrice: 32000,
    description: 'Luxury quartz countertop (per running foot)',
    specifications: {
      material: 'Engineered Quartz',
      thickness: '20mm',
      warranty: '15 Years',
      features: ['Non-Porous', 'Stain Resistant', 'Low Maintenance']
    },
    rating: 4.8,
    reviewCount: 52,
    stock: 20,
    tags: ['quartz', 'luxury', 'premium', 'basin', 'counter', 'vanity']
  }
];

async function seedBudgetProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Get categories
    const bathroomCategory = await Category.findOne({ name: 'Bathroom' });
    const kitchenCategory = await Category.findOne({ name: 'Kitchen' });

    if (!bathroomCategory || !kitchenCategory) {
      console.error('Categories not found. Please run seedAllCategories.js first');
      return;
    }

    // Get company
    const company = await Company.findOne({ name: /kohler/i });
    if (!company) {
      console.error('Company not found. Please ensure Kohler company exists');
      return;
    }

    console.log(`Found company: ${company.name}`);

    // Get all item types
    const itemTypes = await ProductItemType.find();
    const itemTypeMap = {};
    itemTypes.forEach(it => {
      itemTypeMap[it.name] = it;
    });

    console.log('\nCreating products...\n');

    let created = 0;
    let skipped = 0;

    for (const productData of productsData) {
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

      // Determine category
      const category = itemType.category.toString() === bathroomCategory._id.toString() 
        ? bathroomCategory 
        : kitchenCategory;

      // Create product with image placeholder
      const product = new Product({
        name: productData.name,
        description: productData.description,
        category: category._id,
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
        images: ['/uploads/placeholder-product.jpg'], // Placeholder image
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
    console.log('✅ Product seeding completed!');
    console.log('='.repeat(60));
    console.log(`Products created: ${created}`);
    console.log(`Products skipped: ${skipped}`);
    console.log(`Total products: ${created + skipped}`);
    console.log('\nBreakdown by category:');
    
    const bathroomProducts = await Product.countDocuments({ category: bathroomCategory._id });
    const kitchenProducts = await Product.countDocuments({ category: kitchenCategory._id });
    
    console.log(`- Bathroom products: ${bathroomProducts}`);
    console.log(`- Kitchen products: ${kitchenProducts}`);
    
    console.log('\nYou can now:');
    console.log('1. Visit http://localhost:5174/budget-planner');
    console.log('2. Select a room template');
    console.log('3. Generate recommendations');
    console.log('4. See actual products! 🎉');

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedBudgetProducts();
