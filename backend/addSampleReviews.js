const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const User = require('./models/User');
const Review = require('./models/Review');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

// Sample user data
const sampleUsers = [
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', phone: '9876543210' },
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '9876543211' },
  { name: 'Amit Patel', email: 'amit.patel@example.com', phone: '9876543212' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', phone: '9876543213' },
  { name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '9876543214' },
  { name: 'Anita Desai', email: 'anita.desai@example.com', phone: '9876543215' },
  { name: 'Rahul Verma', email: 'rahul.verma@example.com', phone: '9876543216' },
  { name: 'Kavita Joshi', email: 'kavita.joshi@example.com', phone: '9876543217' },
  { name: 'Suresh Nair', email: 'suresh.nair@example.com', phone: '9876543218' },
  { name: 'Deepa Menon', email: 'deepa.menon@example.com', phone: '9876543219' },
  { name: 'Arjun Kapoor', email: 'arjun.kapoor@example.com', phone: '9876543220' },
  { name: 'Meera Iyer', email: 'meera.iyer@example.com', phone: '9876543221' },
  { name: 'Karan Malhotra', email: 'karan.malhotra@example.com', phone: '9876543222' },
  { name: 'Pooja Gupta', email: 'pooja.gupta@example.com', phone: '9876543223' },
  { name: 'Sanjay Rao', email: 'sanjay.rao@example.com', phone: '9876543224' },
];

// Review templates for different ratings
const reviewTemplates = {
  5: {
    titles: [
      'Excellent Quality!',
      'Highly Recommended',
      'Perfect Product',
      'Outstanding!',
      'Best Purchase Ever',
      'Superb Quality',
      'Absolutely Love It',
      'Worth Every Penny',
      'Premium Quality',
      'Exceeded Expectations'
    ],
    comments: [
      'This product exceeded my expectations. The quality is outstanding and installation was very easy. Highly recommend to everyone!',
      'Absolutely love this product! The build quality is excellent and it looks premium. Very satisfied with my purchase.',
      'Perfect fit for my bathroom. The finish is beautiful and it feels very sturdy. Great value for money!',
      'Outstanding quality! Easy to install and looks exactly as shown in pictures. Very happy with this purchase.',
      'Best product in this price range. The material quality is top-notch and it works perfectly. Highly recommended!',
      'Excellent product! The design is modern and elegant. Installation was straightforward. Very pleased!',
      'Superior quality and finish. Looks premium and feels durable. Worth every rupee spent!',
      'Amazing product! The craftsmanship is excellent. It has transformed my bathroom. Highly satisfied!',
      'Perfect product! Great quality, easy installation, and looks beautiful. Couldn\'t ask for more!',
      'Exceptional quality! The finish is flawless and it\'s very functional. Best purchase I\'ve made!'
    ]
  },
  4: {
    titles: [
      'Very Good Product',
      'Good Quality',
      'Satisfied with Purchase',
      'Nice Product',
      'Good Value',
      'Recommended',
      'Pretty Good',
      'Happy with It',
      'Good Choice',
      'Worth Buying'
    ],
    comments: [
      'Good quality product. Installation was easy. Only minor issue is the finish could be slightly better, but overall very satisfied.',
      'Nice product with good build quality. Works well and looks decent. Would recommend with minor reservations.',
      'Pretty good product for the price. The quality is good but not exceptional. Still happy with the purchase.',
      'Good value for money. The product works as expected. Installation was straightforward. Satisfied overall.',
      'Decent product with good quality. A few minor issues but nothing major. Would buy again.',
      'Good product overall. The design is nice and it functions well. Could be improved slightly but still recommended.',
      'Satisfied with this purchase. Good quality and reasonable price. Minor improvements needed but good product.',
      'Nice quality product. Easy to install and works well. A few small issues but overall happy.',
      'Good product for the price point. Quality is decent and it looks good. Would recommend.',
      'Pretty satisfied with this. Good build quality and easy installation. Minor flaws but acceptable.'
    ]
  },
  3: {
    titles: [
      'Average Product',
      'Okay Quality',
      'Decent',
      'It\'s Alright',
      'Acceptable',
      'Fair Product',
      'Could Be Better',
      'Moderate Quality',
      'Just Okay',
      'Average Experience'
    ],
    comments: [
      'Average product. Quality is okay but not great. Works fine but expected better for the price.',
      'Decent product but has some issues. The quality could be improved. It works but not exceptional.',
      'It\'s okay. Does the job but nothing special. Quality is average. Expected more.',
      'Fair product. Some quality issues noticed. Works but could be better designed.',
      'Acceptable quality. Has some minor defects. Works fine but not impressive.',
      'Average experience. Product works but quality is just okay. Could be improved.',
      'Moderate quality product. Does what it\'s supposed to do but nothing extraordinary.',
      'It\'s alright. Quality is decent but has room for improvement. Works as expected.',
      'Okay product. Some issues with finish. Functional but not great quality.',
      'Average overall. Works fine but quality could be better. Acceptable for the price.'
    ]
  },
  2: {
    titles: [
      'Below Average',
      'Disappointed',
      'Not Great',
      'Quality Issues',
      'Expected Better',
      'Poor Quality',
      'Not Satisfied',
      'Needs Improvement',
      'Subpar Product',
      'Not Recommended'
    ],
    comments: [
      'Disappointed with the quality. Product has several issues. Not worth the price. Would not recommend.',
      'Below average quality. Installation was difficult and finish is poor. Expected much better.',
      'Not satisfied with this purchase. Quality is poor and it doesn\'t work as expected. Disappointed.',
      'Poor quality product. Has multiple defects. Installation was problematic. Not recommended.',
      'Expected better quality. Product feels cheap and has issues. Would not buy again.',
      'Not great. Quality is below par. Several problems noticed. Disappointed with purchase.',
      'Subpar product. Quality issues and poor finish. Not worth the money. Regret buying.',
      'Disappointed. Product quality is poor. Doesn\'t match description. Not recommended.',
      'Below expectations. Quality is lacking. Has several defects. Would not recommend.',
      'Not satisfied. Poor build quality and finish. Multiple issues. Expected much better.'
    ]
  },
  1: {
    titles: [
      'Very Poor Quality',
      'Terrible Product',
      'Waste of Money',
      'Extremely Disappointed',
      'Do Not Buy',
      'Worst Purchase',
      'Complete Waste',
      'Horrible Quality',
      'Avoid This',
      'Total Disappointment'
    ],
    comments: [
      'Terrible quality! Product broke within days. Complete waste of money. Do not buy!',
      'Worst purchase ever. Quality is horrible. Doesn\'t work at all. Extremely disappointed!',
      'Absolutely terrible! Poor quality, doesn\'t work, and broke immediately. Avoid at all costs!',
      'Complete waste of money. Product is defective. Quality is pathetic. Very angry with this purchase!',
      'Horrible product! Broke on first use. Quality is extremely poor. Do not waste your money!',
      'Extremely disappointed! Product is useless. Quality is terrible. Worst purchase I\'ve made!',
      'Do not buy this! Quality is pathetic. Product doesn\'t work. Complete waste of money!',
      'Terrible experience! Product is defective. Quality is horrible. Extremely dissatisfied!',
      'Worst quality ever! Broke immediately. Doesn\'t work at all. Total waste of money!',
      'Absolutely horrible! Product is useless. Quality is terrible. Do not buy under any circumstances!'
    ]
  }
};

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomRating() {
  // Weight ratings towards positive (more realistic)
  const weights = [1, 3, 8, 25, 63]; // 1%, 3%, 8%, 25%, 63% for ratings 1-5
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return i + 1;
    }
  }
  return 5;
}

function getRandomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
}

async function createSampleUsers() {
  const users = [];
  
  for (const userData of sampleUsers) {
    // Check if user already exists
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      user = new User({
        ...userData,
        password: 'password123', // Will be hashed by pre-save hook
        isVerified: true,
        isActive: true
      });
      await user.save();
      console.log(`✅ Created user: ${user.name}`);
    } else {
      console.log(`ℹ️  User already exists: ${user.name}`);
    }
    
    users.push(user);
  }
  
  return users;
}

async function addReviewsToProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected\n');

    // Create sample users
    console.log('📝 Creating sample users...\n');
    const users = await createSampleUsers();
    console.log(`\n✅ ${users.length} users ready\n`);

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    // Delete existing reviews (optional - comment out if you want to keep existing reviews)
    const existingReviews = await Review.countDocuments();
    if (existingReviews > 0) {
      console.log(`🗑️  Deleting ${existingReviews} existing reviews...`);
      await Review.deleteMany({});
      console.log('✅ Existing reviews deleted\n');
    }

    console.log('🔍 Adding reviews to products...\n');

    let totalReviews = 0;
    let productsWithReviews = 0;

    for (const product of products) {
      // Randomly decide if this product should have reviews (80% chance)
      if (Math.random() > 0.8) continue;

      // Random number of reviews per product (1-8)
      const numReviews = Math.floor(Math.random() * 8) + 1;
      
      // Shuffle users to avoid same users reviewing
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      
      let productRatingSum = 0;
      let productReviewCount = 0;

      for (let i = 0; i < numReviews && i < shuffledUsers.length; i++) {
        const user = shuffledUsers[i];
        const rating = getRandomRating();
        const template = reviewTemplates[rating];
        
        const review = new Review({
          product: product._id,
          user: user._id,
          userName: user.name,
          userEmail: user.email,
          rating: rating,
          title: getRandomElement(template.titles),
          comment: getRandomElement(template.comments),
          isVerifiedPurchase: Math.random() > 0.3, // 70% verified purchases
          helpful: Math.floor(Math.random() * 20), // 0-19 helpful votes
          status: 'approved',
          createdAt: getRandomDate(180), // Reviews from last 180 days
          updatedAt: getRandomDate(180)
        });

        await review.save();
        
        productRatingSum += rating;
        productReviewCount++;
        totalReviews++;
      }

      // Update product rating and review count
      if (productReviewCount > 0) {
        const avgRating = productRatingSum / productReviewCount;
        await Product.updateOne(
          { _id: product._id },
          { 
            rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            reviewCount: productReviewCount 
          }
        );
        productsWithReviews++;
      }

      // Show progress every 50 products
      if (productsWithReviews % 50 === 0) {
        console.log(`📊 Progress: ${productsWithReviews} products processed...`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 REVIEW GENERATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Products: ${products.length}`);
    console.log(`Products with Reviews: ${productsWithReviews}`);
    console.log(`Total Reviews Created: ${totalReviews}`);
    console.log(`Average Reviews per Product: ${(totalReviews / productsWithReviews).toFixed(1)}`);
    console.log('='.repeat(60));

    // Show rating distribution
    const ratingDistribution = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    console.log('\n⭐ Rating Distribution:');
    ratingDistribution.forEach(item => {
      const percentage = ((item.count / totalReviews) * 100).toFixed(1);
      const stars = '★'.repeat(item._id) + '☆'.repeat(5 - item._id);
      console.log(`${stars} (${item._id}): ${item.count} reviews (${percentage}%)`);
    });

    // Show sample reviews
    console.log('\n📝 Sample Reviews:');
    const sampleReviews = await Review.find({})
      .populate('product', 'name')
      .limit(5)
      .sort({ createdAt: -1 });

    sampleReviews.forEach((review, index) => {
      console.log(`\n${index + 1}. ${review.product.name}`);
      console.log(`   By: ${review.userName}`);
      console.log(`   Rating: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`);
      console.log(`   Title: ${review.title}`);
      console.log(`   Comment: ${review.comment.substring(0, 80)}...`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

addReviewsToProducts();
