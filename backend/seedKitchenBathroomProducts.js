const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');
const Product = require('./models/Product');
const Company = require('./models/Company');
const ProductItemType = require('./models/ProductItemType');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function seedKitchenBathroomProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Get categories
    const bathroomCategory = await Category.findOne({ name: 'Bathroom' });
    const kitchenCategory = await Category.findOne({ name: 'Kitchen' });
    
    if (!bathroomCategory || !kitchenCategory) {
      console.log('❌ Bathroom or Kitchen category not found');
      return;
    }

    // Get companies
    const companies = await Company.find();
    const kohler = companies.find(c => c.name === 'Kohler');
    const jaquar = companies.find(c => c.name === 'Jaquar');
    const hindware = companies.find(c => c.name === 'Hindware');
    const cera = companies.find(c => c.name === 'Cera');
    const parryware = companies.find(c => c.name === 'Parryware');

    // Get item types
    const toiletSeat = await ProductItemType.findOne({ name: 'Toilet Seat' });
    const showerHead = await ProductItemType.findOne({ name: 'Shower Head' });
    const washBasin = await ProductItemType.findOne({ name: 'Wash Basin' });
    const tapFaucet = await ProductItemType.findOne({ name: 'Tap/Faucet' });
    const mirror = await ProductItemType.findOne({ name: 'Mirror' });
    const bathroomTiles = await ProductItemType.findOne({ name: 'Bathroom Tiles' });
    const bathroomCabinet = await ProductItemType.findOne({ name: 'Bathroom Cabinet' });
    
    const kitchenSink = await ProductItemType.findOne({ name: 'Kitchen Sink' });
    const kitchenTap = await ProductItemType.findOne({ name: 'Kitchen Tap' });
    const kitchenTiles = await ProductItemType.findOne({ name: 'Kitchen Tiles' });
    const chimney = await ProductItemType.findOne({ name: 'Chimney' });
    const gasStove = await ProductItemType.findOne({ name: 'Gas Stove' });
    const kitchenCabinet = await ProductItemType.findOne({ name: 'Kitchen Cabinet' });
    const countertop = await ProductItemType.findOne({ name: 'Countertop' });

    console.log('Creating Bathroom products...\n');

    const bathroomProducts = [];
    let productCount = 0;

    // Bathroom products - 11 variants for each of 3 companies = 33 products
    const bathroomCompanies = [kohler, jaquar, hindware];
    const bathroomVariants = [
      { name: 'Basic Bathroom Set', price: 25000, originalPrice: 32000, description: 'Complete bathroom set with toilet, basin, and faucet' },
      { name: 'Standard Bathroom Set', price: 35000, originalPrice: 45000, description: 'Standard bathroom set with all essentials' },
      { name: 'Compact Bathroom Set', price: 28000, originalPrice: 36000, description: 'Space-saving bathroom set for small spaces' },
      { name: 'Modern Bathroom Set', price: 45000, originalPrice: 58000, description: 'Modern bathroom set with contemporary design' },
      { name: 'Premium Bathroom Set', price: 55000, originalPrice: 70000, description: 'Premium bathroom set with modern fixtures' },
      { name: 'Classic Bathroom Set', price: 38000, originalPrice: 48000, description: 'Classic bathroom set with timeless design' },
      { name: 'Luxury Bathroom Set', price: 85000, originalPrice: 110000, description: 'Luxury bathroom set with designer products' },
      { name: 'Elite Bathroom Set', price: 95000, originalPrice: 125000, description: 'Elite bathroom set with smart features' },
      { name: 'Designer Bathroom Set', price: 120000, originalPrice: 150000, description: 'Designer bathroom set with premium finishes' },
      { name: 'Minimalist Bathroom Set', price: 42000, originalPrice: 54000, description: 'Minimalist bathroom set with clean lines' },
      { name: 'Royal Bathroom Set', price: 150000, originalPrice: 190000, description: 'Royal bathroom set with gold-plated fixtures' }
    ];

    for (const company of bathroomCompanies) {
      for (const variant of bathroomVariants) {
        bathroomProducts.push({
          name: variant.name,
          variant: company.name,
          variantDescription: `${company.name} ${variant.name}`,
          description: variant.description,
          category: bathroomCategory._id,
          company: company._id,
          companyName: company.name,
          itemType: toiletSeat._id,
          itemTypeName: toiletSeat.name,
          price: variant.price,
          originalPrice: variant.originalPrice,
          discount: Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100),
          stock: Math.floor(Math.random() * 30) + 10,
          sku: `BATH-${company.name.substring(0, 3).toUpperCase()}-${String(productCount).padStart(3, '0')}`,
          isActive: true,
          images: ['/uploads/1776849067517-337759119.png'],
          specifications: {
            material: 'Premium Grade',
            size: 'Standard',
            color: 'White',
            weight: `${Math.floor(Math.random() * 50) + 20}kg`,
            dimensions: 'Complete Set',
            warranty: '5 Years',
            features: ['Complete Set', 'Easy Installation', 'Modern Design', 'Water Efficient']
          }
        });
        productCount++;
      }
    }

    console.log('Creating Kitchen products...\n');

    const kitchenProducts = [];

    // Kitchen products - 11 variants for each of 3 companies = 33 products
    const kitchenCompanies = [kohler, jaquar, hindware];
    const kitchenVariants = [
      { name: 'Basic Kitchen Set', price: 45000, originalPrice: 58000, description: 'Basic kitchen set with sink and tap' },
      { name: 'Standard Kitchen Set', price: 65000, originalPrice: 82000, description: 'Standard kitchen set with all essentials' },
      { name: 'Compact Kitchen Set', price: 55000, originalPrice: 70000, description: 'Space-saving kitchen set for small spaces' },
      { name: 'Modern Kitchen Set', price: 110000, originalPrice: 140000, description: 'Modern kitchen set with contemporary design' },
      { name: 'Premium Kitchen Set', price: 95000, originalPrice: 120000, description: 'Premium kitchen set with modern appliances' },
      { name: 'Modular Kitchen Basic', price: 85000, originalPrice: 110000, description: 'Basic modular kitchen with cabinets' },
      { name: 'Modular Kitchen Standard', price: 125000, originalPrice: 160000, description: 'Standard modular kitchen with storage' },
      { name: 'Modular Kitchen Premium', price: 180000, originalPrice: 230000, description: 'Premium modular kitchen with appliances' },
      { name: 'Luxury Kitchen Set', price: 150000, originalPrice: 190000, description: 'Luxury kitchen set with designer products' },
      { name: 'Designer Kitchen Set', price: 200000, originalPrice: 250000, description: 'Designer kitchen set with premium finishes' },
      { name: 'Smart Kitchen Set', price: 250000, originalPrice: 320000, description: 'Smart kitchen set with IoT appliances' }
    ];

    for (const company of kitchenCompanies) {
      for (const variant of kitchenVariants) {
        kitchenProducts.push({
          name: variant.name,
          variant: company.name,
          variantDescription: `${company.name} ${variant.name}`,
          description: variant.description,
          category: kitchenCategory._id,
          company: company._id,
          companyName: company.name,
          itemType: kitchenSink._id,
          itemTypeName: kitchenSink.name,
          price: variant.price,
          originalPrice: variant.originalPrice,
          discount: Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100),
          stock: Math.floor(Math.random() * 20) + 5,
          sku: `KITCH-${company.name.substring(0, 3).toUpperCase()}-${String(productCount).padStart(3, '0')}`,
          isActive: true,
          images: ['/uploads/1776849067517-337759119.png'],
          specifications: {
            material: 'Premium Grade',
            size: 'Standard',
            color: 'Modern',
            weight: `${Math.floor(Math.random() * 100) + 50}kg`,
            dimensions: 'Complete Set',
            warranty: '5 Years',
            features: ['Complete Set', 'Professional Installation', 'Modern Design', 'Energy Efficient']
          }
        });
        productCount++;
      }
    }

    // Insert products
    const createdBathroomProducts = await Product.insertMany(bathroomProducts);
    console.log(`✅ Created ${createdBathroomProducts.length} Bathroom products`);

    const createdKitchenProducts = await Product.insertMany(kitchenProducts);
    console.log(`✅ Created ${createdKitchenProducts.length} Kitchen products`);

    console.log('\n✅ Kitchen and Bathroom products seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   🛁 Bathroom products: ${createdBathroomProducts.length}`);
    console.log(`   🍳 Kitchen products: ${createdKitchenProducts.length}`);
    console.log(`   Total: ${createdBathroomProducts.length + createdKitchenProducts.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedKitchenBathroomProducts();
