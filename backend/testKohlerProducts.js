const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Category = require('./models/Category');
const Company = require('./models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function testKohlerProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Find Accessories category
    const category = await Category.findOne({ name: /accessories/i });
    if (!category) {
      console.log('❌ Accessories category not found!');
      return;
    }

    console.log('✅ Category found:');
    console.log('   ID:', category._id);
    console.log('   Name:', category.name);
    console.log('\n');

    // Find all products in this category
    const allProducts = await Product.find({ category: category._id })
      .populate('category')
      .populate('company');

    console.log(`📦 Total products in ${category.name}:`, allProducts.length);
    console.log('\n');

    // Filter Kohler products
    const kohlerProducts = allProducts.filter(p => {
      const productCompany = typeof p.company === 'object' && p.company?.name 
        ? p.company.name 
        : p.companyName || p.company;
      return productCompany === 'Kohler';
    });

    console.log('🏢 Kohler products:', kohlerProducts.length);
    console.log('\n');

    if (kohlerProducts.length > 0) {
      console.log('Kohler Products:');
      kohlerProducts.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   ID: ${p._id}`);
        console.log(`   Company: ${typeof p.company === 'object' ? p.company?.name : p.companyName || p.company}`);
        console.log(`   Price: ₹${p.price}`);
        console.log(`   Stock: ${p.stock}`);
        console.log(`   Images: ${p.images?.length || 0}`);
        console.log(`   Active: ${p.isActive}`);
      });
    } else {
      console.log('❌ No Kohler products found!');
      console.log('\nLet me check what companies exist:');
      const uniqueCompanies = [...new Set(allProducts.map(p => {
        return typeof p.company === 'object' && p.company?.name 
          ? p.company.name 
          : p.companyName || p.company || 'Unknown';
      }))];
      console.log('Companies in this category:', uniqueCompanies);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testKohlerProducts();
