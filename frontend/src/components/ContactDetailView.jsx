import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ContactDetailView.css';

const ContactDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchContactDetails();
      fetchOrders();
      fetchStats();
    }
  }, [id]);

  const fetchContactDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/contacts/${id}`);
      const data = await response.json();
      setContact(data.contact);
      setRelationships(data.relationships || []);
    } catch (error) {
      console.error('Error fetching contact details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/customer/${id}`);
      const data = await response.json();
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/contacts/${id}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getRelationshipDisplay = (relationship) => {
    const isContactA = relationship.contactA._id === id;
    const otherContact = isContactA ? relationship.contactB : relationship.contactA;
    const relationshipType = isContactA ? relationship.relationshipTypeAtoB : relationship.relationshipTypeBtoA;
    
    return {
      contact: otherContact,
      type: relationshipType,
      isPrimary: relationship.isPrimaryReferral,
      isReferral: relationship.isReferralRelationship
    };
  };

  if (loading) {
    return <div className="loading">Loading contact details...</div>;
  }

  if (!contact) {
    return <div className="error">Contact not found</div>;
  }

  return (
    <div className="contact-detail-view">
      <div className="detail-header">
        <button onClick={() => navigate('/admin/contacts')} className="btn-back">
          ← Back to Contacts
        </button>
        <h2>{contact.name}</h2>
      </div>

      <div className="contact-summary-cards">
        <div className="summary-card">
          <div className="card-icon">👤</div>
          <div className="card-content">
            <div className="card-value">{contact.contactType}</div>
            <div className="card-label">Contact Type</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">🔗</div>
          <div className="card-content">
            <div className="card-value">{stats?.relationshipCount || 0}</div>
            <div className="card-label">Relationships</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <div className="card-value">{contact.totalOrders || 0}</div>
            <div className="card-label">Total Orders</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-value">₹{(contact.totalRevenue || 0).toLocaleString()}</div>
            <div className="card-label">Total Revenue</div>
          </div>
        </div>

        {contact.isReferrer && (
          <>
            <div className="summary-card highlight">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <div className="card-value">{contact.totalReferrals || 0}</div>
                <div className="card-label">Referrals Made</div>
              </div>
            </div>

            <div className="summary-card highlight">
              <div className="card-icon">💵</div>
              <div className="card-content">
                <div className="card-value">₹{(contact.totalCommissionEarned || 0).toLocaleString()}</div>
                <div className="card-label">Commission Earned</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="detail-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'relationships' ? 'active' : ''}`}
          onClick={() => setActiveTab('relationships')}
        >
          Relationships ({relationships.length})
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders ({orders.length})
        </button>
        {contact.isReferrer && (
          <button 
            className={`tab ${activeTab === 'referrals' ? 'active' : ''}`}
            onClick={() => setActiveTab('referrals')}
          >
            Referrals
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="info-grid">
              <div className="info-section">
                <h3>Contact Information</h3>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{contact.email || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{contact.phone || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Company:</span>
                  <span className="info-value">{contact.companyName || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Designation:</span>
                  <span className="info-value">{contact.designation || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge status-${contact.status}`}>
                    {contact.status}
                  </span>
                </div>
              </div>

              <div className="info-section">
                <h3>Address</h3>
                {contact.address?.street ? (
                  <>
                    <p>{contact.address.street}</p>
                    <p>{contact.address.city}, {contact.address.state}</p>
                    <p>{contact.address.pincode}</p>
                    <p>{contact.address.country}</p>
                  </>
                ) : (
                  <p className="no-data">No address provided</p>
                )}
              </div>

              {contact.isReferrer && (
                <div className="info-section highlight-section">
                  <h3>Referrer Details</h3>
                  <div className="info-item">
                    <span className="info-label">Referral Code:</span>
                    <span className="info-value referral-code">{contact.referralCode}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Commission Rate:</span>
                    <span className="info-value">{contact.commissionRate}%</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Commission Type:</span>
                    <span className="info-value">{contact.commissionType}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Earned:</span>
                    <span className="info-value">₹{(contact.totalCommissionEarned || 0).toLocaleString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Paid:</span>
                    <span className="info-value">₹{(contact.totalCommissionPaid || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {contact.notes && (
                <div className="info-section full-width">
                  <h3>Notes</h3>
                  <p>{contact.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'relationships' && (
          <div className="relationships-tab">
            <div className="relationships-grid">
              {relationships.length === 0 ? (
                <p className="no-data">No relationships found</p>
              ) : (
                relationships.map((rel) => {
                  const display = getRelationshipDisplay(rel);
                  return (
                    <div key={rel._id} className="relationship-card">
                      <div className="relationship-header">
                        <h4>{display.contact.name}</h4>
                        {display.isPrimary && (
                          <span className="primary-badge">Primary</span>
                        )}
                      </div>
                      <div className="relationship-body">
                        <div className="relationship-type">
                          <span className="type-badge">{display.type}</span>
                          {display.isReferral && (
                            <span className="referral-badge">Referral</span>
                          )}
                        </div>
                        {rel.context && (
                          <p className="relationship-context">{rel.context}</p>
                        )}
                        {rel.howTheyMet && (
                          <p className="relationship-met">
                            <em>How they met: {rel.howTheyMet}</em>
                          </p>
                        )}
                        <div className="relationship-meta">
                          <span>Since: {new Date(rel.createdAt).toLocaleDateString()}</span>
                          <span className={`strength-${rel.strength}`}>
                            {rel.strength} connection
                          </span>
                        </div>
                      </div>
                      <div className="relationship-footer">
                        <button 
                          onClick={() => navigate(`/admin/contacts/${display.contact._id}`)}
                          className="btn-view-contact"
                        >
                          View Contact
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-tab">
            {orders.length === 0 ? (
              <p className="no-data">No orders found</p>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Products</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td><strong>{order.orderNumber}</strong></td>
                      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td>{order.products?.length || 0} items</td>
                      <td><strong>₹{order.total?.toLocaleString()}</strong></td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${order.paymentStatus}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'referrals' && contact.isReferrer && (
          <div className="referrals-tab">
            <div className="referrals-list">
              {relationships
                .filter(rel => rel.isReferralRelationship && rel.referrer?._id === id)
                .map(rel => {
                  const referred = rel.referred;
                  return (
                    <div key={rel._id} className="referral-item">
                      <div className="referral-info">
                        <h4>{referred.name}</h4>
                        <p>{referred.email || referred.phone}</p>
                        <span className="referral-date">
                          Referred on {new Date(rel.referralDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="referral-stats">
                        <div className="stat">
                          <span className="stat-value">{referred.totalOrders || 0}</span>
                          <span className="stat-label">Orders</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">₹{(referred.totalRevenue || 0).toLocaleString()}</span>
                          <span className="stat-label">Revenue</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/admin/contacts/${referred._id}`)}
                        className="btn-view-contact"
                      >
                        View
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactDetailView;
