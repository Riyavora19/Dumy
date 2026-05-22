import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import './ProductReviews.css';

const ProductReviews = ({ productId }) => {
  const { showNotification } = useNotification();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('-createdAt');
  const [filterRating, setFilterRating] = useState('');
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = { sort: sortBy };
      if (filterRating) params.rating = filterRating;

      const response = await axios.get(`http://localhost:5000/api/reviews/product/${productId}`, { params });
      if (response.data.success) {
        setReviews(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      showNotification('Maximum 5 images allowed', 'warning');
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Get user info from localStorage
    const userToken = localStorage.getItem('userToken');
    const userInfo = localStorage.getItem('userInfo');

    if (!userToken || !userInfo) {
      showNotification('Please login to submit a review', 'error');
      return;
    }

    const user = JSON.parse(userInfo);

    const data = new FormData();
    data.append('product', productId);
    data.append('user', user.id);
    data.append('userName', user.name);
    data.append('userEmail', user.email);
    data.append('rating', formData.rating);
    data.append('title', formData.title);
    data.append('comment', formData.comment);

    selectedFiles.forEach(file => {
      data.append('images', file);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/reviews', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        showNotification('Review submitted successfully!', 'success');
        setShowReviewForm(false);
        setFormData({ rating: 5, title: '', comment: '', images: [] });
        setSelectedFiles([]);
        setPreviewImages([]);
        fetchReviews();
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  const handleHelpful = async (reviewId) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      showNotification('Please login to mark reviews as helpful', 'info');
      return;
    }

    const user = JSON.parse(userInfo);

    try {
      const response = await axios.post(`http://localhost:5000/api/reviews/${reviewId}/helpful`, {
        userId: user.id
      });

      if (response.data.success) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const renderStars = (rating, size = 'medium') => {
    return (
      <div className={`review-stars review-stars--${size}`}>
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderRatingBar = (count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="rating-bar">
        <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  return (
    <div className="product-reviews">
      {/* Rating Summary */}
      {stats && stats.totalReviews > 0 && (
        <div className="reviews-summary">
          <div className="reviews-summary-left">
            <div className="average-rating">
              <span className="average-rating-number">{stats.averageRating.toFixed(1)}</span>
              {renderStars(Math.round(stats.averageRating), 'large')}
            </div>
            <p className="total-reviews">{stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}</p>
          </div>

          <div className="reviews-summary-right">
            <div className="rating-breakdown">
              {[5, 4, 3, 2, 1].map(star => {
                const starKey = star === 5 ? 'fiveStars' : 
                               star === 4 ? 'fourStars' : 
                               star === 3 ? 'threeStars' : 
                               star === 2 ? 'twoStars' : 'oneStar';
                const count = stats[starKey] || 0;
                
                return (
                  <div key={star} className="rating-row" onClick={() => setFilterRating(filterRating === star ? '' : star)}>
                    <span className="rating-label">{star} ★</span>
                    {renderRatingBar(count, stats.totalReviews)}
                    <span className="rating-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="reviews-actions">
        <button className="btn-write-review" onClick={() => setShowReviewForm(!showReviewForm)}>
          ✍️ Write a Review
        </button>

        <div className="reviews-filters">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="-createdAt">Most Recent</option>
            <option value="createdAt">Oldest First</option>
            <option value="-rating">Highest Rating</option>
            <option value="rating">Lowest Rating</option>
            <option value="-helpful">Most Helpful</option>
          </select>

          {filterRating && (
            <button className="btn-clear-filter" onClick={() => setFilterRating('')}>
              Clear Filter ✕
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="review-form-container">
          <h3>Write Your Review</h3>
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="form-group">
              <label>Rating *</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${star <= formData.rating ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-text">({formData.rating} {formData.rating === 1 ? 'star' : 'stars'})</span>
              </div>
            </div>

            <div className="form-group">
              <label>Review Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={100}
                placeholder="Sum up your experience in one line"
              />
            </div>

            <div className="form-group">
              <label>Your Review *</label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                required
                maxLength={1000}
                rows={5}
                placeholder="Share your experience with this product..."
              />
              <small>{formData.comment.length}/1000 characters</small>
            </div>

            <div className="form-group">
              <label>Add Photos (Optional)</label>
              <div className="image-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  id="review-images"
                  style={{ display: 'none' }}
                />
                <label htmlFor="review-images" className="upload-label">
                  📷 Add Photos (Max 5)
                </label>
              </div>

              {previewImages.length > 0 && (
                <div className="image-previews">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button type="button" className="remove-image" onClick={() => removeImage(index)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowReviewForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="reviewer-name">
                      {review.userName}
                      {review.isVerifiedPurchase && (
                        <span className="verified-badge" title="Verified Purchase">✓</span>
                      )}
                    </h4>
                    <p className="review-date">{new Date(review.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </div>
                {renderStars(review.rating, 'small')}
              </div>

              <h3 className="review-title">{review.title}</h3>
              <p className="review-comment">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000${image}`}
                      alt={`Review ${index + 1}`}
                      className="review-image"
                    />
                  ))}
                </div>
              )}

              <div className="review-footer">
                <button
                  className="btn-helpful"
                  onClick={() => handleHelpful(review._id)}
                >
                  👍 Helpful ({review.helpful})
                </button>
              </div>

              {review.adminResponse && (
                <div className="admin-response">
                  <strong>Response from Seller:</strong>
                  <p>{review.adminResponse.text}</p>
                  <small>{new Date(review.adminResponse.respondedAt).toLocaleDateString()}</small>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
