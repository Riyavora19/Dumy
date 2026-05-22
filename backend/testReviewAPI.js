const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Review = require('./models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

async function testReviewAPI() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Get a product with reviews
    const productWithReviews = await Product.findOne({ reviewCount: { $gt: 0 } });
    
    if (!productWithReviews) {
      console.log('❌ No products with reviews found!');
      return;
    }

    console.log('✅ Found product with reviews:');
    console.log(`   Product: ${productWithReviews.name}`);
    console.log(`   ID: ${productWithReviews._id}`);
    console.log(`   Rating: ${productWithReviews.rating}`);
    console.log(`   Review Count: ${productWithReviews.reviewCount}`);

    // Get reviews for this product
    const reviews = await Review.find({ product: productWithReviews._id, status: 'approved' });
    
    console.log(`\n📝 Reviews for this product: ${reviews.length}`);
    
    if (reviews.length > 0) {
      console.log('\nSample reviews:');
      reviews.slice(0, 3).forEach((review, index) => {
        console.log(`\n${index + 1}. ${review.title}`);
        console.log(`   By: ${review.userName}`);
        console.log(`   Rating: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`);
        console.log(`   Comment: ${review.comment.substring(0, 80)}...`);
      });
    }

    console.log(`\n\n🔗 Test this URL in your browser:`);
    console.log(`http://localhost:5000/api/reviews/product/${productWithReviews._id}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testReviewAPI();
