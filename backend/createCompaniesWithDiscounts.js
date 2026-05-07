require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

// Define companies with their discount percentages
const companies = [
  { name: 'Kohler', discount: 5, description: 'Premium bathroom and kitchen fixtures', isPartner: true },
  { name: 'Hindware', discount: 4, description: 'Quality sanitaryware and faucets', isPartner: true },
  { name: 'Jaquar', discount: 3, description: 'Luxury bathroom solutions', isPartner: true },
  { name: 'Cera', discount: 2, description: 'Affordable sanitaryware and tiles', isPartner: true },
  { name: 'Parryware', discount: 1, description: 'Trusted bathroom products', isPartner: true }
];

async function createCompaniesWithDiscounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected\n');

    console.log('🏢 Creating companies with discount percentages...\n');

    const createdCompanies = {};

    // Create or update each company
    for (const companyData of companies) {
      let company = await Company.findOne({ name: companyData.name });
      
      if (company) {
        // Update existing company
        company.defaultDiscountPercentage = companyData.discount;
        company.description = companyData.description;
        company.isPartner = companyData.isPartner;
        company.isActive = true;
        await company.save();
        console.log(`✅ Updated: ${companyData.name} - ${companyData.discount}% discount`);
      } else {
        // Create new company
        company = new Company({
          name: companyData.name,
          description: companyData.description,
          defaultDiscountPercentage: companyData.discount,
          isPartner: companyData.isPartner,
          isActive: true
        });
        await company.save();
        console.log(`✅ Created: ${companyData.name} - ${companyData.discount}% discount`);
      }
      
      createdCompanies[companyData.name] = {
        id: company._id,
        discount: companyData.discount
      };
    }

    console.log('\n🔗 Linking products to companies and applying discounts...\n');

    // Update products with company references and discounted prices
    for (const [companyName, companyInfo] of Object.entries(createdCompanies)) {
      // Find products by company ObjectId reference
      const products = await Product.find({ company: companyInfo.id });
      console.log(`📦 Processing ${products.length} products for ${companyName}...`);
      
      let updatedCount = 0;
      for (const product of products) {
        // Calculate discounted price from MRP
        if (product.mrp) {
          const discountedPrice = Math.round(product.mrp * (1 - companyInfo.discount / 100));
          product.price = discountedPrice;
          product.discountPercentage = companyInfo.discount;
          await product.save();
          updatedCount++;
        }
      }
      console.log(`   ✅ Updated ${updatedCount} products with ${companyInfo.discount}% discount\n`);
      
      // Update company product count
      const company = await Company.findById(companyInfo.id);
      company.productCount = updatedCount;
      await company.save();
    }

    console.log('✅ All companies created and products updated!\n');
    console.log('📊 Company Discount Summary:');
    console.log('   Kohler: 5% discount');
    console.log('   Hindware: 4% discount');
    console.log('   Jaquar: 3% discount');
    console.log('   Cera: 2% discount');
    console.log('   Parryware: 1% discount\n');

    // Display sample products with discounts
    console.log('📦 Sample Products with Discounts:\n');
    const sampleProducts = await Product.find()
      .populate('company')
      .limit(15)
      .sort({ companyName: 1, name: 1 });
    
    for (const product of sampleProducts) {
      const companyName = product.company?.name || product.companyName;
      const discount = product.discountPercentage || 0;
      console.log(`   ${product.name} (${companyName})`);
      console.log(`      MRP: ₹${product.mrp.toLocaleString()} → Your Price: ₹${product.price.toLocaleString()} (${discount}% OFF)\n`);
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createCompaniesWithDiscounts();
