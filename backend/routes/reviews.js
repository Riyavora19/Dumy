const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for review image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/reviews';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { sort = '-createdAt', rating } = req.query;

    const query = { 
      product: productId,
      status: 'approved'
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .sort(sort)
      .populate('user', 'name avatar');

    // Calculate rating statistics
    const stats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: reviews,
      stats: stats[0] || {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// Create a new review
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { product, user, userName, userEmail, rating, title, comment } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product, user });
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product' 
      });
    }

    // Process uploaded images
    const images = req.files ? req.files.map(file => `/uploads/reviews/${file.filename}`) : [];

    const review = new Review({
      product,
      user,
      userName,
      userEmail,
      rating: parseInt(rating),
      title,
      comment,
      images,
      isVerifiedPurchase: false // TODO: Check if user actually purchased this product
    });

    await review.save();

    // Update product rating
    await updateProductRating(product);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create review' });
  }
});

// Update a review
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, existingImages } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Update fields
    review.rating = parseInt(rating);
    review.title = title;
    review.comment = comment;

    // Handle images
    const newImages = req.files ? req.files.map(file => `/uploads/reviews/${file.filename}`) : [];
    const keepImages = existingImages ? JSON.parse(existingImages) : [];
    review.images = [...keepImages, ...newImages];

    await review.save();

    // Update product rating
    await updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Review updated successfully!',
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, message: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Delete review images
    review.images.forEach(imagePath => {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    // Update product rating
    await updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
});

// Mark review as helpful
router.post('/:id/helpful', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user already marked as helpful
    const alreadyHelpful = review.helpfulBy.includes(userId);
    
    if (alreadyHelpful) {
      // Remove helpful vote
      review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== userId);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add helpful vote
      review.helpfulBy.push(userId);
      review.helpful += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: alreadyHelpful ? 'Removed helpful vote' : 'Marked as helpful',
      data: { helpful: review.helpful, isHelpful: !alreadyHelpful }
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({ success: false, message: 'Failed to update review' });
  }
});

// Admin: Get all reviews (with filters)
router.get('/admin/all', async (req, res) => {
  try {
    const { status, rating, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (rating) query.rating = parseInt(rating);

    const reviews = await Review.find(query)
      .sort(sort)
      .populate('product', 'name images')
      .populate('user', 'name email');

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// Admin: Update review status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Update product rating
    await updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Review status updated',
      data: review
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ success: false, message: 'Failed to update review status' });
  }
});

// Admin: Add response to review
router.post('/:id/response', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, adminId } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
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
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ success: false, message: 'Failed to add response' });
  }
});

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const stats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: stats[0].totalReviews
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewCount: 0
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

module.exports = router;
