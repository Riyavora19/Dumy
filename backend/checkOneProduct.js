const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gtss')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function checkOneProduct() {
  try {
    console.log('🔍 Checking one product structure...\n');
    
    // Get one product
    const product = await Product.findOne();
    
    if (product) {
      console.log('📦 PRODUCT DETAILS:');
      console.log('='.repeat(60));
      console.log(JSON.stringify(product, null, 2));
      console.log('='.repeat(60));
    } else {
      console.log('❌ No products found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the check
checkOneProduct();
