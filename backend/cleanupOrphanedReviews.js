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
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  rating: Number,
  reviewCount: Number
});

const Review = mongoose.model('Review', reviewSchema);
const Product = mongoose.model('Product', productSchema);

async function cleanupOrphanedReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected\n');

    console.log('🔍 Finding orphaned reviews...\n');
    
    // Get all reviews
    const allReviews = await Review.find();
    console.log(`Total reviews in database: ${allReviews.length}`);
    
    // Get all valid product IDs
    const validProducts = await Product.find({}, '_id');
    const validProductIds = new Set(validProducts.map(p => p._id.toString()));
    console.log(`Total valid products: ${validProductIds.size}\n`);
    
    // Find orphaned reviews
    const orphanedReviewIds = [];
    for (const review of allReviews) {
      if (!validProductIds.has(review.product.toString())) {
        orphanedReviewIds.push(review._id);
      }
    }
    
    console.log(`Found ${orphanedReviewIds.length} orphaned reviews\n`);
    
    if (orphanedReviewIds.length > 0) {
      console.log('🗑️  Deleting orphaned reviews...');
      const result = await Review.deleteMany({ _id: { $in: orphanedReviewIds } });
      console.log(`✅ Deleted ${result.deletedCount} orphaned reviews\n`);
    }
    
    // Reset rating and reviewCount for all products
    console.log('🔄 Resetting product ratings and review counts...');
    await Product.updateMany({}, { $set: { rating: 0, reviewCount: 0 } });
    console.log('✅ Reset all product ratings and review counts\n');
    
    // Recalculate ratings for products that have valid reviews
    const remainingReviews = await Review.find();
    console.log(`Remaining valid reviews: ${remainingReviews.length}\n`);
    
    if (remainingReviews.length > 0) {
      console.log('📊 Recalculating product ratings...');
      const productReviews = {};
      
      for (const review of remainingReviews) {
        const productId = review.product.toString();
        if (!productReviews[productId]) {
          productReviews[productId] = [];
        }
        productReviews[productId].push(review.rating);
      }
      
      for (const [productId, ratings] of Object.entries(productReviews)) {
        const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        await Product.findByIdAndUpdate(productId, {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: ratings.length
        });
      }
      
      console.log(`✅ Updated ratings for ${Object.keys(productReviews).length} products\n`);
    }
    
    // Final summary
    const finalReviewCount = await Review.countDocuments();
    const productsWithReviews = await Product.countDocuments({ reviewCount: { $gt: 0 } });
    
    console.log('📊 Final Summary:');
    console.log(`Total reviews: ${finalReviewCount}`);
    console.log(`Products with reviews: ${productsWithReviews}`);
    console.log(`\n✅ Cleanup completed successfully!`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupOrphanedReviews();
