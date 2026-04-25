import { useState, useEffect } from 'react';
import './AdminBudgetPlans.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminBudgetPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPlans();
  }, [filterStatus]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'all' 
        ? `${API_URL}/budget-plans`
        : `${API_URL}/budget-plans?status=${filterStatus}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching budget plans:', error);
      alert('Failed to fetch budget plans');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
  };

  const handleCloseDetails = () => {
    setSelectedPlan(null);
  };

  const handleStatusChange = async (planId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/budget-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      alert('Status updated successfully!');
      fetchPlans();
      if (selectedPlan && selectedPlan._id === planId) {
        const updatedPlan = await response.json();
        setSelectedPlan(updatedPlan);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this budget plan?')) return;

    try {
      const response = await fetch(`${API_URL}/budget-plans/${planId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete plan');
      }

      alert('Budget plan deleted successfully!');
      fetchPlans();
      if (selectedPlan && selectedPlan._id === planId) {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    }
  };

  const handleConvertToLiveRequest = async (planId) => {
    if (!confirm('Convert this budget plan to a live request? This will create a new live request and update the plan status to "inquiry_sent".')) return;

    try {
      const response = await fetch(`${API_URL}/live-requests/from-budget-plan/${planId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to convert to live request');
      }

      const result = await response.json();
      
      alert(`Budget plan converted to live request successfully!\nRequest Number: ${result.data.requestNumber}`);
      fetchPlans(); // Refresh to show updated status
      if (selectedPlan && selectedPlan._id === planId) {
        const updatedPlan = plans.find(p => p._id === planId);
        if (updatedPlan) {
          setSelectedPlan({ ...updatedPlan, status: 'inquiry_sent' });
        }
      }
    } catch (error) {
      console.error('Error converting to live request:', error);
      alert(error.message || 'Failed to convert to live request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#95a5a6';
      case 'finalized': return '#3498db';
      case 'inquiry_sent': return '#f39c12';
      case 'completed': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="admin-section-loading">Loading budget plans...</div>;
  }

  return (
    <div className="admin-budget-plans">
      <div className="admin-section-header">
        <h2>💰 Budget Plans</h2>
        <div className="filter-controls">
          <label>Filter by Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Plans</option>
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
            <option value="inquiry_sent">Inquiry Sent</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="no-data">
          <p>No budget plans found.</p>
          {filterStatus !== 'all' && (
            <button 
              className="btn-secondary" 
              onClick={() => setFilterStatus('all')}
            >
              View All Plans
            </button>
          )}
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map(plan => (
            <div key={plan._id} className="plan-card">
              <div className="plan-card-header">
                <h3>{plan.roomTemplate?.icon} {plan.roomName}</h3>
                <span 
                  className="status-badge"
                  style={{ background: getStatusColor(plan.status) }}
                >
                  {plan.status.replace('_', ' ')}
                </span>
              </div>

              <div className="plan-info">
                <div className="info-row">
                  <span className="label">Budget:</span>
                  <span className="value">₹{plan.totalBudget.toLocaleString('en-IN')}</span>
                </div>
                <div className="info-row">
                  <span className="label">Total Cost:</span>
                  <span className="value">₹{plan.totalCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="info-row">
                  <span className="label">Remaining:</span>
                  <span className={`value ${plan.remainingBudget < 0 ? 'over-budget' : ''}`}>
                    ₹{plan.remainingBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Items:</span>
                  <span className="value">{plan.selectedProducts.length}</span>
                </div>
                <div className="info-row">
                  <span className="label">Created:</span>
                  <span className="value">{formatDate(plan.createdAt)}</span>
                </div>
              </div>

              {plan.userName && (
                <div className="user-info">
                  <strong>Contact:</strong>
                  <p>{plan.userName}</p>
                  {plan.userEmail && <p>{plan.userEmail}</p>}
                  {plan.userPhone && <p>{plan.userPhone}</p>}
                </div>
              )}

              <div className="plan-actions">
                <button 
                  className="btn-view"
                  onClick={() => handleViewDetails(plan)}
                >
                  View Details
                </button>
                <button 
                  className="btn-convert"
                  onClick={() => handleConvertToLiveRequest(plan._id)}
                  disabled={plan.status === 'inquiry_sent' || plan.status === 'completed'}
                  title={plan.status === 'inquiry_sent' ? 'Already converted to live request' : 'Convert to live request'}
                >
                  {plan.status === 'inquiry_sent' ? '✓ Converted' : '🔄 Convert'}
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(plan._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPlan && (
        <div className="plan-details-modal">
          <div className="plan-details-container">
            <div className="details-header">
              <h2>{selectedPlan.roomTemplate?.icon} {selectedPlan.roomName} - Budget Plan</h2>
              <button className="btn-close" onClick={handleCloseDetails}>×</button>
            </div>

            <div className="details-content">
              <div className="details-section">
                <h3>Budget Summary</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Total Budget</span>
                    <span className="value">₹{selectedPlan.totalBudget.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Cost</span>
                    <span className="value">₹{selectedPlan.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Remaining</span>
                    <span className={`value ${selectedPlan.remainingBudget < 0 ? 'over-budget' : 'under-budget'}`}>
                      ₹{selectedPlan.remainingBudget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Status</span>
                    <span className="value">
                      <select
                        value={selectedPlan.status}
                        onChange={(e) => handleStatusChange(selectedPlan._id, e.target.value)}
                        className="status-select"
                        style={{ background: getStatusColor(selectedPlan.status) }}
                      >
                        <option value="draft">Draft</option>
                        <option value="finalized">Finalized</option>
                        <option value="inquiry_sent">Inquiry Sent</option>
                        <option value="completed">Completed</option>
                      </select>
                    </span>
                  </div>
                </div>
              </div>

              {(selectedPlan.userName || selectedPlan.userEmail || selectedPlan.userPhone) && (
                <div className="details-section">
                  <h3>Contact Information</h3>
                  <div className="contact-info">
                    {selectedPlan.userName && <p><strong>Name:</strong> {selectedPlan.userName}</p>}
                    {selectedPlan.userEmail && <p><strong>Email:</strong> {selectedPlan.userEmail}</p>}
                    {selectedPlan.userPhone && <p><strong>Phone:</strong> {selectedPlan.userPhone}</p>}
                  </div>
                </div>
              )}

              <div className="details-section">
                <h3>Selected Products ({selectedPlan.selectedProducts.length})</h3>
                <div className="products-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Item Type</th>
                        <th>Product</th>
                        <th>Company</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPlan.selectedProducts.map((item, index) => (
                        <tr key={index}>
                          <td>{item.itemName}</td>
                          <td>{item.productName}</td>
                          <td>{item.companyName || 'N/A'}</td>
                          <td>{item.quantity}</td>
                          <td>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td>₹{item.totalPrice.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                        <td style={{ fontWeight: 'bold' }}>₹{selectedPlan.totalCost.toLocaleString('en-IN')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedPlan.notes && (
                <div className="details-section">
                  <h3>Notes</h3>
                  <p className="notes-text">{selectedPlan.notes}</p>
                </div>
              )}

              <div className="details-section">
                <h3>Timeline</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <strong>Created:</strong> {formatDate(selectedPlan.createdAt)}
                  </div>
                  <div className="timeline-item">
                    <strong>Last Updated:</strong> {formatDate(selectedPlan.updatedAt)}
                  </div>
                </div>
              </div>

              <div className="details-actions">
                <button 
                  className="btn-convert-modal"
                  onClick={() => handleConvertToLiveRequest(selectedPlan._id)}
                  disabled={selectedPlan.status === 'inquiry_sent' || selectedPlan.status === 'completed'}
                >
                  {selectedPlan.status === 'inquiry_sent' ? '✓ Already Converted to Live Request' : '🔄 Convert to Live Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBudgetPlans;
