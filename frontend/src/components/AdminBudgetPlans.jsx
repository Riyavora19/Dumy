import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import AdminBudgetPlanForm from './AdminBudgetPlanForm';
import AdminOrderForm from './AdminOrderForm';
import QuotationPDFGenerator from './QuotationPDFGenerator';
import './AdminBudgetPlans.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminBudgetPlans() {
  const { showNotification } = useNotification();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBudgetPlanForm, setShowBudgetPlanForm] = useState(false);
  const [showConvertToOrderModal, setShowConvertToOrderModal] = useState(false);
  const [planToConvert, setPlanToConvert] = useState(null);

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
      showNotification('Failed to fetch budget plans', 'error');
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

      showNotification('Status updated successfully!', 'success');
      fetchPlans();
      if (selectedPlan && selectedPlan._id === planId) {
        const updatedPlan = await response.json();
        setSelectedPlan(updatedPlan);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Failed to update status', 'error');
    }
  };

  const handleDelete = async (planId) => {
    try {
      const response = await fetch(`${API_URL}/budget-plans/${planId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete plan');
      }

      showNotification('Budget plan deleted successfully!', 'success');
      fetchPlans();
      if (selectedPlan && selectedPlan._id === planId) {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      showNotification('Failed to delete plan', 'error');
    }
  };

  const handleConvertToOrder = async (plan) => {
    console.log('Converting plan to order:', plan);
    
    // Check if plan has required data
    if (!plan || !plan._id) {
      showNotification('Invalid plan data', 'error');
      return;
    }
    
    if (plan.status === 'completed') {
      showNotification('This plan has already been completed', 'info');
      return;
    }
    
    // Set the plan to convert and open the order form
    setPlanToConvert(plan);
    setShowConvertToOrderModal(true);
    // Close details modal if open
    setSelectedPlan(null);
  };

  const handleGenerateQuotation = async (plan, separateByRoom = false) => {
    try {
      showNotification('Generating quotation PDF...', 'info');
      
      // Prepare quotation data in the format expected by QuotationPDFGenerator
      const quotationData = {
        quotationNumber: `QT-${plan._id.slice(-8).toUpperCase()}`,
        quotationDate: new Date().toLocaleDateString('en-IN'),
        clientData: {
          name: plan.userName || 'Customer',
          email: plan.userEmail || '',
          phone: plan.userPhone || '',
          address: plan.customerAddress || ''
        },
        items: plan.selectedProducts.map(item => ({
          description: item.productName,
          variant: item.variant || '',
          company: item.companyName || '',
          quantity: item.quantity,
          rate: item.unitPrice,
          amount: item.totalPrice
        })),
        rooms: plan.rooms || [],
        total: plan.totalCost + (plan.totalCost * 18) / 100, // Including GST
        notes: plan.notes || ''
      };

      // Generate PDF
      await QuotationPDFGenerator(quotationData, { separateByRoom });
      showNotification(
        separateByRoom 
          ? `${plan.rooms?.length || 1} separate PDFs generated successfully!` 
          : 'Quotation PDF generated successfully!', 
        'success'
      );
    } catch (error) {
      console.error('Error generating quotation:', error);
      showNotification('Failed to generate quotation PDF', 'error');
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
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowBudgetPlanForm(true)}>
            + Create Budget Plan
          </button>
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
        <div className="plans-table-container">
          <table className="plans-table">
            <thead>
              <tr>
                <th>Room Name</th>
                <th>Budget</th>
                <th>Total Cost</th>
                <th>Remaining</th>
                <th>Items</th>
                <th>Customer</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan._id}>
                  <td>
                    <strong>{plan.roomTemplate?.icon} {plan.roomName}</strong>
                  </td>
                  <td>₹{plan.totalBudget.toLocaleString('en-IN')}</td>
                  <td>₹{plan.totalCost.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={plan.remainingBudget < 0 ? 'over-budget' : 'under-budget'}>
                      ₹{plan.remainingBudget.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>{plan.selectedProducts.length}</td>
                  <td>
                    {plan.userName ? (
                      <div className="customer-info">
                        <div>{plan.userName}</div>
                        {plan.userPhone && <small>{plan.userPhone}</small>}
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                  <td>
                    {plan.createdByName ? (
                      <span style={{ color: '#667eea', fontWeight: '600' }}>
                        👤 {plan.createdByName}
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>-</span>
                    )}
                  </td>
                  <td>{formatDate(plan.createdAt)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ background: getStatusColor(plan.status) }}
                    >
                      {plan.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => handleViewDetails(plan)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-quotation"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateQuotation(plan, false);
                        }}
                        title="Generate Combined Quotation PDF"
                      >
                        📄
                      </button>
                      {plan.rooms && plan.rooms.length > 1 && (
                        <button 
                          className="btn-quotation"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateQuotation(plan, true);
                          }}
                          title="Generate Separate PDFs for Each Room"
                        >
                          📑
                        </button>
                      )}
                      <button 
                        className="btn-convert"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Convert button clicked for plan:', plan._id);
                          handleConvertToOrder(plan);
                        }}
                        disabled={plan.status === 'completed'}
                        title={plan.status === 'completed' ? 'Plan already completed' : 'Convert to order'}
                      >
                        📦
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(plan._id);
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  onClick={() => handleConvertToOrder(selectedPlan)}
                  disabled={selectedPlan.status === 'completed'}
                >
                  {selectedPlan.status === 'completed' ? '✓ Already Completed' : '📦 Convert to Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBudgetPlanForm && (
        <AdminBudgetPlanForm
          onClose={() => setShowBudgetPlanForm(false)}
          onSuccess={() => {
            setShowBudgetPlanForm(false);
            fetchPlans();
          }}
        />
      )}

      {showConvertToOrderModal && planToConvert && (
        <AdminOrderForm
          budgetPlan={planToConvert}
          onClose={() => {
            setShowConvertToOrderModal(false);
            setPlanToConvert(null);
          }}
          onSuccess={() => {
            setShowConvertToOrderModal(false);
            setPlanToConvert(null);
            fetchPlans();
            showNotification('Order created successfully from budget plan!', 'success');
          }}
        />
      )}
    </div>
  );
}

export default AdminBudgetPlans;
