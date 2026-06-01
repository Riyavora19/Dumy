import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import './AdminDeliveries.css';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

const DELIVERY_STATUS = {
  not_started: { label: 'Not Started', cls: 'badge--neutral' },
  partial:     { label: 'Partial',     cls: 'badge--warning' },
  completed:   { label: 'Completed',   cls: 'badge--success' },
};

function AdminDeliveries() {
  const { showNotification } = useNotification();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [deliverySummary, setDeliverySummary] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDeliveredBy, setFormDeliveredBy] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  // Payment state for this delivery
  const [paymentStatus, setPaymentStatus] = useState('not_paid'); // 'not_paid' | 'paid' | 'partial'
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentTxnId, setPaymentTxnId] = useState('');

  const TABS = [
    { key: 'all', label: 'All Approved' },
    { key: 'not_started', label: 'Not Started' },
    { key: 'partial', label: 'Partial' },
    { key: 'completed', label: 'Completed' },
  ];

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ status: 'approved', limit: 100 });
      if (search) params.append('search', search);
      const res = await fetch(`${API_URL}/quotations?${params}`);
      const data = await res.json();
      if (data.success) {
        let list = data.quotations;
        if (activeTab !== 'all') list = list.filter(q => q.deliveryStatus === activeTab);
        setQuotations(list);
      }
    } catch (err) {
      showNotification('Failed to load quotations', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

  const openQuotation = async (quotation) => {
    setSelectedQuotation(quotation);
    setShowAddForm(false);
    setSelectedItems([]);
    try {
      const res = await fetch(`${API_URL}/deliveries/quotation/${quotation._id}`);
      const data = await res.json();
      if (data.success) {
        setDeliveries(data.deliveries);
        setDeliverySummary(data.summary);
      }
    } catch (err) {
      showNotification('Failed to load deliveries', 'error');
    }
  };

  const openAddForm = () => {
    setSelectedItems([]);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDeliveredBy('');
    setFormNotes('');
    setPaymentStatus('not_paid');
    setPaymentAmount('');
    setPaymentMethod('cash');
    setPaymentTxnId('');
    setShowAddForm(true);
  };

  // Add a product from the quotation to the delivery list
  const addProductToDelivery = (item) => {
    const key = item._id || item.productName;
    if (selectedItems.find(i => i._itemKey === key)) return;
    setSelectedItems(prev => [...prev, {
      _itemKey: key,
      product: item.product,
      productName: item.productName,
      sku: item.sku || '',
      companyName: item.companyName || '',
      categoryName: item.categoryName || '',
      quantityOrdered: item.quantity,
      quantityDelivered: item.quantity,
      unitPrice: item.unitPrice || 0,
      totalPrice: item.totalPrice || 0,
      image: item.image || '',
      roomName: item.roomName || '',
      areaName: item.areaName || '',
    }]);
  };

  const removeFromDelivery = (key) => {
    setSelectedItems(prev => prev.filter(i => i._itemKey !== key));
  };

  const updateDeliveryQty = (key, val) => {
    setSelectedItems(prev => prev.map(i => {
      if (i._itemKey !== key) return i;
      const qty = Math.max(0, Math.min(Number(val), i.quantityOrdered));
      return { ...i, quantityDelivered: qty, totalPrice: qty * i.unitPrice };
    }));
  };

  const handleAddDelivery = async () => {
    const deliveredItems = selectedItems.filter(i => i.quantityDelivered > 0);
    if (deliveredItems.length === 0) {
      showNotification('Add at least one product with quantity > 0', 'error');
      return;
    }

    const deliveryValue = deliveredItems.reduce((s, i) => s + i.totalPrice, 0);

    // Validate payment amount if paid/partial
    if (paymentStatus !== 'not_paid') {
      const amt = parseFloat(paymentAmount);
      if (!amt || amt <= 0) {
        showNotification('Enter a valid payment amount', 'error');
        return;
      }
    }

    try {
      const payload = {
        quotation: selectedQuotation._id,
        quotationNumber: selectedQuotation.quotationNumber,
        clientName: selectedQuotation.clientName,
        clientPhone: selectedQuotation.clientPhone,
        clientAddress: selectedQuotation.clientAddress,
        items: deliveredItems.map(i => ({
          product: i.product,
          productName: i.productName,
          sku: i.sku,
          companyName: i.companyName,
          categoryName: i.categoryName,
          quantityOrdered: i.quantityOrdered,
          quantityDelivered: i.quantityDelivered,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
          image: i.image,
          roomName: i.roomName,
          areaName: i.areaName
        })),
        deliveredDate: formDate,
        notes: formNotes,
        deliveredBy: formDeliveredBy,
        status: 'delivered'
      };

      const res = await fetch(`${API_URL}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data;
      try {
        data = await res.json();
      } catch {
        showNotification(`Server error (${res.status}): Could not parse response`, 'error');
        return;
      }

      if (data.success) {
        // If payment was collected, create a payment record too
        if (paymentStatus !== 'not_paid') {
          const amt = parseFloat(paymentAmount) || deliveryValue;
          const paymentPayload = {
            quotation: selectedQuotation._id,
            amount: amt,
            paymentMethod,
            transactionId: paymentTxnId,
            paymentDate: formDate,
            notes: `Payment for delivery ${data.delivery.deliveryNumber}`
          };
          try {
            await fetch(`${API_URL}/payments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(paymentPayload)
            });
          } catch (payErr) {
            console.error('Payment save failed:', payErr);
          }
        }

        showNotification(
          paymentStatus !== 'not_paid'
            ? 'Delivery recorded & payment saved!'
            : 'Delivery recorded!',
          'success'
        );
        setShowAddForm(false);
        setSelectedItems([]);
        openQuotation(selectedQuotation);
        fetchQuotations();
      } else {
        showNotification(data.message || 'Failed to record delivery', 'error');
      }
    } catch (err) {
      showNotification('Failed to record delivery', 'error');
    }
  };

  const handleDeleteDelivery = async (id) => {
    if (!window.confirm('Delete this delivery record?')) return;
    try {
      await fetch(`${API_URL}/deliveries/${id}`, { method: 'DELETE' });
      showNotification('Delivery deleted', 'success');
      openQuotation(selectedQuotation);
      fetchQuotations();
    } catch (err) {
      showNotification('Failed to delete', 'error');
    }
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  // Products from quotation not yet added to selectedItems AND not already fully delivered
  const alreadyDeliveredKeys = new Set(
    deliveries.flatMap(d => (d.items || []).map(i => i.productName))
  );

  const availableProducts = (selectedQuotation?.items || []).filter(item => {
    // Not already in current delivery selection
    if (selectedItems.find(i => i._itemKey === (item._id || item.productName))) return false;
    // Not already delivered in a previous delivery
    if (alreadyDeliveredKeys.has(item.productName)) return false;
    return true;
  });

  return (
    <div className="admin-deliveries">
      <div className="ad-header">
        <div>
          <h1>🚚 Deliveries</h1>
          <p>Track product deliveries for approved quotations</p>
        </div>
      </div>

      <div className="ad-layout">
        {/* Left panel */}
        <div className="ad-left">
          <div className="ad-tabs">
            {TABS.map(t => (
              <button key={t.key} className={`ad-tab ${activeTab === t.key ? 'ad-tab--active' : ''}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="ad-search">
            <input type="text" placeholder="Search client or quotation #..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {loading ? <div className="ad-loading">Loading...</div> : quotations.length === 0 ? (
            <div className="ad-empty">No approved quotations found</div>
          ) : (
            <div className="ad-list">
              {quotations.map(q => {
                const ds = DELIVERY_STATUS[q.deliveryStatus || 'not_started'];
                const pct = q.total > 0 ? Math.min(100, Math.round(((q.totalDelivered || 0) / q.total) * 100)) : 0;
                return (
                  <div key={q._id} className={`ad-card ${selectedQuotation?._id === q._id ? 'ad-card--active' : ''}`} onClick={() => openQuotation(q)}>
                    <div className="ad-card__top">
                      <span className="ad-card__num">{q.quotationNumber}</span>
                      <span className={`ad-badge ${ds.cls}`}>{ds.label}</span>
                    </div>
                    <div className="ad-card__client">{q.clientName}</div>
                    <div className="ad-card__amounts">
                      <span>Total: {fmt(q.total)}</span>
                      <span>Delivered: {fmt(q.totalDelivered)}</span>
                    </div>
                    <div className="ad-progress-bar"><div className="ad-progress-fill" style={{ width: `${pct}%` }} /></div>
                    <div className="ad-progress-label">{pct}% delivered</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="ad-right">
          {!selectedQuotation ? (
            <div className="ad-placeholder">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="1" y="3" width="15" height="13" rx="1"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <p>Select a quotation to manage deliveries</p>
            </div>
          ) : (
            <>
              <div className="ad-detail-header">
                <div>
                  <h2>{selectedQuotation.quotationNumber}</h2>
                  <p>{selectedQuotation.clientName}{selectedQuotation.clientPhone && ` · ${selectedQuotation.clientPhone}`}</p>
                </div>
                {!showAddForm && <button className="ad-add-btn" onClick={openAddForm}>+ Record Delivery</button>}
              </div>

              {/* Summary */}
              {deliverySummary && (
                <div className="ad-summary">
                  <div className="ad-summary-card"><span>Quotation Total</span><strong>{fmt(deliverySummary.quotationTotal)}</strong></div>
                  <div className="ad-summary-card ad-summary-card--delivered"><span>Total Delivered</span><strong>{fmt(deliverySummary.totalDelivered)}</strong></div>
                  <div className="ad-summary-card ad-summary-card--pending"><span>Remaining</span><strong>{fmt(deliverySummary.remaining)}</strong></div>
                </div>
              )}

              {/* Add delivery form */}
              {showAddForm && (
                <div className="ad-form">
                  <h3>Record New Delivery</h3>

                  <div className="ad-form-row">
                    <div className="ad-form-group">
                      <label>Delivery Date</label>
                      <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
                    </div>
                    <div className="ad-form-group">
                      <label>Delivered By</label>
                      <input type="text" placeholder="Staff name / vehicle" value={formDeliveredBy} onChange={e => setFormDeliveredBy(e.target.value)} />
                    </div>
                  </div>

                  {/* Two-panel picker */}
                  <div className="ad-two-panel">
                    {/* Left: available products */}
                    <div className="ad-panel">
                      <div className="ad-panel__title">
                        Quotation Products
                        <span className="ad-panel__count">{availableProducts.length}</span>
                        {alreadyDeliveredKeys.size > 0 && (
                          <span className="ad-panel__delivered-note">{alreadyDeliveredKeys.size} delivered</span>
                        )}
                      </div>
                      <div className="ad-panel__list">
                        {availableProducts.length === 0 ? (
                          <div className="ad-panel__empty">
                            {alreadyDeliveredKeys.size > 0 ? 'All products already delivered' : 'All products added'}
                          </div>
                        ) : availableProducts.map((item, idx) => (
                          <div key={idx} className="ad-panel__item" onClick={() => addProductToDelivery(item)}>
                            <div className="ad-panel__item-info">
                              <span className="ad-panel__item-name">{item.productName}</span>
                              {item.companyName && <span className="ad-panel__item-company">{item.companyName}</span>}
                              <span className="ad-panel__item-meta">Qty: {item.quantity} · {fmt(item.unitPrice)}</span>
                            </div>
                            <span className="ad-panel__add">+</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: selected for delivery */}
                    <div className="ad-panel">
                      <div className="ad-panel__title">
                        Delivering
                        <span className="ad-panel__count ad-panel__count--active">{selectedItems.length}</span>
                      </div>
                      <div className="ad-panel__list">
                        {selectedItems.length === 0 ? (
                          <div className="ad-panel__empty">Click products on the left to add</div>
                        ) : selectedItems.map(item => (
                          <div key={item._itemKey} className="ad-panel__item ad-panel__item--selected">
                            <div className="ad-panel__item-info">
                              <span className="ad-panel__item-name">{item.productName}</span>
                              {item.companyName && <span className="ad-panel__item-company">{item.companyName}</span>}
                              <div className="ad-panel__qty-row">
                                <span>Qty:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={item.quantityOrdered}
                                  value={item.quantityDelivered}
                                  onChange={e => updateDeliveryQty(item._itemKey, e.target.value)}
                                  className="ad-qty-input"
                                  onClick={e => e.stopPropagation()}
                                />
                                <span>/ {item.quantityOrdered}</span>
                                <span className="ad-panel__item-total">{fmt(item.totalPrice)}</span>
                              </div>
                            </div>
                            <button className="ad-remove-btn" onClick={() => removeFromDelivery(item._itemKey)}>✕</button>
                          </div>
                        ))}
                        {selectedItems.length > 0 && (
                          <div className="ad-panel__subtotal">
                            Total: <strong>{fmt(selectedItems.reduce((s, i) => s + i.totalPrice, 0))}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ad-form-group" style={{ marginTop: '12px' }}>
                    <label>Notes</label>
                    <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Delivery notes..." rows={2} />
                  </div>

                  {/* Payment for this delivery */}
                  <div className="ad-payment-section">
                    <div className="ad-payment-section__title">Payment for this Delivery</div>
                    <div className="ad-payment-options">
                      <label className={`ad-payment-opt ${paymentStatus === 'not_paid' ? 'ad-payment-opt--active' : ''}`}>
                        <input type="radio" name="payStatus" value="not_paid" checked={paymentStatus === 'not_paid'} onChange={() => setPaymentStatus('not_paid')} />
                        <span>❌ Not Paid</span>
                      </label>
                      <label className={`ad-payment-opt ${paymentStatus === 'paid' ? 'ad-payment-opt--active ad-payment-opt--paid' : ''}`}>
                        <input type="radio" name="payStatus" value="paid" checked={paymentStatus === 'paid'} onChange={() => { setPaymentStatus('paid'); setPaymentAmount(String(selectedItems.reduce((s,i) => s + i.totalPrice, 0))); }} />
                        <span>✅ Fully Paid</span>
                      </label>
                      <label className={`ad-payment-opt ${paymentStatus === 'partial' ? 'ad-payment-opt--active ad-payment-opt--partial' : ''}`}>
                        <input type="radio" name="payStatus" value="partial" checked={paymentStatus === 'partial'} onChange={() => setPaymentStatus('partial')} />
                        <span>⚡ Partial</span>
                      </label>
                    </div>

                    {paymentStatus !== 'not_paid' && (
                      <div className="ad-payment-fields">
                        <div className="ad-form-row">
                          <div className="ad-form-group">
                            <label>Amount Paid (₹)</label>
                            <input
                              type="number"
                              min="1"
                              value={paymentAmount}
                              onChange={e => setPaymentAmount(e.target.value)}
                              placeholder="Enter amount"
                            />
                            <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                              Delivery value: {fmt(selectedItems.reduce((s,i) => s + i.totalPrice, 0))}
                            </span>
                          </div>
                          <div className="ad-form-group">
                            <label>Payment Method</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem' }}>
                              {['cash','card','upi','bank_transfer','cheque','other'].map(m => (
                                <option key={m} value={m}>{m.replace('_',' ').toUpperCase()}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="ad-form-group">
                          <label>Transaction ID / Reference (optional)</label>
                          <input type="text" value={paymentTxnId} onChange={e => setPaymentTxnId(e.target.value)} placeholder="Cheque no / UPI ref / etc." />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ad-form-actions">
                    <button className="ad-btn-secondary" onClick={() => { setShowAddForm(false); setSelectedItems([]); }}>Cancel</button>
                    <button className="ad-btn-primary" onClick={handleAddDelivery}>
                      Save Delivery {selectedItems.length > 0 && `(${selectedItems.length} items)`}
                    </button>
                  </div>
                </div>
              )}

              {/* Delivery history */}
              <div className="ad-history">
                <h3>Delivery History ({deliveries.length})</h3>
                {deliveries.length === 0 ? (
                  <div className="ad-empty">No deliveries recorded yet</div>
                ) : deliveries.map((d, idx) => (
                  <div key={d._id} className="ad-delivery-card">
                    <div className="ad-delivery-card__header">
                      <div>
                        <span className="ad-delivery-num">Delivery #{idx + 1} · {d.deliveryNumber}</span>
                        <span className="ad-delivery-date">{fmtDate(d.deliveredDate)}</span>
                        {d.deliveredBy && <span className="ad-delivery-by">by {d.deliveredBy}</span>}
                      </div>
                      <div className="ad-delivery-value">{fmt(d.deliveryValue)}</div>
                    </div>
                    <div className="ad-delivery-items">
                      {(d.items || []).map((item, i) => (
                        <div key={i} className="ad-delivery-item">
                          <span>{item.productName}</span>
                          <span>×{item.quantityDelivered}</span>
                          <span>{fmt(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                    {d.notes && <div className="ad-delivery-notes">{d.notes}</div>}
                    <button className="ad-delete-btn" onClick={() => handleDeleteDelivery(d._id)}>Delete</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDeliveries;
