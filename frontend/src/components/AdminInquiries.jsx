import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import './AdminInquiries.css';

const AdminInquiries = () => {
  const { showNotification } = useNotification();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await axios.get('https://dumy-2-mli2.onrender.com/api/inquiries');
      if (response.data.success) {
        setInquiries(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await axios.patch(`https://dumy-2-mli2.onrender.com/api/inquiries/${id}/status`, { status });
      if (response.data.success) {
        fetchInquiries();
        if (selectedInquiry?._id === id) {
          setSelectedInquiry(response.data.data);
        }
        showNotification('Status updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Failed to update status', 'error');
    }
  };

  const deleteInquiry = async (id) => {
    try {
      const response = await axios.delete(`https://dumy-2-mli2.onrender.com/api/inquiries/${id}`);
      if (response.data.success) {
        fetchInquiries();
        if (selectedInquiry?._id === id) {
          setShowDetailModal(false);
          setSelectedInquiry(null);
        }
        showNotification('Inquiry deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      showNotification('Failed to delete inquiry', 'error');
    }
  };

  const convertToLiveRequest = async (id) => {
    try {
      const response = await axios.post(`https://dumy-2-mli2.onrender.com/api/inquiries/${id}/convert-to-live-request`);
      if (response.data.success) {
        showNotification(`✅ Inquiry converted to live request successfully!\n\nRequest Number: ${response.data.data.requestNumber}\n\nYou can now view and manage this request in the Live Requests section.`, 'success', 5000);
        fetchInquiries();
        setShowDetailModal(false);
        setSelectedInquiry(null);
      }
    } catch (error) {
      console.error('Error converting inquiry:', error);
      showNotification(error.response?.data?.message || 'Failed to convert inquiry to live request', 'error');
    }
  };

  const openDetailModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedInquiry(null);
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (filter === 'all') return true;
    return inq.status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      new: { label: 'New', class: 'new' },
      read: { label: 'Read', class: 'read' },
      replied: { label: 'Replied', class: 'replied' },
      closed: { label: 'Closed', class: 'closed' }
    };
    return badges[status] || badges.new;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-inquiries">
      <header className="admin-inquiries__header">
        <div>
          <h1>Inquiries</h1>
          <p className="admin-inquiries__subtitle">
            {inquiries.length} total · {inquiries.filter(i => i.status === 'new').length} new
          </p>
        </div>
        <button className="admin-inquiries__refresh-btn" onClick={fetchInquiries}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </header>

      <div className="admin-inquiries__filters">
        <button 
          className={`admin-inquiries__filter ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({inquiries.length})
        </button>
        <button 
          className={`admin-inquiries__filter ${filter === 'new' ? 'active' : ''}`}
          onClick={() => setFilter('new')}
        >
          New ({inquiries.filter(i => i.status === 'new').length})
        </button>
        <button 
          className={`admin-inquiries__filter ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({inquiries.filter(i => i.status === 'read').length})
        </button>
        <button 
          className={`admin-inquiries__filter ${filter === 'replied' ? 'active' : ''}`}
          onClick={() => setFilter('replied')}
        >
          Replied ({inquiries.filter(i => i.status === 'replied').length})
        </button>
        <button 
          className={`admin-inquiries__filter ${filter === 'closed' ? 'active' : ''}`}
          onClick={() => setFilter('closed')}
        >
          Closed ({inquiries.filter(i => i.status === 'closed').length})
        </button>
      </div>

      {loading ? (
        <div className="admin-inquiries__loading">Loading inquiries...</div>
      ) : filteredInquiries.length === 0 ? (
        <div className="admin-inquiries__empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <h2>No Inquiries Found</h2>
          <p>Inquiries will appear here when customers contact you.</p>
        </div>
      ) : (
        <div className="admin-inquiries__table-container">
          <table className="admin-inquiries__table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map(inquiry => {
                const badge = getStatusBadge(inquiry.status);
                return (
                  <tr key={inquiry._id}>
                    <td>
                      <div className="admin-inquiries__date-cell">
                        {formatDate(inquiry.createdAt)}
                      </div>
                    </td>
                    <td>
                      <strong>{inquiry.name}</strong>
                    </td>
                    <td>
                      <a href={`mailto:${inquiry.email}`} className="admin-inquiries__email-link">
                        {inquiry.email}
                      </a>
                    </td>
                    <td>
                      {inquiry.phone ? (
                        <a href={`tel:${inquiry.phone}`} className="admin-inquiries__phone-link">
                          {inquiry.phone}
                        </a>
                      ) : (
                        <span className="admin-inquiries__no-data">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-inquiries__badge ${badge.class}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <div className="admin-inquiries__actions">
                        <button 
                          onClick={() => openDetailModal(inquiry)}
                          title="View Details"
                          className="admin-inquiries__action-btn view"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => deleteInquiry(inquiry._id)}
                          title="Delete"
                          className="admin-inquiries__action-btn delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInquiry && (
        <div className="admin-inquiries__modal-overlay" onClick={closeDetailModal}>
          <div className="admin-inquiries__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-inquiries__modal-header">
              <h2>Inquiry Details</h2>
              <button onClick={closeDetailModal}>×</button>
            </div>

            <div className="admin-inquiries__modal-content">
              <div className="admin-inquiries__detail-section">
                <h3>Contact Information</h3>
                <div className="admin-inquiries__detail-grid">
                  <div className="admin-inquiries__detail-item">
                    <label>Name:</label>
                    <span>{selectedInquiry.name}</span>
                  </div>
                  <div className="admin-inquiries__detail-item">
                    <label>Email:</label>
                    <a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="admin-inquiries__detail-item">
                      <label>Phone:</label>
                      <a href={`tel:${selectedInquiry.phone}`}>{selectedInquiry.phone}</a>
                    </div>
                  )}
                  <div className="admin-inquiries__detail-item">
                    <label>Date:</label>
                    <span>{formatDate(selectedInquiry.createdAt)}</span>
                  </div>
                </div>
              </div>

              {selectedInquiry.products && selectedInquiry.products.length > 0 && (
                <div className="admin-inquiries__detail-section">
                  <h3>Requested Products ({selectedInquiry.products.length})</h3>
                  <div className="admin-inquiries__products-list">
                    {selectedInquiry.products.map((product, index) => (
                      <div key={index} className="admin-inquiries__product-item">
                        <div className="admin-inquiries__product-image">
                          <img 
                            src={`https://dumy-2-mli2.onrender.com${product.image}`} 
                            alt={product.name}
                          />
                        </div>
                        <div className="admin-inquiries__product-details">
                          <h4>{product.name}</h4>
                          {(product.company || product.companyName) && (
                            <p className="admin-inquiries__product-company">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                              </svg>
                              {typeof product.company === 'object' && product.company?.name 
                                ? product.company.name 
                                : product.companyName || product.company}
                            </p>
                          )}
                          {product.sku && (
                            <p className="admin-inquiries__product-sku">SKU: {product.sku}</p>
                          )}
                          <div className="admin-inquiries__product-footer">
                            <span className="admin-inquiries__product-qty">Quantity: {product.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="admin-inquiries__detail-section">
                <h3>Update Status</h3>
                <div className="admin-inquiries__status-buttons">
                  <button 
                    className={`admin-inquiries__status-btn ${selectedInquiry.status === 'new' ? 'active' : ''}`}
                    onClick={() => updateStatus(selectedInquiry._id, 'new')}
                  >
                    New
                  </button>
                  <button 
                    className={`admin-inquiries__status-btn ${selectedInquiry.status === 'read' ? 'active' : ''}`}
                    onClick={() => updateStatus(selectedInquiry._id, 'read')}
                  >
                    Read
                  </button>
                  <button 
                    className={`admin-inquiries__status-btn ${selectedInquiry.status === 'replied' ? 'active' : ''}`}
                    onClick={() => updateStatus(selectedInquiry._id, 'replied')}
                  >
                    Replied
                  </button>
                  <button 
                    className={`admin-inquiries__status-btn ${selectedInquiry.status === 'closed' ? 'active' : ''}`}
                    onClick={() => updateStatus(selectedInquiry._id, 'closed')}
                  >
                    Closed
                  </button>
                </div>
              </div>

              <div className="admin-inquiries__detail-section">
                <h3>Message</h3>
                <p className="admin-inquiries__message-text">{selectedInquiry.message}</p>
              </div>
            </div>

            <div className="admin-inquiries__modal-footer">
              <button 
                className="admin-inquiries__btn-convert"
                onClick={() => convertToLiveRequest(selectedInquiry._id)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13"/>
                  <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
                Convert to Live Request
              </button>
              <button 
                className="admin-inquiries__btn-delete"
                onClick={() => deleteInquiry(selectedInquiry._id)}
              >
                Delete Inquiry
              </button>
              <button 
                className="admin-inquiries__btn-close"
                onClick={closeDetailModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
