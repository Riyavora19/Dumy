require('dotenv').config();
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  isFeatured: Boolean,
  isActive: Boolean,
  price: Number,
  images: [String],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

const companySchema = new mongoose.Schema({
  name: String
});

const Product = mongoose.model('Product', productSchema);
const Company = mongoose.model('Company', companySchema);

async function testFeaturedAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected\n');

    // Simulate the API query
    const query = {
      isFeatured: true,
      isActive: true
    };

    const products = await Product.find(query)
      .populate('company', 'name')
      .limit(6);

    console.log(`📊 Featured Products Query Result:`);
    console.log(`Found: ${products.length} products\n`);

    if (products.length > 0) {
      console.log('✅ Featured products:');
      products.forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.name}`);
        console.log(`   Company: ${p.company?.name || 'N/A'}`);
        console.log(`   Price: ₹${p.price?.toLocaleString() || 'N/A'}`);
        console.log(`   Has Images: ${p.images && p.images.length > 0 ? 'Yes' : 'No'}`);
        console.log(`   isFeatured: ${p.isFeatured}`);
        console.log(`   isActive: ${p.isActive}`);
      });
    } else {
      console.log('❌ No featured products found!');
      console.log('This means the API will return empty array.');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFeaturedAPI();
