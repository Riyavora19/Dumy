const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Company = require('./models/Company');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function assignJaguarToAllProducts() {
  try {
    console.log('🔄 Starting company assignment...\n');

    // Find or create Jaguar company
    let jaguarCompany = await Company.findOne({ name: /^Jaguar$/i });
    
    if (!jaguarCompany) {
      console.log('Creating Jaguar company...');
      jaguarCompany = new Company({
        name: 'Jaguar',
        email: 'info@jaguar.com',
        phone: '1234567890',
        address: 'Jaguar Address',
        isPartner: true,
        isActive: true,
        discountPercentage: 0
      });
      await jaguarCompany.save();
      console.log('✅ Created Jaguar company:', jaguarCompany._id);
    } else {
      console.log('✅ Found existing Jaguar company:', jaguarCompany._id);
    }
    console.log('');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to update\n`);

    let updatedCount = 0;

    // Assign Jaguar to all products
    for (const product of products) {
      product.company = jaguarCompany._id;
      product.companyName = 'Jaguar';
      await product.save();
      updatedCount++;
      
      if (updatedCount % 100 === 0) {
        console.log(`✓ Updated ${updatedCount} products...`);
      }
    }

    console.log(`\n✅ Successfully assigned Jaguar company to all ${updatedCount} products!`);
    console.log('');
    
    // Link Jaguar to all categories
    const Category = require('./models/Category');
    const categories = await Category.find({});
    
    console.log('🔗 Linking Jaguar to all categories...');
    for (const cat of categories) {
      await Company.findByIdAndUpdate(
        jaguarCompany._id,
        { $addToSet: { categories: cat._id } },
        { new: true }
      );
      console.log(`  ✓ Linked to ${cat.name}`);
    }

    console.log('\n✅ All done! All products now belong to Jaguar company.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

assignJaguarToAllProducts();
