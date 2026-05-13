const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

// Define specifications for different product types
const specificationsByItemType = {
  'One Piece Toilet': {
    material: 'Ceramic',
    size: 'Standard',
    color: 'White',
    warranty: '5 Years'
  },
  'Two Piece Toilet': {
    material: 'Ceramic',
    size: 'Standard',
    color: 'White',
    warranty: '5 Years'
  },
  'Wall Hung Toilet': {
    material: 'Ceramic',
    size: 'Compact',
    color: 'White',
    warranty: '5 Years'
  },
  'Smart Toilet': {
    material: 'Ceramic',
    size: 'Standard',
    color: 'White',
    warranty: '3 Years'
  },
  'Shower Head': {
    material: 'Stainless Steel',
    size: 'Standard',
    color: 'Chrome',
    warranty: '2 Years'
  },
  'Shower Panel': {
    material: 'Stainless Steel',
    size: 'Large',
    color: 'Chrome',
    warranty: '3 Years'
  },
  'Rain Shower': {
    material: 'Stainless Steel',
    size: 'Large',
    color: 'Chrome',
    warranty: '2 Years'
  },
  'Table Top Basin': {
    material: 'Ceramic',
    size: 'Standard',
    color: 'White',
    warranty: '5 Years'
  },
  'Wall Hung Basin': {
    material: 'Ceramic',
    size: 'Standard',
    color: 'White',
    warranty: '5 Years'
  },
  'Pedestal Basin': {
    material: 'Ceramic',
    size: 'Standard',
    color: 'White',
    warranty: '5 Years'
  },
  'Basin Faucet': {
    material: 'Brass',
    size: 'Standard',
    color: 'Chrome',
    warranty: '2 Years'
  },
  'Sensor Faucet': {
    material: 'Brass',
    size: 'Standard',
    color: 'Chrome',
    warranty: '2 Years'
  },
  'Freestanding Bathtub': {
    material: 'Acrylic',
    size: 'Large',
    color: 'White',
    warranty: '5 Years'
  },
  'Jacuzzi': {
    material: 'Acrylic',
    size: 'Large',
    color: 'White',
    warranty: '3 Years'
  },
  'LED Mirror': {
    material: 'Glass',
    size: 'Standard',
    color: 'Silver',
    warranty: '2 Years'
  },
  'Smart Mirror': {
    material: 'Glass',
    size: 'Standard',
    color: 'Silver',
    warranty: '2 Years'
  },
  'Floor Tiles': {
    material: 'Ceramic',
    size: '60x60cm',
    color: 'Beige',
    warranty: '10 Years'
  },
  'Wall Tiles': {
    material: 'Ceramic',
    size: '30x60cm',
    color: 'White',
    warranty: '10 Years'
  },
  'Wall Cabinet': {
    material: 'Wood',
    size: 'Standard',
    color: 'Brown',
    warranty: '3 Years'
  },
  'Vanity Cabinet': {
    material: 'Wood',
    size: 'Standard',
    color: 'Brown',
    warranty: '3 Years'
  }
};

// Color variations based on product name
const colorVariations = {
  'White': 'White',
  'Black': 'Black',
  'Chrome': 'Chrome',
  'Stainless': 'Stainless Steel',
  'Beige': 'Beige',
  'Gray': 'Gray',
  'Brown': 'Brown',
  'Silver': 'Silver',
  'Gold': 'Gold',
  'Brass': 'Brass'
};

// Material variations
const materialVariations = {
  'Ceramic': 'Ceramic',
  'Stainless': 'Stainless Steel',
  'Brass': 'Brass',
  'Acrylic': 'Acrylic',
  'Glass': 'Glass',
  'Wood': 'Wood',
  'Porcelain': 'Porcelain'
};

// Size variations
const sizeVariations = {
  'Small': 'Small',
  'Standard': 'Standard',
  'Large': 'Large',
  'Compact': 'Compact',
  'XL': 'XL'
};

// Warranty variations
const warrantyVariations = {
  '1 Year': '1 Year',
  '2 Years': '2 Years',
  '3 Years': '3 Years',
  '5 Years': '5 Years',
  '10 Years': '10 Years'
};

async function updateProductSpecifications() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        // Skip if already has specifications
        if (product.specifications && Object.keys(product.specifications).length > 0) {
          skipped++;
          continue;
        }

        let specs = {};

        // Get base specifications from item type
        if (product.itemTypeName) {
          const baseSpecs = specificationsByItemType[product.itemTypeName];
          if (baseSpecs) {
            specs = { ...baseSpecs };
          }
        }

        // Try to extract color from product name
        for (const [key, value] of Object.entries(colorVariations)) {
          if (product.name.toLowerCase().includes(key.toLowerCase())) {
            specs.color = value;
            break;
          }
        }

        // Try to extract material from product name
        for (const [key, value] of Object.entries(materialVariations)) {
          if (product.name.toLowerCase().includes(key.toLowerCase())) {
            specs.material = value;
            break;
          }
        }

        // Try to extract size from product name
        for (const [key, value] of Object.entries(sizeVariations)) {
          if (product.name.toLowerCase().includes(key.toLowerCase())) {
            specs.size = value;
            break;
          }
        }

        // Try to extract warranty from product name
        for (const [key, value] of Object.entries(warrantyVariations)) {
          if (product.name.toLowerCase().includes(key.toLowerCase())) {
            specs.warranty = value;
            break;
          }
        }

        // Assign default warranty based on price if not found
        if (!specs.warranty) {
          if (product.price > 50000) {
            specs.warranty = '3 Years';
          } else if (product.price > 20000) {
            specs.warranty = '2 Years';
          } else {
            specs.warranty = '1 Year';
          }
        }

        // Update product with specifications
        product.specifications = specs;
        await product.save();
        updated++;

        if (updated % 50 === 0) {
          console.log(`Updated ${updated} products...`);
        }
      } catch (error) {
        console.error(`Error updating product ${product._id}:`, error.message);
      }
    }

    console.log(`\nUpdate complete!`);
    console.log(`Updated: ${updated} products`);
    console.log(`Skipped: ${skipped} products (already had specifications)`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateProductSpecifications();
