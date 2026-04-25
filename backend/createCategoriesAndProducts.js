const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const categories = [
  { name: 'Toilet', icon: '🚽', color: '#e8f0e0', description: 'Premium toilets and commodes' },
  { name: 'Shower', icon: '🚿', color: '#d6e4f0', description: 'Modern shower systems' },
  { name: 'Wash Basin', icon: '🚰', color: '#ffe4e8', description: 'Elegant wash basins and sinks' },
  { name: 'Faucet', icon: '🚰', color: '#fff4e0', description: 'Designer faucets and taps' },
  { name: 'Bathtub', icon: '🛁', color: '#f0e8ff', description: 'Luxury bathtubs and jacuzzis' },
  { name: 'Mirror', icon: '🪞', color: '#e0f7ff', description: 'Bathroom mirrors and cabinets' },
  { name: 'Tiles', icon: '⬜', color: '#f5f5f5', description: 'Floor and wall tiles' },
  { name: 'Cabinet', icon: '🗄️', color: '#ffe8d6', description: 'Storage cabinets and vanities' }
];

const productVariants = {
  'Toilet': [
    { variant: 'Basic', price: 2000, originalPrice: 2500, discount: 20, color: 'White', size: 'Standard' },
    { variant: 'Standard', price: 4000, originalPrice: 5000, discount: 20, color: 'White', size: 'Standard' },
    { variant: 'Comfort', price: 7000, originalPrice: 8500, discount: 18, color: 'White', size: 'Elongated' },
    { variant: 'Premium', price: 12000, originalPrice: 15000, discount: 20, color: 'Ivory', size: 'Elongated' },
    { variant: 'Smart Basic', price: 20000, originalPrice: 25000, discount: 20, color: 'White', size: 'Smart' },
    { variant: 'Smart Premium', price: 35000, originalPrice: 42000, discount: 17, color: 'White', size: 'Smart' },
    { variant: 'Smart Luxury', price: 55000, originalPrice: 65000, discount: 15, color: 'Black', size: 'Smart' },
    { variant: 'Smart Elite', price: 80000, originalPrice: 95000, discount: 16, color: 'Custom', size: 'Smart' },
    { variant: 'Smart Ultimate', price: 120000, originalPrice: 140000, discount: 14, color: 'Custom', size: 'Smart' }
  ],
  'Shower': [
    { variant: 'Basic Model', price: 500, originalPrice: 700, discount: 29, color: 'Chrome', size: 'Small' },
    { variant: 'Standard Model', price: 1200, originalPrice: 1500, discount: 20, color: 'Chrome', size: 'Medium' },
    { variant: 'Premium Model', price: 2500, originalPrice: 3000, discount: 17, color: 'Brushed Nickel', size: 'Medium' },
    { variant: 'Deluxe Model', price: 4500, originalPrice: 5500, discount: 18, color: 'Gold', size: 'Large' },
    { variant: 'Luxury Model', price: 8000, originalPrice: 10000, discount: 20, color: 'Rose Gold', size: 'Large' },
    { variant: 'Elite Model', price: 15000, originalPrice: 18000, discount: 17, color: 'Matte Black', size: 'Extra Large' },
    { variant: 'Royal Model', price: 25000, originalPrice: 30000, discount: 17, color: 'Platinum', size: 'Extra Large' },
    { variant: 'Imperial Model', price: 50000, originalPrice: 60000, discount: 17, color: 'Gold Plated', size: 'XXL' },
    { variant: 'Supreme Model', price: 75000, originalPrice: 90000, discount: 17, color: 'Diamond Finish', size: 'XXL' },
    { variant: 'Ultimate Model', price: 100000, originalPrice: 120000, discount: 17, color: 'Custom', size: 'Custom' }
  ],
  'Wash Basin': [
    { variant: 'Basic Round', price: 1500, originalPrice: 2000, discount: 25, color: 'White', size: 'Small' },
    { variant: 'Standard Oval', price: 2500, originalPrice: 3200, discount: 22, color: 'White', size: 'Medium' },
    { variant: 'Premium Square', price: 4000, originalPrice: 5000, discount: 20, color: 'Ivory', size: 'Medium' },
    { variant: 'Designer Round', price: 6500, originalPrice: 8000, discount: 19, color: 'Black', size: 'Large' },
    { variant: 'Luxury Vessel', price: 10000, originalPrice: 12500, discount: 20, color: 'Marble', size: 'Large' },
    { variant: 'Elite Counter', price: 18000, originalPrice: 22000, discount: 18, color: 'Granite', size: 'Extra Large' },
    { variant: 'Royal Pedestal', price: 28000, originalPrice: 35000, discount: 20, color: 'Onyx', size: 'Extra Large' },
    { variant: 'Imperial Wall Mount', price: 45000, originalPrice: 55000, discount: 18, color: 'Custom Stone', size: 'Custom' },
    { variant: 'Supreme Designer', price: 70000, originalPrice: 85000, discount: 18, color: 'Italian Marble', size: 'Custom' },
    { variant: 'Ultimate Custom', price: 100000, originalPrice: 120000, discount: 17, color: 'Custom', size: 'Custom' }
  ],
  'Faucet': [
    { variant: 'Economy', price: 300, originalPrice: 400, discount: 25, color: 'Chrome', size: 'Standard' },
    { variant: 'Standard', price: 800, originalPrice: 1000, discount: 20, color: 'Chrome', size: 'Standard' },
    { variant: 'Premium', price: 1500, originalPrice: 2000, discount: 25, color: 'Brushed Nickel', size: 'Standard' },
    { variant: 'Designer', price: 3000, originalPrice: 3500, discount: 14, color: 'Matte Black', size: 'Large' },
    { variant: 'Luxury', price: 5500, originalPrice: 7000, discount: 21, color: 'Gold', size: 'Large' },
    { variant: 'Elite Sensor', price: 10000, originalPrice: 12000, discount: 17, color: 'Rose Gold', size: 'Large' },
    { variant: 'Royal Touchless', price: 18000, originalPrice: 22000, discount: 18, color: 'Platinum', size: 'Extra Large' },
    { variant: 'Imperial Smart', price: 35000, originalPrice: 42000, discount: 17, color: 'Gold Plated', size: 'Extra Large' },
    { variant: 'Supreme Digital', price: 60000, originalPrice: 72000, discount: 17, color: 'Custom', size: 'Custom' }
  ],
  'Bathtub': [
    { variant: 'Basic', price: 8000, originalPrice: 10000, discount: 20, color: 'White', size: 'Standard' },
    { variant: 'Standard', price: 15000, originalPrice: 18000, discount: 17, color: 'White', size: 'Standard' },
    { variant: 'Premium', price: 25000, originalPrice: 30000, discount: 17, color: 'Ivory', size: 'Large' },
    { variant: 'Jacuzzi Basic', price: 40000, originalPrice: 48000, discount: 17, color: 'White', size: 'Large' },
    { variant: 'Jacuzzi Premium', price: 65000, originalPrice: 78000, discount: 17, color: 'Black', size: 'Extra Large' },
    { variant: 'Jacuzzi Luxury', price: 95000, originalPrice: 115000, discount: 17, color: 'Custom', size: 'Extra Large' },
    { variant: 'Spa Basic', price: 130000, originalPrice: 155000, discount: 16, color: 'White', size: 'XXL' },
    { variant: 'Spa Premium', price: 180000, originalPrice: 215000, discount: 16, color: 'Custom', size: 'XXL' },
    { variant: 'Spa Ultimate', price: 250000, originalPrice: 300000, discount: 17, color: 'Custom', size: 'Custom' }
  ],
  'Mirror': [
    { variant: 'Basic', price: 500, originalPrice: 700, discount: 29, color: 'Clear', size: 'Small' },
    { variant: 'Standard', price: 1200, originalPrice: 1500, discount: 20, color: 'Clear', size: 'Medium' },
    { variant: 'LED Basic', price: 2500, originalPrice: 3000, discount: 17, color: 'Clear', size: 'Medium' },
    { variant: 'LED Premium', price: 4500, originalPrice: 5500, discount: 18, color: 'Clear', size: 'Large' },
    { variant: 'Smart Basic', price: 8000, originalPrice: 10000, discount: 20, color: 'Clear', size: 'Large' },
    { variant: 'Smart Premium', price: 15000, originalPrice: 18000, discount: 17, color: 'Tinted', size: 'Extra Large' },
    { variant: 'Smart Luxury', price: 25000, originalPrice: 30000, discount: 17, color: 'Custom', size: 'Extra Large' },
    { variant: 'Smart Elite', price: 40000, originalPrice: 48000, discount: 17, color: 'Custom', size: 'Custom' },
    { variant: 'Smart Ultimate', price: 65000, originalPrice: 78000, discount: 17, color: 'Custom', size: 'Custom' }
  ],
  'Tiles': [
    { variant: 'Ceramic Basic', price: 25, originalPrice: 35, discount: 29, color: 'White', size: '12x12' },
    { variant: 'Ceramic Standard', price: 50, originalPrice: 65, discount: 23, color: 'Beige', size: '12x12' },
    { variant: 'Ceramic Premium', price: 100, originalPrice: 125, discount: 20, color: 'Gray', size: '18x18' },
    { variant: 'Porcelain Basic', price: 150, originalPrice: 180, discount: 17, color: 'White', size: '18x18' },
    { variant: 'Porcelain Premium', price: 250, originalPrice: 300, discount: 17, color: 'Marble Look', size: '24x24' },
    { variant: 'Marble Basic', price: 400, originalPrice: 480, discount: 17, color: 'White Marble', size: '24x24' },
    { variant: 'Marble Premium', price: 700, originalPrice: 850, discount: 18, color: 'Italian Marble', size: '36x36' },
    { variant: 'Marble Luxury', price: 1200, originalPrice: 1450, discount: 17, color: 'Carrara', size: '36x36' },
    { variant: 'Marble Elite', price: 2000, originalPrice: 2400, discount: 17, color: 'Calacatta', size: 'Custom' },
    { variant: 'Marble Ultimate', price: 3500, originalPrice: 4200, discount: 17, color: 'Statuario', size: 'Custom' }
  ],
  'Cabinet': [
    { variant: 'Basic', price: 3000, originalPrice: 3800, discount: 21, color: 'White', size: 'Small' },
    { variant: 'Standard', price: 6000, originalPrice: 7500, discount: 20, color: 'White', size: 'Medium' },
    { variant: 'Premium', price: 12000, originalPrice: 15000, discount: 20, color: 'Wood', size: 'Medium' },
    { variant: 'Designer', price: 20000, originalPrice: 24000, discount: 17, color: 'Oak', size: 'Large' },
    { variant: 'Luxury', price: 35000, originalPrice: 42000, discount: 17, color: 'Walnut', size: 'Large' },
    { variant: 'Elite', price: 55000, originalPrice: 66000, discount: 17, color: 'Mahogany', size: 'Extra Large' },
    { variant: 'Royal', price: 85000, originalPrice: 102000, discount: 17, color: 'Teak', size: 'Extra Large' },
    { variant: 'Imperial', price: 120000, originalPrice: 145000, discount: 17, color: 'Custom Wood', size: 'Custom' },
    { variant: 'Supreme', price: 180000, originalPrice: 215000, discount: 16, color: 'Exotic Wood', size: 'Custom' }
  ]
};

async function createData() {
  try {
    console.log('Fetching existing categories...');
    const categoriesResponse = await axios.get(`${API_URL}/categories`);
    let existingCategories = categoriesResponse.data.data || [];
    
    console.log(`Found ${existingCategories.length} existing categories`);

    // Create categories if they don't exist
    console.log('\nCreating/Updating categories...');
    for (const cat of categories) {
      const exists = existingCategories.find(c => c.name === cat.name);
      if (!exists) {
        console.log(`  ✓ Creating category: ${cat.name}`);
        const response = await axios.post(`${API_URL}/categories`, cat);
        existingCategories.push(response.data.data);
      } else {
        console.log(`  - Category ${cat.name} already exists`);
      }
    }

    // Fetch updated categories
    const updatedCategoriesResponse = await axios.get(`${API_URL}/categories`);
    existingCategories = updatedCategoriesResponse.data.data || [];

    // Fetch all products to delete them
    console.log('\nDeleting existing products...');
    const productsResponse = await axios.get(`${API_URL}/products`);
    const existingProducts = productsResponse.data.data || [];
    
    for (const product of existingProducts) {
      await axios.delete(`${API_URL}/products/${product._id}`);
    }
    console.log(`Deleted ${existingProducts.length} products`);

    // Create products for each category
    console.log('\nCreating products...');
    let totalCreated = 0;
    
    for (const category of existingCategories) {
      const variants = productVariants[category.name];
      
      if (!variants) {
        console.log(`\n⚠ No variants defined for ${category.name}, skipping...`);
        continue;
      }
      
      console.log(`\n${category.icon} ${category.name} (${variants.length} variants):`);
      
      for (const variantData of variants) {
        const formData = new FormData();
        formData.append('name', category.name);
        formData.append('description', `${variantData.variant} ${category.name} with premium quality and modern design`);
        formData.append('category', category._id);
        formData.append('company', 'Kohler');
        formData.append('price', variantData.price);
        formData.append('originalPrice', variantData.originalPrice);
        formData.append('discount', variantData.discount);
        formData.append('variant', variantData.variant);
        formData.append('variantDescription', `${variantData.variant} variant with ${variantData.color} finish`);
        formData.append('sku', `${category.name.substring(0, 3).toUpperCase()}-${variantData.variant.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`);
        formData.append('stock', Math.floor(Math.random() * 50) + 10);
        formData.append('specifications', JSON.stringify({
          material: 'Premium Grade',
          size: variantData.size,
          color: variantData.color,
          weight: `${Math.floor(Math.random() * 20) + 5}kg`,
          dimensions: `${variantData.size} size`,
          warranty: '2 Years',
          features: ['Easy Installation', 'Durable Construction', 'Modern Design', 'Water Efficient']
        }));
        formData.append('isActive', 'true');
        formData.append('existingImages', '/uploads/1776849067517-337759119.png');

        try {
          await axios.post(`${API_URL}/products`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log(`  ✓ ${variantData.variant} - ₹${variantData.price.toLocaleString()}`);
          totalCreated++;
        } catch (error) {
          console.error(`  ✗ Failed to create ${variantData.variant}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log(`\n✅ Successfully created ${totalCreated} products across ${existingCategories.length} categories!`);
    console.log('\n📊 Summary:');
    console.log(`   Categories: ${existingCategories.length}`);
    console.log(`   Products: ${totalCreated}`);
    console.log(`   Price Range: ₹25 - ₹2,50,000`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createData();
