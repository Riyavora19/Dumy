import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import './MyBudgetPlans.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function MyBudgetPlans() {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchMyPlans();
  }, []);

  const fetchMyPlans = async () => {
    try {
      setLoading(true);
      
      // Get plan IDs from localStorage
      const savedPlanIds = JSON.parse(localStorage.getItem('myBudgetPlans') || '[]');
      
      if (savedPlanIds.length === 0) {
        setPlans([]);
        setLoading(false);
        return;
      }

      // Fetch all plans
      const response = await fetch(`${API_URL}/budget-plans`);
      const allPlans = await response.json();
      
      // Filter to only show user's plans
      const myPlans = allPlans.filter(plan => savedPlanIds.includes(plan._id));
      setPlans(myPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
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

  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this budget plan?')) return;

    try {
      const response = await fetch(`${API_URL}/budget-plans/${planId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete plan');
      }

      // Remove from localStorage
      const savedPlanIds = JSON.parse(localStorage.getItem('myBudgetPlans') || '[]');
      const updatedIds = savedPlanIds.filter(id => id !== planId);
      localStorage.setItem('myBudgetPlans', JSON.stringify(updatedIds));

      showNotification('Budget plan deleted successfully!', 'success');
      fetchMyPlans();
      if (selectedPlan && selectedPlan._id === planId) {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      showNotification('Failed to delete plan. Please try again.', 'error');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#95a5a6';
      case 'finalized': return '#3498db';
      case 'inquiry_sent': return '#f39c12';
      case 'completed': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <main className="my-budget-plans-page">
        <div className="loading">Loading your budget plans...</div>
      </main>
    );
  }

  return (
    <main className="my-budget-plans-page">
      <div className="my-plans-container">
        <header className="plans-header">
          <div>
            <h1>💰 My Budget Plans</h1>
            <p>View and manage your saved room budget plans</p>
          </div>
          <button className="btn-create-new" onClick={() => navigate('/budget-planner')}>
            + Create New Plan
          </button>
        </header>

        {plans.length === 0 ? (
          <div className="no-plans">
            <div className="no-plans-icon">📋</div>
            <h2>No Budget Plans Yet</h2>
            <p>Start planning your dream room within your budget!</p>
            <button className="btn-primary" onClick={() => navigate('/budget-planner')}>
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map(plan => (
              <div key={plan._id} className="plan-card">
                <div className="plan-card-header">
                  <div className="plan-title">
                    <span className="plan-icon">{plan.roomTemplate?.icon || '🏠'}</span>
                    <h3>{plan.roomName}</h3>
                  </div>
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
                    <span className={`value ${plan.remainingBudget < 0 ? 'over-budget' : 'under-budget'}`}>
                      ₹{plan.remainingBudget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Items:</span>
                    <span className="value">{plan.selectedProducts.length} products</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Created:</span>
                    <span className="value">{formatDate(plan.createdAt)}</span>
                  </div>
                </div>

                <div className="plan-actions">
                  <button 
                    className="btn-view"
                    onClick={() => handleViewDetails(plan)}
                  >
                    View Details
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeletePlan(plan._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedPlan && (
          <div className="plan-details-modal" onClick={handleCloseDetails}>
            <div className="plan-details-container" onClick={(e) => e.stopPropagation()}>
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
                      <span 
                        className="status-badge-large"
                        style={{ background: getStatusColor(selectedPlan.status) }}
                      >
                        {selectedPlan.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

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
                    className="btn-secondary"
                    onClick={() => {
                      handleCloseDetails();
                      navigate('/budget-planner');
                    }}
                  >
                    Create Similar Plan
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => {
                      handleCloseDetails();
                      handleDeletePlan(selectedPlan._id);
                    }}
                  >
                    Delete Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default MyBudgetPlans;
