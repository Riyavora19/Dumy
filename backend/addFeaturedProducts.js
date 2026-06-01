require('dotenv').config();
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  isFeatured: Boolean,
  isActive: Boolean,
  price: Number,
  rating: Number,
  reviewCount: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

const categorySchema = new mongoose.Schema({
  name: String,
  isActive: Boolean
});

const companySchema = new mongoose.Schema({
  name: String,
  isActive: Boolean
});

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const Company = mongoose.model('Company', companySchema);

async function addFeaturedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected\n');

    // First, remove featured flag from all products
    await Product.updateMany({}, { $set: { isFeatured: false } });
    console.log('✅ Cleared all featured flags\n');

    // Get products with reviews (these are more likely to be good featured products)
    const productsWithReviews = await Product.find({
      isActive: true,
      reviewCount: { $gt: 0 }
    })
    .populate('company', 'name')
    .populate('category', 'name')
    .sort({ rating: -1, reviewCount: -1 })
    .limit(20);

    console.log(`📊 Found ${productsWithReviews.length} products with reviews\n`);

    // If we have products with reviews, mark top 12 as featured
    if (productsWithReviews.length > 0) {
      const featuredCount = Math.min(12, productsWithReviews.length);
      const featuredIds = productsWithReviews.slice(0, featuredCount).map(p => p._id);
      
      await Product.updateMany(
        { _id: { $in: featuredIds } },
        { $set: { isFeatured: true } }
      );

      console.log(`✅ Marked ${featuredCount} products as featured:\n`);
      
      for (let i = 0; i < featuredCount; i++) {
        const p = productsWithReviews[i];
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Company: ${p.company?.name || 'N/A'}`);
        console.log(`   Category: ${p.category?.name || 'N/A'}`);
        console.log(`   Rating: ${p.rating || 0} ⭐ (${p.reviewCount || 0} reviews)`);
        console.log(`   Price: ₹${p.price?.toLocaleString() || 'N/A'}\n`);
      }
    } else {
      // If no products have reviews, just mark first 12 active products as featured
      console.log('⚠️  No products with reviews found. Marking first 12 active products as featured...\n');
      
      const allProducts = await Product.find({ isActive: true })
        .populate('company', 'name')
        .populate('category', 'name')
        .limit(12);

      const featuredIds = allProducts.map(p => p._id);
      
      await Product.updateMany(
        { _id: { $in: featuredIds } },
        { $set: { isFeatured: true } }
      );

      console.log(`✅ Marked ${allProducts.length} products as featured:\n`);
      
      allProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Company: ${p.company?.name || 'N/A'}`);
        console.log(`   Category: ${p.category?.name || 'N/A'}`);
        console.log(`   Price: ₹${p.price?.toLocaleString() || 'N/A'}\n`);
      });
    }

    // Final count
    const finalCount = await Product.countDocuments({ isFeatured: true, isActive: true });
    console.log(`\n📊 Total Featured Products: ${finalCount}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addFeaturedProducts();
