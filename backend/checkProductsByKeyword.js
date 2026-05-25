const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

mongoose.connect('mongodb://localhost:27017/mernapp')
  .then(async () => {
    console.log('Connected to database\n');
    
    // Get all products
    const allProducts = await Product.find({})
      .select('name variant category')
      .populate('category', 'name');
    
    console.log(`Total products: ${allProducts.length}\n`);
    
    // Check for basin products
    console.log('=== BASIN PRODUCTS ===');
    const basinProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes('basin') || 
      p.variant?.toLowerCase().includes('basin')
    );
    console.log(`Found ${basinProducts.length} basin products:`);
    basinProducts.forEach(p => console.log(`- ${p.name} (${p.variant || 'no variant'})`));
    
    // Check for toilet/WC products
    console.log('\n=== TOILET/WC PRODUCTS ===');
    const toiletProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes('toilet') || 
      p.name.toLowerCase().includes('wc') ||
      p.variant?.toLowerCase().includes('toilet') ||
      p.variant?.toLowerCase().includes('wc')
    );
    console.log(`Found ${toiletProducts.length} toilet products:`);
    toiletProducts.forEach(p => console.log(`- ${p.name} (${p.variant || 'no variant'})`));
    
    // Check for mirror products
    console.log('\n=== MIRROR PRODUCTS ===');
    const mirrorProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes('mirror') || 
      p.variant?.toLowerCase().includes('mirror')
    );
    console.log(`Found ${mirrorProducts.length} mirror products:`);
    mirrorProducts.forEach(p => console.log(`- ${p.name} (${p.variant || 'no variant'})`));
    
    // Check for shower products
    console.log('\n=== SHOWER PRODUCTS ===');
    const showerProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes('shower') || 
      p.variant?.toLowerCase().includes('shower')
    );
    console.log(`Found ${showerProducts.length} shower products:`);
    showerProducts.forEach(p => console.log(`- ${p.name} (${p.variant || 'no variant'})`));
    
    // Check for flush/faceplate products
    console.log('\n=== FLUSH/FACEPLATE PRODUCTS ===');
    const flushProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes('flush') || 
      p.name.toLowerCase().includes('faceplate') ||
      p.variant?.toLowerCase().includes('flush') ||
      p.variant?.toLowerCase().includes('faceplate')
    );
    console.log(`Found ${flushProducts.length} flush products:`);
    flushProducts.forEach(p => console.log(`- ${p.name} (${p.variant || 'no variant'})`));
    
    process.exit();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
