require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gtss-db';

async function checkCeraProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const ceraFaucets = await Product.find({ 
      companyName: 'Cera',
      name: { $regex: 'Faucet' }
    }).sort({ name: 1 });
    
    console.log('Cera Faucets in Database:');
    ceraFaucets.forEach(p => {
      console.log(`${p.name} - Discount: ${p.discountPercentage}% - MRP: ₹${p.mrp} - Price: ₹${p.price}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkCeraProducts();
