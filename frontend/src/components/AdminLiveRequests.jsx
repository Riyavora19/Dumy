import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import './AdminLiveRequests.css';

const AdminLiveRequests = () => {
  const { showNotification } = useNotification();
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showQuotationForm, setShowQuotationForm] = useState(false); // New state to toggle quotation form
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [quoteData, setQuoteData] = useState({
    quotedAmount: '',
    validUntil: '',
    notes: '',
    paymentTerms: '',
    deliveryTimeline: '',
    warranty: '',
    items: [
      { description: '', quantity: 1, unitPrice: '', total: 0 }
    ],
    taxPercentage: 18,
    taxAmount: 0,
    subtotal: 0,
    grandTotal: 0
  });
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    requestType: 'quote',
    category: '',
    title: '',
    description: '',
    budget: { min: '', max: '' },
    location: { address: '', city: '', state: '', pincode: '' },
    preferredDate: '',
    urgency: 'medium',
    status: 'new',
    priority: 'medium',
    assignedTo: '',
    estimatedCost: '',
    tags: '',
    source: 'website'
  });

  useEffect(() => {
    fetchRequests();
    fetchCategories();
  }, [filterStatus, filterType, filterUrgency]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.requestType = filterType;
      if (filterUrgency) params.urgency = filterUrgency;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get('/api/live-requests', { params });
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = () => {
    fetchRequests();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('budget.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        budget: { ...formData.budget, [field]: value }
      });
    } else if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        location: { ...formData.location, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
      categoryName: categories.find(c => c._id === formData.category)?.name || ''
    };

    try {
      if (editingRequest) {
        const response = await axios.put(
          `/api/live-requests/${editingRequest._id}`,
          requestData
        );
        if (response.data.success) {
          showNotification('Request updated successfully!', 'success');
        }
      } else {
        const response = await axios.post('/api/live-requests', requestData);
        if (response.data.success) {
          showNotification('Request created successfully!', 'success');
        }
      }
      
      fetchRequests();
      closeModal();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save request', 'error');
    }
  };

  const handleView = (request) => {
    setViewingRequest(request);
    setShowQuotationForm(false); // Start with quotation form hidden
    
    // Prepare quotation data from request
    let items = [{ description: '', quantity: 1, unitPrice: '', total: 0 }];
    let estimatedTotal = request.estimatedCost || 0;
    
    // Try to parse budget plan items from description
    if (request.description && request.description.includes('Selected Products:')) {
      const lines = request.description.split('\n');
      const productStartIndex = lines.findIndex(line => line.includes('Selected Products:'));
      
      if (productStartIndex !== -1) {
        items = [];
        // Parse each product line
        for (let i = productStartIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line || line.startsWith('Additional Notes:')) break;
          
          // Parse format: "Item Name: Product Name (Company) - Qty: X"
          const match = line.match(/^(.+?):\s*(.+?)\s*\((.+?)\)\s*-\s*Qty:\s*(\d+)/);
          if (match) {
            const [, itemType, productName, company, qty] = match;
            const description = `${productName} (${company}) - ${itemType}`;
            const quantity = parseInt(qty);
            
            items.push({
              description,
              quantity,
              unitPrice: '', // Will be filled manually or calculated
              total: 0
            });
          }
        }
      }
    }
    
    // If no items were parsed, add one empty item
    if (items.length === 0) {
      items = [{ description: '', quantity: 1, unitPrice: '', total: 0 }];
    }
    
    // Calculate unit prices if we have estimated cost
    if (items.length > 0 && estimatedTotal > 0) {
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const avgUnitPrice = estimatedTotal / totalQuantity;
      
      items = items.map(item => ({
        ...item,
        unitPrice: avgUnitPrice.toFixed(2),
        total: item.quantity * avgUnitPrice
      }));
    }
    
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxAmount = (subtotal * 18) / 100;
    const grandTotal = subtotal + taxAmount;
    
    setQuoteData({
      quotedAmount: grandTotal.toFixed(2),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      paymentTerms: '50% advance, 50% on completion',
      deliveryTimeline: '2-3 weeks',
      warranty: '1 year manufacturer warranty',
      items: items,
      taxPercentage: 18,
      taxAmount: taxAmount,
      subtotal: subtotal,
      grandTotal: grandTotal
    });
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setFormData({
      clientName: request.clientName,
      clientEmail: request.clientEmail,
      clientPhone: request.clientPhone,
      requestType: request.requestType,
      category: request.category?._id || '',
      title: request.title,
      description: request.description,
      budget: request.budget || { min: '', max: '' },
      location: request.location || { address: '', city: '', state: '', pincode: '' },
      preferredDate: request.preferredDate ? new Date(request.preferredDate).toISOString().split('T')[0] : '',
      urgency: request.urgency,
      status: request.status,
      priority: request.priority,
      assignedTo: request.assignedTo || '',
      estimatedCost: request.estimatedCost || '',
      tags: request.tags ? request.tags.join(', ') : '',
      source: request.source
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/live-requests/${id}`);
      if (response.data.success) {
        showNotification('Request deleted successfully!', 'success');
        fetchRequests();
      }
    } catch (error) {
      showNotification('Failed to delete request', 'error');
    }
  };

  const openModal = () => {
    setEditingRequest(null);
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      requestType: 'quote',
      category: '',
      title: '',
      description: '',
      budget: { min: '', max: '' },
      location: { address: '', city: '', state: '', pincode: '' },
      preferredDate: '',
      urgency: 'medium',
      status: 'new',
      priority: 'medium',
      assignedTo: '',
      estimatedCost: '',
      tags: '',
      source: 'website'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRequest(null);
    setViewingRequest(null);
    setShowQuotationForm(false);
  };

  const handleAddItem = () => {
    setQuoteData({
      ...quoteData,
      items: [...quoteData.items, { description: '', quantity: 1, unitPrice: '', total: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = quoteData.items.filter((_, i) => i !== index);
    setQuoteData({ ...quoteData, items: newItems });
    calculateTotals(newItems, quoteData.taxPercentage);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...quoteData.items];
    newItems[index][field] = value;
    
    // Calculate item total
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].total = quantity * unitPrice;
    }
    
    setQuoteData({ ...quoteData, items: newItems });
    calculateTotals(newItems, quoteData.taxPercentage);
  };

  const calculateTotals = (items, taxPercentage) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxAmount = (subtotal * taxPercentage) / 100;
    const grandTotal = subtotal + taxAmount;
    
    setQuoteData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      grandTotal,
      quotedAmount: grandTotal.toFixed(2)
    }));
  };

  const handleTaxChange = (value) => {
    const taxPercentage = parseFloat(value) || 0;
    setQuoteData({ ...quoteData, taxPercentage });
    calculateTotals(quoteData.items, taxPercentage);
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one item has description and price
    const validItems = quoteData.items.filter(item => item.description && item.unitPrice);
    if (validItems.length === 0) {
      showNotification('Please add at least one item with description and price', 'error');
      return;
    }
    
    try {
      // Prepare quote details for notes
      const itemsList = validItems.map(item => 
        `${item.description} - Qty: ${item.quantity} × ₹${parseFloat(item.unitPrice).toLocaleString('en-IN')} = ₹${item.total.toLocaleString('en-IN')}`
      ).join('\n');
      
      const quoteNote = `
QUOTATION SENT
================
Subtotal: ₹${quoteData.subtotal.toLocaleString('en-IN')}
Tax (${quoteData.taxPercentage}%): ₹${quoteData.taxAmount.toLocaleString('en-IN')}
Grand Total: ₹${quoteData.grandTotal.toLocaleString('en-IN')}

Items:
${itemsList}

Payment Terms: ${quoteData.paymentTerms}
Delivery Timeline: ${quoteData.deliveryTimeline}
Warranty: ${quoteData.warranty}

${quoteData.notes ? 'Additional Notes:\n' + quoteData.notes : ''}

Valid Until: ${quoteData.validUntil}
      `.trim();
      
      // Update the request status to 'quoted' and add the quote information
      const response = await axios.put(
        `/api/live-requests/${viewingRequest._id}`,
        {
          status: 'quoted',
          estimatedCost: quoteData.grandTotal,
          actualCost: quoteData.grandTotal,
          notes: [
            ...viewingRequest.notes,
            {
              text: quoteNote,
              addedBy: 'Admin',
              addedAt: new Date()
            }
          ]
        }
      );
      
      if (response.data.success) {
        // Send quotation email
        try {
          const emailResponse = await axios.post(
            `/api/live-requests/${viewingRequest._id}/send-quotation-email`,
            {
              quotationData: {
                items: validItems,
                subtotal: quoteData.subtotal,
                taxPercentage: quoteData.taxPercentage,
                taxAmount: quoteData.taxAmount,
                grandTotal: quoteData.grandTotal,
                paymentTerms: quoteData.paymentTerms,
                deliveryTimeline: quoteData.deliveryTimeline,
                warranty: quoteData.warranty,
                validUntil: quoteData.validUntil,
                notes: quoteData.notes
              }
            }
          );

          if (emailResponse.data.success) {
            showNotification(`✅ Quotation sent successfully!\n\n📧 Email sent to: ${viewingRequest.clientEmail}\n💰 Grand Total: ₹${quoteData.grandTotal.toLocaleString('en-IN')}\n📅 Valid until: ${quoteData.validUntil}\n\nThe client has received the detailed quotation via email.`, 'success', 5000);
          } else {
            showNotification(`✅ Quotation saved successfully!\n\n⚠️ Email sending failed: ${emailResponse.data.message}\n\nThe quotation has been saved but the email could not be sent. Please check your email configuration.`, 'warning', 5000);
          }
        } catch (emailError) {
          console.error('Email error:', emailError);
          showNotification(`✅ Quotation saved successfully!\n\n⚠️ Email could not be sent: ${emailError.response?.data?.message || emailError.message}\n\nThe quotation has been saved but the email could not be sent. Please check your email configuration.`, 'warning', 5000);
        }
        
        fetchRequests();
        closeModal();
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to send quotation', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { color: '#4facfe', bg: '#e6f7ff', text: 'New' },
      contacted: { color: '#f093fb', bg: '#fef5ff', text: 'Contacted' },
      'in-progress': { color: '#f6ad55', bg: '#fef5e7', text: 'In Progress' },
      quoted: { color: '#38b2ac', bg: '#e6fffa', text: 'Quoted' },
      approved: { color: '#43e97b', bg: '#e6ffe6', text: 'Approved' },
      completed: { color: '#667eea', bg: '#f0f4ff', text: 'Completed' },
      cancelled: { color: '#a0aec0', bg: '#f7fafc', text: 'Cancelled' }
    };
    const badge = badges[status] || badges.new;
    return (
      <span style={{
        background: badge.bg,
        color: badge.color,
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }}>
        {badge.text}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      low: { color: '#43e97b', text: '🟢 Low' },
      medium: { color: '#f6ad55', text: '🟡 Medium' },
      high: { color: '#fa709a', text: '🟠 High' },
      urgent: { color: '#e94560', text: '🔴 Urgent' }
    };
    const badge = badges[urgency] || badges.medium;
    return <span style={{ color: badge.color, fontWeight: '600', fontSize: '0.875rem' }}>{badge.text}</span>;
  };

  const getRequestTypeIcon = (type) => {
    const icons = {
      quote: '💰',
      consultation: '💬',
      installation: '🔧',
      repair: '🛠️',
      'custom-order': '✨',
      other: '📋'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="admin-live-requests">
      <header className="admin-live-requests__header">
        <div>
          <h1>Live Requests</h1>
          <p className="admin-live-requests__subtitle">{requests.length} total requests</p>
        </div>
        <button className="admin-live-requests__add-btn" onClick={openModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Request
        </button>
      </header>

      {/* Filters */}
      <div className="admin-live-requests__filters">
        <div className="admin-live-requests__search">
          <input
            type="text"
            placeholder="Search by request #, client name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="in-progress">In Progress</option>
          <option value="quoted">Quoted</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="quote">Quote</option>
          <option value="consultation">Consultation</option>
          <option value="installation">Installation</option>
          <option value="repair">Repair</option>
          <option value="custom-order">Custom Order</option>
          <option value="other">Other</option>
        </select>

        <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)}>
          <option value="">All Urgency</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-live-requests__loading">Loading requests...</div>
      ) : (
        <div className="admin-live-requests__table-container">
          <table className="admin-live-requests__table">
            <thead>
              <tr>
                <th>Request #</th>
                <th>Client</th>
                <th>Type</th>
                <th>Title</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request._id}>
                  <td><strong>{request.requestNumber}</strong></td>
                  <td>
                    <div>
                      <div>{request.clientName}</div>
                      <small style={{ color: '#718096' }}>{request.clientPhone}</small>
                    </div>
                  </td>
                  <td>
                    <span>{getRequestTypeIcon(request.requestType)} {request.requestType}</span>
                  </td>
                  <td>{request.title}</td>
                  <td>{getUrgencyBadge(request.urgency)}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-live-requests__actions">
                      <button onClick={() => handleView(request)} title="View & Send Quote">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button onClick={() => handleEdit(request)} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(request._id)} title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Combined View & Send Quote Modal */}
      {viewingRequest && (
        <div className="admin-live-requests__modal-overlay" onClick={closeModal}>
          <div className="admin-live-requests__modal admin-live-requests__modal--combined" onClick={(e) => e.stopPropagation()}>
            <div className="admin-live-requests__modal-header">
              <h2>📋 Request Details - {viewingRequest.requestNumber}</h2>
              <button onClick={closeModal}>×</button>
            </div>

            {/* Request Information Section */}
            <div className="admin-live-requests__quote-info">
              <div className="quote-client-info">
                <h3>📞 Client Information</h3>
                <p><strong>Name:</strong> {viewingRequest.clientName}</p>
                <p><strong>Email:</strong> {viewingRequest.clientEmail}</p>
                <p><strong>Phone:</strong> {viewingRequest.clientPhone}</p>
              </div>
              <div className="quote-request-info">
                <h3>📝 Request Details</h3>
                <p><strong>Title:</strong> {viewingRequest.title}</p>
                <p><strong>Type:</strong> {getRequestTypeIcon(viewingRequest.requestType)} {viewingRequest.requestType}</p>
                <p><strong>Status:</strong> {getStatusBadge(viewingRequest.status)}</p>
                <p><strong>Urgency:</strong> {getUrgencyBadge(viewingRequest.urgency)}</p>
                {viewingRequest.budget && (
                  <p><strong>Client Budget:</strong> ₹{viewingRequest.budget.min?.toLocaleString('en-IN')} - ₹{viewingRequest.budget.max?.toLocaleString('en-IN')}</p>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="admin-live-requests__view-section" style={{ margin: '20px 30px', padding: '15px', background: '#f7fafc', borderRadius: '8px' }}>
              <h3>Description</h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{viewingRequest.description}</p>
            </div>

            {/* Toggle Quotation Form Button */}
            {!showQuotationForm && (
              <div style={{ padding: '0 30px 20px 30px', textAlign: 'center' }}>
                <button 
                  type="button"
                  onClick={() => setShowQuotationForm(true)}
                  className="admin-live-requests__btn-submit"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '15px 40px', fontSize: '16px' }}
                >
                  📧 Send Quotation to Client
                </button>
                <button 
                  type="button"
                  onClick={() => { closeModal(); handleEdit(viewingRequest); }}
                  className="admin-live-requests__btn-cancel"
                  style={{ marginLeft: '15px', padding: '15px 40px' }}
                >
                  ✏️ Edit Request
                </button>
              </div>
            )}

            {/* Quotation Form - Shown when button clicked */}
            {showQuotationForm && (
              <form onSubmit={handleQuoteSubmit} className="admin-live-requests__quote-form">
                
                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', margin: '0 30px' }}>
                  <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Create Quotation</h2>
                </div>

                {/* Items Section */}
                <div className="quotation-items-section">
                  <div className="section-header">
                    <h3>🛒 Quotation Items</h3>
                    <button type="button" onClick={handleAddItem} className="btn-add-item">
                      + Add Item
                    </button>
                  </div>

                  <div className="quotation-items-table">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>Description</th>
                          <th style={{ width: '15%' }}>Quantity</th>
                          <th style={{ width: '20%' }}>Unit Price (₹)</th>
                          <th style={{ width: '20%' }}>Total (₹)</th>
                          <th style={{ width: '5%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {quoteData.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                placeholder="e.g., Premium Toilet Seat - Kohler"
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                min="1"
                                step="1"
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                required
                              />
                            </td>
                            <td>
                              <strong>₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                            </td>
                            <td>
                              {quoteData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="btn-remove-item"
                                  title="Remove item"
                                >
                                  ×
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="subtotal-row">
                          <td colSpan="3" style={{ textAlign: 'right' }}><strong>Subtotal:</strong></td>
                          <td colSpan="2"><strong>₹{quoteData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                        </tr>
                        <tr className="tax-row">
                          <td colSpan="2" style={{ textAlign: 'right' }}>
                            <strong>Tax:</strong>
                          </td>
                          <td>
                            <input
                              type="number"
                              value={quoteData.taxPercentage}
                              onChange={(e) => handleTaxChange(e.target.value)}
                              min="0"
                              max="100"
                              step="0.01"
                              style={{ width: '80px' }}
                            /> %
                          </td>
                          <td colSpan="2"><strong>₹{quoteData.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                        </tr>
                        <tr className="grand-total-row">
                          <td colSpan="3" style={{ textAlign: 'right' }}><strong>Grand Total:</strong></td>
                          <td colSpan="2"><strong>₹{quoteData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="quotation-terms-section">
                  <h3>📜 Terms & Conditions</h3>
                  
                  <div className="admin-live-requests__row">
                    <div className="admin-live-requests__field">
                      <label>Payment Terms *</label>
                      <input
                        type="text"
                        value={quoteData.paymentTerms}
                        onChange={(e) => setQuoteData({ ...quoteData, paymentTerms: e.target.value })}
                        required
                        placeholder="e.g., 50% advance, 50% on completion"
                      />
                    </div>

                    <div className="admin-live-requests__field">
                      <label>Delivery Timeline *</label>
                      <input
                        type="text"
                        value={quoteData.deliveryTimeline}
                        onChange={(e) => setQuoteData({ ...quoteData, deliveryTimeline: e.target.value })}
                        required
                        placeholder="e.g., 2-3 weeks"
                      />
                    </div>
                  </div>

                  <div className="admin-live-requests__row">
                    <div className="admin-live-requests__field">
                      <label>Warranty *</label>
                      <input
                        type="text"
                        value={quoteData.warranty}
                        onChange={(e) => setQuoteData({ ...quoteData, warranty: e.target.value })}
                        required
                        placeholder="e.g., 1 year manufacturer warranty"
                      />
                    </div>

                    <div className="admin-live-requests__field">
                      <label>Valid Until *</label>
                      <input
                        type="date"
                        value={quoteData.validUntil}
                        onChange={(e) => setQuoteData({ ...quoteData, validUntil: e.target.value })}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="admin-live-requests__field">
                    <label>Additional Notes</label>
                    <textarea
                      value={quoteData.notes}
                      onChange={(e) => setQuoteData({ ...quoteData, notes: e.target.value })}
                      rows="3"
                      placeholder="Installation charges, transportation, special conditions, etc."
                    />
                  </div>
                </div>

                {/* Quote Summary */}
                <div className="quote-summary">
                  <h3>📊 Quotation Summary</h3>
                  <div className="summary-row">
                    <span>Total Items:</span>
                    <strong>{quoteData.items.length}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <strong>₹{quoteData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Tax ({quoteData.taxPercentage}%):</span>
                    <strong>₹{quoteData.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="summary-row" style={{ borderTop: '2px solid rgba(255,255,255,0.5)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>Grand Total:</span>
                    <strong style={{ fontSize: '1.5rem' }}>₹{quoteData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Valid Until:</span>
                    <strong>{quoteData.validUntil}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Client Email:</span>
                    <strong>{viewingRequest.clientEmail}</strong>
                  </div>
                </div>

                <div className="admin-live-requests__modal-actions">
                  <button type="button" onClick={() => setShowQuotationForm(false)} className="admin-live-requests__btn-cancel">
                    ← Back to Request Details
                  </button>
                  <button type="submit" className="admin-live-requests__btn-submit admin-live-requests__btn-send-quote">
                    📧 Send Quotation to Client
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-live-requests__modal-overlay" onClick={closeModal}>
          <div className="admin-live-requests__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-live-requests__modal-header">
              <h2>{editingRequest ? 'Edit Request' : 'Add New Request'}</h2>
              <button onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-live-requests__form">
              <div className="admin-live-requests__row">
                <div className="admin-live-requests__field">
                  <label>Client Name *</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Rajesh Kumar, Priya Sharma"
                  />
                  <small className="field-hint">💡 Full name for formal communication</small>
                </div>

                <div className="admin-live-requests__field">
                  <label>Client Email *</label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    required
                    placeholder="e.g., rajesh@example.com"
                  />
                  <small className="field-hint">💡 Primary contact for quotes and updates</small>
                </div>

                <div className="admin-live-requests__field">
                  <label>Client Phone *</label>
                  <input
                    type="tel"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleChange}
                    required
                    placeholder="e.g., +91-9876543210"
                  />
                  <small className="field-hint">💡 Include country code for international clients</small>
                </div>
              </div>

              <div className="admin-live-requests__row">
                <div className="admin-live-requests__field">
                  <label>Request Type *</label>
                  <select name="requestType" value={formData.requestType} onChange={handleChange} required>
                    <option value="quote">💰 Quote - Get pricing estimate</option>
                    <option value="consultation">💬 Consultation - Free advice</option>
                    <option value="installation">🔧 Installation - Setup service</option>
                    <option value="repair">🛠️ Repair - Fix existing items</option>
                    <option value="custom-order">✨ Custom Order - Bespoke design</option>
                    <option value="other">📋 Other - General inquiry</option>
                  </select>
                  <small className="field-hint">💡 Most common: Quote (70%), Consultation (20%)</small>
                </div>

                <div className="admin-live-requests__field">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  <small className="field-hint">💡 Helps in routing to right team</small>
                </div>
              </div>

              <div className="admin-live-requests__field">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Complete Bathroom Renovation, Kitchen Cabinet Installation"
                />
                <small className="field-hint">💡 Be specific: Include room type and service needed</small>
              </div>

              <div className="admin-live-requests__field">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Detailed description of the request..."
                />
                <small className="field-hint">💡 Include: Room size, current condition, specific requirements, timeline expectations</small>
              </div>

              {/* Description Suggestions */}
              <div className="admin-live-requests__suggestions">
                <div className="suggestion-header">📝 What to Include in Description:</div>
                <div className="suggestion-list">
                  <div className="suggestion-item">✓ Room dimensions (e.g., 10x12 feet)</div>
                  <div className="suggestion-item">✓ Current condition and issues</div>
                  <div className="suggestion-item">✓ Specific products or brands preferred</div>
                  <div className="suggestion-item">✓ Timeline and urgency</div>
                  <div className="suggestion-item">✓ Any special requirements or constraints</div>
                </div>
              </div>

              <div className="admin-live-requests__row">
                <div className="admin-live-requests__field">
                  <label>Budget Min (₹)</label>
                  <input
                    type="number"
                    name="budget.min"
                    value={formData.budget.min}
                    onChange={handleChange}
                    placeholder="e.g., 50000"
                  />
                  <small className="field-hint">💡 Typical range: ₹25,000 - ₹5,00,000</small>
                </div>

                <div className="admin-live-requests__field">
                  <label>Budget Max (₹)</label>
                  <input
                    type="number"
                    name="budget.max"
                    value={formData.budget.max}
                    onChange={handleChange}
                    placeholder="e.g., 100000"
                  />
                  <small className="field-hint">💡 Should be higher than minimum</small>
                </div>

                <div className="admin-live-requests__field">
                  <label>Estimated Cost (₹)</label>
                  <input
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={handleChange}
                    placeholder="Your estimate"
                  />
                  <small className="field-hint">💡 Your professional estimate for this project</small>
                </div>
              </div>

              {/* Budget Suggestions */}
              <div className="admin-live-requests__suggestions">
                <div className="suggestion-header">💰 Budget Suggestions by Category:</div>
                <div className="suggestion-grid">
                  <div className="suggestion-item">
                    <strong>Bathroom:</strong> ₹50,000 - ₹3,00,000
                  </div>
                  <div className="suggestion-item">
                    <strong>Kitchen:</strong> ₹1,00,000 - ₹5,00,000
                  </div>
                  <div className="suggestion-item">
                    <strong>Bedroom:</strong> ₹30,000 - ₹2,00,000
                  </div>
                  <div className="suggestion-item">
                    <strong>Living Room:</strong> ₹40,000 - ₹3,00,000
                  </div>
                  <div className="suggestion-item">
                    <strong>Flooring:</strong> ₹25,000 - ₹2,00,000
                  </div>
                  <div className="suggestion-item">
                    <strong>Lighting:</strong> ₹15,000 - ₹1,00,000
                  </div>
                </div>
              </div>

              <div className="admin-live-requests__row">
                <div className="admin-live-requests__field">
                  <label>Urgency *</label>
                  <select name="urgency" value={formData.urgency} onChange={handleChange} required>
                    <option value="low">🟢 Low - Can wait 2-4 weeks</option>
                    <option value="medium">🟡 Medium - Within 1-2 weeks</option>
                    <option value="high">🟠 High - Within 3-5 days</option>
                    <option value="urgent">🔴 Urgent - ASAP (24-48 hours)</option>
                  </select>
                  <small className="field-hint">💡 Client's timeline expectation</small>
                </div>

                <div className="admin-live-requests__field">
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleChange} required>
                    <option value="new">New - Just received</option>
                    <option value="contacted">Contacted - Initial contact made</option>
                    <option value="in-progress">In Progress - Working on quote</option>
                    <option value="quoted">Quoted - Quote sent to client</option>
                    <option value="approved">Approved - Client accepted</option>
                    <option value="completed">Completed - Project finished</option>
                    <option value="cancelled">Cancelled - Request cancelled</option>
                  </select>
                  <small className="field-hint">💡 Current stage of the request</small>
                </div>

                <div className="admin-live-requests__field">
                  <label>Priority *</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} required>
                    <option value="low">Low - Standard processing</option>
                    <option value="medium">Medium - Normal priority</option>
                    <option value="high">High - Prioritize this</option>
                  </select>
                  <small className="field-hint">💡 Internal priority level</small>
                </div>
              </div>

              <div className="admin-live-requests__row">
                <div className="admin-live-requests__field">
                  <label>Assigned To</label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    placeholder="e.g., Rajesh Kumar, Sales Team"
                  />
                  <small className="field-hint">💡 Team member handling this request</small>
                </div>

                <div className="admin-live-requests__field">
                  <label>Source</label>
                  <select name="source" value={formData.source} onChange={handleChange}>
                    <option value="website">🌐 Website Form</option>
                    <option value="phone">📞 Phone Call</option>
                    <option value="email">📧 Email</option>
                    <option value="walk-in">🚶 Walk-in</option>
                    <option value="referral">👥 Referral</option>
                    <option value="social-media">📱 Social Media</option>
                  </select>
                  <small className="field-hint">💡 How client found you</small>
                </div>

                <div className="admin-live-requests__field">
                  <label>Preferred Date</label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <small className="field-hint">💡 Client's preferred start date</small>
                </div>
              </div>

              <div className="admin-live-requests__field">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., urgent, vip, follow-up, premium"
                />
                <small className="field-hint">💡 Suggested tags: urgent, vip, follow-up, premium, repeat-customer, high-value, quick-turnaround</small>
              </div>

              <div className="admin-live-requests__modal-actions">
                <button type="button" onClick={closeModal} className="admin-live-requests__btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="admin-live-requests__btn-submit">
                  {editingRequest ? 'Update' : 'Create'} Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveRequests;
