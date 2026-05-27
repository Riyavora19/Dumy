const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { reviewStorage } = require('../config/cloudinary');

// Configure multer with Cloudinary storage
const upload = multer({
  storage: reviewStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { sort = '-createdAt', rating } = req.query;

    // Build query
    const query = { product: productId, status: 'approved' };
    if (rating) {
      query.rating = parseInt(rating);
    }

    // Fetch reviews
    const reviews = await Review.find(query)
      .sort(sort)
      .populate('user', 'name email')
      .lean();

    // Calculate statistics
    const allReviews = await Review.find({ product: productId, status: 'approved' });
    const stats = {
      totalReviews: allReviews.length,
      averageRating: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0
    };

    if (allReviews.length > 0) {
      const ratingSum = allReviews.reduce((sum, review) => sum + review.rating, 0);
      stats.averageRating = ratingSum / allReviews.length;

      allReviews.forEach(review => {
        switch (review.rating) {
          case 5: stats.fiveStars++; break;
          case 4: stats.fourStars++; break;
          case 3: stats.threeStars++; break;
          case 2: stats.twoStars++; break;
          case 1: stats.oneStar++; break;
        }
      });
    }

    res.json({
      success: true,
      data: reviews,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// Create a new review
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { product, user, userName, userEmail, rating, title, comment } = req.body;

    // Validate required fields
    if (!product || !user || !userName || !userEmail || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product, user });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Process uploaded images
    const imagePaths = req.files ? req.files.map(file => file.path) : []; // Cloudinary returns full URL

    // Create review
    const review = new Review({
      product,
      user,
      userName,
      userEmail,
      rating: parseInt(rating),
      title,
      comment,
      images: imagePaths,
      status: 'approved' // Auto-approve for now
    });

    await review.save();

    // Update product rating and review count
    await updateProductRating(product);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpfulBy.includes(userId);
    
    if (alreadyMarked) {
      // Remove helpful mark
      review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== userId);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add helpful mark
      review.helpfulBy.push(userId);
      review.helpful += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: alreadyMarked ? 'Removed helpful mark' : 'Marked as helpful',
      data: review
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
});

// Get all reviews (Admin)
router.get('/', async (req, res) => {
  try {
    const { status, rating, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (rating) query.rating = parseInt(rating);

    const reviews = await Review.find(query)
      .sort(sort)
      .populate('product', 'name')
      .populate('user', 'name email')
      .lean();

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// Update review status (Admin)
router.put('/:reviewId/status', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Update product rating if status changed to approved or rejected
    await updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Review status updated',
      data: review
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review status',
      error: error.message
    });
  }
});

// Add admin response to review
router.post('/:reviewId/response', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { text, adminId } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        adminResponse: {
          text,
          respondedAt: new Date(),
          respondedBy: adminId
        }
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    console.error('Error adding admin response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
});

// Delete review (Admin)
router.delete('/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Delete review images
    if (review.images && review.images.length > 0) {
      review.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await Review.findByIdAndDelete(reviewId);

    // Update product rating
    await updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
});

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ product: productId, status: 'approved' });
    
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

module.exports = router;
