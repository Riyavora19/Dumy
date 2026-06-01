require('dotenv').config();
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  userName: String,
  userEmail: String,
  rating: Number,
  title: String,
  comment: String,
  status: String,
  isVerifiedPurchase: Boolean,
  helpful: Number,
  createdAt: Date
});

const productSchema = new mongoose.Schema({
  name: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
});

const Review = mongoose.model('Review', reviewSchema);
const Product = mongoose.model('Product', productSchema);

async function checkReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected\n');

    const totalReviews = await Review.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    console.log(`📊 Current Status:`);
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Total Reviews: ${totalReviews}\n`);

    // Check for orphaned reviews (reviews for products that don't exist)
    const reviews = await Review.find().populate('product');
    const orphanedReviews = reviews.filter(r => !r.product);
    
    console.log(`🔍 Orphaned Reviews (no matching product): ${orphanedReviews.length}`);
    
    if (orphanedReviews.length > 0) {
      console.log(`\n⚠️  Found ${orphanedReviews.length} reviews for deleted products`);
      console.log(`These should be cleaned up.\n`);
    }

    // Get product IDs that have reviews
    const productIds = [...new Set(reviews.filter(r => r.product).map(r => r.product._id.toString()))];
    console.log(`Products with reviews: ${productIds.length}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkReviews();
