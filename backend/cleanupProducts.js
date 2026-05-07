const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Company = require('./models/Company');
const ProductItemType = require('./models/ProductItemType');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mernapp');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Find all products
    const allProducts = await Product.find({})
      .populate('category')
      .populate('company')
      .populate('itemType');
    
    console.log(`\n📊 Total products in database: ${allProducts.length}\n`);
    
    // Categorize problematic products
    const problematicProducts = [];
    const productsWithoutCategory = [];
    const productsWithoutCompany = [];
    const productsWithInvalidRefs = [];
    const productsWithNumberNames = [];
    
    for (const product of allProducts) {
      let hasIssue = false;
      const issues = [];
      
      // Check if name is just a number
      if (product.name && /^\d+$/.test(product.name.trim())) {
        productsWithNumberNames.push(product);
        issues.push('Name is just a number');
        hasIssue = true;
      }
      
      // Check if category is missing or invalid
      if (!product.category || !product.category._id) {
        productsWithoutCategory.push(product);
        issues.push('Missing/invalid category');
        hasIssue = true;
      }
      
      // Check if company is missing (it's optional but might be the issue)
      if (!product.company || !product.company._id) {
        productsWithoutCompany.push(product);
        issues.push('Missing/invalid company');
        hasIssue = true;
      }
      
      // Check if product has invalid references
      if (product.category && typeof product.category === 'string') {
        // Category ID exists but didn't populate (invalid reference)
        productsWithInvalidRefs.push(product);
        issues.push('Invalid category reference');
        hasIssue = true;
      }
      
      if (hasIssue) {
        problematicProducts.push({
          product,
          issues
        });
      }
    }
    
    console.log('🔍 PROBLEMATIC PRODUCTS FOUND:\n');
    console.log(`❌ Products with number-only names: ${productsWithNumberNames.length}`);
    console.log(`❌ Products without category: ${productsWithoutCategory.length}`);
    console.log(`❌ Products without company: ${productsWithoutCompany.length}`);
    console.log(`❌ Products with invalid references: ${productsWithInvalidRefs.length}`);
    console.log(`\n📋 Total problematic products: ${problematicProducts.length}\n`);
    
    // Display details of problematic products
    if (problematicProducts.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('DETAILED LIST OF PROBLEMATIC PRODUCTS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      problematicProducts.forEach((item, index) => {
        const p = item.product;
        console.log(`${index + 1}. Product ID: ${p._id}`);
        console.log(`   Name: "${p.name || 'NO NAME'}"`);
        console.log(`   Category: ${p.category?.name || 'MISSING'} (${p.category?._id || 'NO ID'})`);
        console.log(`   Company: ${p.company?.name || 'MISSING'} (${p.company?._id || 'NO ID'})`);
        console.log(`   Price: ₹${p.price || 0}`);
        console.log(`   SKU: ${p.sku || 'NO SKU'}`);
        console.log(`   Active: ${p.isActive ? 'Yes' : 'No'}`);
        console.log(`   Issues: ${item.issues.join(', ')}`);
        console.log(`   Created: ${p.createdAt || 'Unknown'}`);
        console.log('');
      });
    }
    
    // Search for specific products mentioned by user
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SEARCHING FOR SPECIFIC PRODUCTS (9, 10, Jaguar):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const searchTerms = ['9', '10', 'jaguar'];
    const foundProducts = [];
    
    for (const term of searchTerms) {
      const matches = allProducts.filter(p => 
        p.name?.toLowerCase().includes(term.toLowerCase()) ||
        p.company?.name?.toLowerCase().includes(term.toLowerCase()) ||
        p.brand?.toLowerCase().includes(term.toLowerCase())
      );
      
      if (matches.length > 0) {
        console.log(`\n🔎 Found ${matches.length} product(s) matching "${term}":\n`);
        matches.forEach(p => {
          console.log(`   ID: ${p._id}`);
          console.log(`   Name: "${p.name}"`);
          console.log(`   Category: ${p.category?.name || 'MISSING'}`);
          console.log(`   Company: ${p.company?.name || 'MISSING'}`);
          console.log(`   Price: ₹${p.price}`);
          console.log(`   Active: ${p.isActive ? 'Yes' : 'No'}`);
          console.log('');
          foundProducts.push(p);
        });
      }
    }
    
    // Provide deletion options
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('CLEANUP OPTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('To delete problematic products, run one of these commands:\n');
    console.log('1. Delete products with number-only names:');
    console.log('   node backend/cleanupProducts.js --delete-number-names\n');
    
    console.log('2. Delete products without category:');
    console.log('   node backend/cleanupProducts.js --delete-no-category\n');
    
    console.log('3. Delete products without company:');
    console.log('   node backend/cleanupProducts.js --delete-no-company\n');
    
    console.log('4. Delete ALL problematic products:');
    console.log('   node backend/cleanupProducts.js --delete-all-problematic\n');
    
    console.log('5. Delete specific product by ID:');
    console.log('   node backend/cleanupProducts.js --delete-id <PRODUCT_ID>\n');
    
    // Handle command line arguments for deletion
    const args = process.argv.slice(2);
    
    if (args.includes('--delete-number-names')) {
      console.log('\n🗑️  Deleting products with number-only names...');
      const ids = productsWithNumberNames.map(p => p._id);
      const result = await Product.deleteMany({ _id: { $in: ids } });
      console.log(`✅ Deleted ${result.deletedCount} products`);
    }
    
    if (args.includes('--delete-no-category')) {
      console.log('\n🗑️  Deleting products without category...');
      const ids = productsWithoutCategory.map(p => p._id);
      const result = await Product.deleteMany({ _id: { $in: ids } });
      console.log(`✅ Deleted ${result.deletedCount} products`);
    }
    
    if (args.includes('--delete-no-company')) {
      console.log('\n🗑️  Deleting products without company...');
      const ids = productsWithoutCompany.map(p => p._id);
      const result = await Product.deleteMany({ _id: { $in: ids } });
      console.log(`✅ Deleted ${result.deletedCount} products`);
    }
    
    if (args.includes('--delete-all-problematic')) {
      console.log('\n🗑️  Deleting ALL problematic products...');
      const ids = problematicProducts.map(item => item.product._id);
      const result = await Product.deleteMany({ _id: { $in: ids } });
      console.log(`✅ Deleted ${result.deletedCount} products`);
    }
    
    if (args.includes('--delete-id')) {
      const idIndex = args.indexOf('--delete-id') + 1;
      if (idIndex < args.length) {
        const productId = args[idIndex];
        console.log(`\n🗑️  Deleting product with ID: ${productId}...`);
        const result = await Product.deleteOne({ _id: productId });
        if (result.deletedCount > 0) {
          console.log(`✅ Product deleted successfully`);
        } else {
          console.log(`❌ Product not found`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
});
