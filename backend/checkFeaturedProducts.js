require('dotenv').config();
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  isFeatured: Boolean,
  isActive: Boolean,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

const Product = mongoose.model('Product', productSchema);

async function checkFeaturedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected\n');

    const totalProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ isFeatured: true, isActive: true });
    
    console.log(`📊 Product Status:`);
    console.log(`Total Active Products: ${totalProducts}`);
    console.log(`Featured Products: ${featuredProducts}\n`);

    if (featuredProducts > 0) {
      console.log('✅ Featured products exist:');
      const featured = await Product.find({ isFeatured: true, isActive: true })
        .populate('company', 'name')
        .limit(5);
      
      featured.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - ${p.company?.name || 'N/A'}`);
      });
    } else {
      console.log('⚠️  No products are marked as featured');
      console.log('💡 Run addFeaturedProducts.js to mark some products as featured');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkFeaturedProducts();
