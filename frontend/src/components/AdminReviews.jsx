import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import './AdminReviews.css';

const AdminReviews = () => {
  const { showNotification } = useNotification();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [filterStatus, filterRating]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterRating) params.rating = filterRating;

      const response = await axios.get('http://localhost:5000/api/reviews/admin/all', { params });
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showNotification('Failed to fetch reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/reviews/${reviewId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        showNotification('Review status updated', 'success');
        fetchReviews();
      }
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`);
      if (response.data.success) {
        showNotification('Review deleted successfully', 'success');
        fetchReviews();
      }
    } catch (error) {
      showNotification('Failed to delete review', 'error');
    }
  };

  const handleAddResponse = async () => {
    if (!responseText.trim()) {
      showNotification('Please enter a response', 'warning');
      return;
    }

    try {
      const adminInfo = localStorage.getItem('adminInfo');
      const admin = adminInfo ? JSON.parse(adminInfo) : null;

      const response = await axios.post(`http://localhost:5000/api/reviews/${selectedReview._id}/response`, {
        text: responseText,
        adminId: admin?.id
      });

      if (response.data.success) {
        showNotification('Response added successfully', 'success');
        setShowResponseModal(false);
        setResponseText('');
        setSelectedReview(null);
        fetchReviews();
      }
    } catch (error) {
      showNotification('Failed to add response', 'error');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="admin-reviews__stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={star <= rating ? 'filled' : 'empty'}>★</span>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: '#f6ad55', text: 'Pending' },
      approved: { color: '#48bb78', text: 'Approved' },
      rejected: { color: '#f56565', text: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className="admin-reviews__badge" style={{ background: badge.color }}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="admin-reviews">
      <header className="admin-reviews__header">
        <div>
          <h1>Product Reviews</h1>
          <p className="admin-reviews__subtitle">{reviews.length} total reviews</p>
        </div>
      </header>

      {/* Filters */}
      <div className="admin-reviews__filters">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-reviews__loading">Loading reviews...</div>
      ) : (
        <div className="admin-reviews__grid">
          {reviews.map(review => (
            <div key={review._id} className="admin-reviews__card">
              <div className="admin-reviews__card-header">
                <div className="admin-reviews__product">
                  {review.product?.images?.[0] && (
                    <img 
                      src={`http://localhost:5000${review.product.images[0]}`} 
                      alt={review.product.name}
                    />
                  )}
                  <div>
                    <h3>{review.product?.name}</h3>
                    {renderStars(review.rating)}
                  </div>
                </div>
                {getStatusBadge(review.status)}
              </div>

              <div className="admin-reviews__card-body">
                <div className="admin-reviews__reviewer">
                  <strong>{review.userName}</strong>
                  {review.isVerifiedPurchase && <span className="verified">✓ Verified</span>}
                  <span className="date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>

                <h4>{review.title}</h4>
                <p>{review.comment}</p>

                {review.images && review.images.length > 0 && (
                  <div className="admin-reviews__images">
                    {review.images.map((img, index) => (
                      <img key={index} src={`http://localhost:5000${img}`} alt="" />
                    ))}
                  </div>
                )}

                <div className="admin-reviews__stats">
                  <span>👍 {review.helpful} helpful</span>
                </div>

                {review.adminResponse && (
                  <div className="admin-reviews__response">
                    <strong>Your Response:</strong>
                    <p>{review.adminResponse.text}</p>
                  </div>
                )}
              </div>

              <div className="admin-reviews__card-actions">
                {review.status === 'pending' && (
                  <>
                    <button 
                      className="btn-approve"
                      onClick={() => handleStatusChange(review._id, 'approved')}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleStatusChange(review._id, 'rejected')}
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                {review.status === 'approved' && (
                  <button 
                    className="btn-reject"
                    onClick={() => handleStatusChange(review._id, 'rejected')}
                  >
                    ✗ Reject
                  </button>
                )}
                {review.status === 'rejected' && (
                  <button 
                    className="btn-approve"
                    onClick={() => handleStatusChange(review._id, 'approved')}
                  >
                    ✓ Approve
                  </button>
                )}
                <button 
                  className="btn-respond"
                  onClick={() => {
                    setSelectedReview(review);
                    setResponseText(review.adminResponse?.text || '');
                    setShowResponseModal(true);
                  }}
                >
                  💬 Respond
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(review._id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="admin-reviews__modal-overlay" onClick={() => setShowResponseModal(false)}>
          <div className="admin-reviews__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-reviews__modal-header">
              <h2>Respond to Review</h2>
              <button onClick={() => setShowResponseModal(false)}>×</button>
            </div>

            <div className="admin-reviews__modal-content">
              <div className="review-preview">
                <strong>{selectedReview.userName}</strong>
                {renderStars(selectedReview.rating)}
                <h4>{selectedReview.title}</h4>
                <p>{selectedReview.comment}</p>
              </div>

              <div className="form-group">
                <label>Your Response</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={5}
                  placeholder="Write your response to the customer..."
                />
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowResponseModal(false)}>
                  Cancel
                </button>
                <button className="btn-submit" onClick={handleAddResponse}>
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
