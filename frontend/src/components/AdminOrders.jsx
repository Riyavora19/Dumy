import { useState, useEffect } from 'react';
import AdminOrderForm from './AdminOrderForm';
import QuotationPDFGenerator from './QuotationPDFGenerator';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, filterStatus, filterPaymentStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);
      if (filterPaymentStatus) params.append('paymentStatus', filterPaymentStatus);

      const response = await fetch(`http://localhost:5000/api/orders?${params}`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
      const order = await response.json();
      setSelectedOrder(order);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('Order status updated successfully!');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const handleApproveCommission = async (orderId) => {
    if (!confirm('Approve commission for this order?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/commission/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'admin' })
      });

      if (response.ok) {
        alert('Commission approved successfully!');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error approving commission:', error);
      alert('Error approving commission');
    }
  };

  const handlePayCommission = async (orderId) => {
    const paymentMethod = prompt('Enter payment method (cash/bank-transfer/upi):');
    if (!paymentMethod) return;

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/commission/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod })
      });

      if (response.ok) {
        alert('Commission marked as paid!');
        fetchOrders();
      }
    } catch (error) {
      console.error('Error marking commission as paid:', error);
      alert('Error marking commission as paid');
    }
  };

  const handleGeneratePDF = async (order) => {
    // Prepare data for PDF generation
    const quotationData = {
      clientData: {
        clientName: order.customerName,
        companyName: order.billToName || order.customerName,
        address: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`,
        mobileNumber: order.customerPhone,
        email: order.customerEmail || '',
        gstNumber: order.customerGST || ''
      },
      items: order.products.map(item => ({
        productName: `${item.productName} - ${item.variant || ''}`,
        quantity: item.quantity,
        rate: item.unitPrice,
        amount: item.totalPrice
      })),
      gst: order.taxRate || 18,
      subtotal: order.subtotal,
      gstAmount: order.tax,
      total: order.total,
      quotationNumber: order.orderNumber,
      quotationDate: order.orderDate
    };

    await QuotationPDFGenerator(quotationData);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6c757d',
      pending: '#ffc107',
      confirmed: '#17a2b8',
      processing: '#007bff',
      shipped: '#fd7e14',
      delivered: '#28a745',
      completed: '#20c997',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      partial: '#fd7e14',
      paid: '#28a745',
      refunded: '#17a2b8',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h2>Order Management</h2>
        <button className="btn-primary" onClick={() => setShowOrderForm(true)}>
          + Create Order
        </button>
      </div>

      <div className="orders-filters">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select value={filterPaymentStatus} onChange={(e) => setFilterPaymentStatus(e.target.value)} className="filter-select">
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Referrer</th>
                <th>Products</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Commission</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="11" className="no-data">No orders found</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id}>
                    <td>
                      <strong className="order-number">{order.orderNumber}</strong>
                    </td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>
                      <div className="customer-info">
                        <strong>{order.customerName}</strong>
                        <span>{order.customerPhone}</span>
                      </div>
                    </td>
                    <td>
                      {order.referrer ? (
                        <div className="referrer-info">
                          <strong>{order.referrerName}</strong>
                          {order.relationshipType && (
                            <span className="relationship-badge">{order.relationshipType}</span>
                          )}
                        </div>
                      ) : (
                        <span className="no-referrer">-</span>
                      )}
                    </td>
                    <td>{order.products?.length || 0} items</td>
                    <td>
                      <strong className="order-total">₹{order.total?.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ background: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ background: getPaymentStatusColor(order.paymentStatus) }}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {order.referrer && order.referrerCommission?.amount > 0 ? (
                        <div className="commission-info">
                          <span className="commission-amount">
                            ₹{order.referrerCommission.amount.toLocaleString()}
                          </span>
                          <span 
                            className="commission-status"
                            style={{ 
                              background: order.referrerCommission.status === 'paid' ? '#d4edda' : 
                                         order.referrerCommission.status === 'approved' ? '#fff3cd' : '#f8d7da',
                              color: order.referrerCommission.status === 'paid' ? '#155724' : 
                                     order.referrerCommission.status === 'approved' ? '#856404' : '#721c24'
                            }}
                          >
                            {order.referrerCommission.status}
                          </span>
                        </div>
                      ) : (
                        <span className="no-commission">-</span>
                      )}
                    </td>
                    <td>
                      {order.createdByName ? (
                        <span style={{ color: '#667eea', fontWeight: '600' }}>
                          👤 {order.createdByName}
                        </span>
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleViewDetails(order._id)} 
                          className="btn-view"
                          title="View Details"
                        >
                          👁️
                        </button>
                        
                        <button 
                          onClick={() => handleGeneratePDF(order)} 
                          className="btn-pdf"
                          title="Generate Quotation PDF"
                        >
                          📄
                        </button>
                        
                        {order.referrer && order.referrerCommission?.status === 'pending' && (
                          <button 
                            onClick={() => handleApproveCommission(order._id)} 
                            className="btn-approve"
                            title="Approve Commission"
                          >
                            ✓
                          </button>
                        )}
                        
                        {order.referrer && order.referrerCommission?.status === 'approved' && (
                          <button 
                            onClick={() => handlePayCommission(order._id)} 
                            className="btn-pay"
                            title="Mark Commission as Paid"
                          >
                            💰
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showOrderForm && (
        <AdminOrderForm
          onClose={() => setShowOrderForm(false)}
          onSuccess={() => {
            setShowOrderForm(false);
            fetchOrders();
          }}
        />
      )}

      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - {selectedOrder.orderNumber}</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            
            <div className="order-details-content">
              <div className="details-grid">
                <div className="details-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerEmail || '-'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                </div>

                {selectedOrder.referrer && (
                  <div className="details-section">
                    <h4>Referral Information</h4>
                    <p><strong>Referred by:</strong> {selectedOrder.referrerName}</p>
                    <p><strong>Relationship:</strong> {selectedOrder.relationshipType || '-'}</p>
                    {selectedOrder.relationshipContext && (
                      <p><strong>Context:</strong> {selectedOrder.relationshipContext}</p>
                    )}
                  </div>
                )}

                <div className="details-section">
                  <h4>Shipping Address</h4>
                  <p>{selectedOrder.shippingAddress.name}</p>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                  <p>{selectedOrder.shippingAddress.pincode}</p>
                  {selectedOrder.shippingAddress.landmark && (
                    <p><em>Landmark: {selectedOrder.shippingAddress.landmark}</em></p>
                  )}
                </div>

                <div className="details-section">
                  <h4>Order Status</h4>
                  <div className="status-update">
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <p><strong>Payment:</strong> {selectedOrder.paymentStatus}</p>
                  <p><strong>Method:</strong> {selectedOrder.paymentMethod}</p>
                </div>
              </div>

              <div className="details-section full-width">
                <h4>Products ({selectedOrder.products?.length || 0})</h4>
                <table className="products-detail-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Company</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.products?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td>{item.companyName || '-'}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.unitPrice.toLocaleString()}</td>
                        <td>₹{item.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="details-section full-width">
                <h4>Pricing Summary</h4>
                <div className="pricing-summary">
                  <div className="price-row">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="price-row discount">
                      <span>Discount:</span>
                      <span>-₹{selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="price-row">
                    <span>Tax (18% GST):</span>
                    <span>₹{selectedOrder.tax?.toLocaleString()}</span>
                  </div>
                  <div className="price-row">
                    <span>Shipping:</span>
                    <span>₹{selectedOrder.shippingCharges?.toLocaleString()}</span>
                  </div>
                  <div className="price-row total">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.referrer && selectedOrder.referrerCommission?.amount > 0 && (
                <div className="details-section full-width commission-section">
                  <h4>Commission Details</h4>
                  <p><strong>Amount:</strong> ₹{selectedOrder.referrerCommission.amount.toLocaleString()} ({selectedOrder.referrerCommission.rate}%)</p>
                  <p><strong>Status:</strong> {selectedOrder.referrerCommission.status}</p>
                  {selectedOrder.referrerCommission.approvedDate && (
                    <p><strong>Approved:</strong> {new Date(selectedOrder.referrerCommission.approvedDate).toLocaleDateString()}</p>
                  )}
                  {selectedOrder.referrerCommission.paidDate && (
                    <p><strong>Paid:</strong> {new Date(selectedOrder.referrerCommission.paidDate).toLocaleDateString()}</p>
                  )}
                </div>
              )}

              {selectedOrder.notes && (
                <div className="details-section full-width">
                  <h4>Notes</h4>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => handleGeneratePDF(selectedOrder)} 
                className="btn-primary"
              >
                📄 Generate Quotation PDF
              </button>
              <button onClick={() => setShowDetailsModal(false)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
