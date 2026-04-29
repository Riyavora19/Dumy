const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const ProductItemType = require('./models/ProductItemType');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function checkItemTypes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    const withItemType = await Product.countDocuments({ itemType: { $ne: null } });
    const withoutItemType = await Product.countDocuments({ itemType: null });
    const total = await Product.countDocuments();
    
    console.log('Products with itemType:', withItemType);
    console.log('Products without itemType:', withoutItemType);
    console.log('Total products:', total);
    
    if (withItemType > 0) {
      console.log('\nSample products with itemType:');
      const samples = await Product.find({ itemType: { $ne: null } }).populate('itemType').limit(5);
      samples.forEach(p => {
        console.log(`  - ${p.name}: ${p.itemType?.name || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkItemTypes();
