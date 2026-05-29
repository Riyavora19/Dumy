import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import './AdminDeliveries.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://dumy-2-mli2.onrender.com/api';

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
  const [formItems, setFormItems] = useState([]);
  const [formNotes, setFormNotes] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDeliveredBy, setFormDeliveredBy] = useState('');

  const TABS = [
    { key: 'all', label: 'All Approved' },
    { key: 'not_started', label: 'Not Started' },
    { key: 'partial', label: 'Partial' },
    { key: 'completed', label: 'Completed' },
  ];

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      // Only show approved quotations in deliveries
      const params = new URLSearchParams({ status: 'approved', limit: 100 });
      if (search) params.append('search', search);
      const res = await fetch(`${API_URL}/quotations?${params}`);
      const data = await res.json();
      if (data.success) {
        let list = data.quotations;
        if (activeTab !== 'all') {
          list = list.filter(q => q.deliveryStatus === activeTab);
        }
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
    // Pre-fill items from quotation
    const items = (selectedQuotation.items || []).map(item => ({
      ...item,
      quantityOrdered: item.quantity,
      quantityDelivered: item.quantity, // default to full
      totalPrice: item.totalPrice
    }));
    setFormItems(items);
    setFormNotes('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDeliveredBy('');
    setShowAddForm(true);
  };

  const updateItemQty = (idx, val) => {
    setFormItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const qty = Math.max(0, Math.min(Number(val), item.quantityOrdered));
      return { ...item, quantityDelivered: qty, totalPrice: qty * item.unitPrice };
    }));
  };

  const handleAddDelivery = async () => {
    const deliveredItems = formItems.filter(i => i.quantityDelivered > 0);
    if (deliveredItems.length === 0) {
      showNotification('Add at least one item with quantity > 0', 'error');
      return;
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
      const data = await res.json();
      if (data.success) {
        showNotification('Delivery recorded!', 'success');
        setShowAddForm(false);
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

  return (
    <div className="admin-deliveries">
      <div className="ad-header">
        <div>
          <h1>🚚 Deliveries</h1>
          <p>Track product deliveries for approved quotations</p>
        </div>
      </div>

      <div className="ad-layout">
        {/* Left: Quotation list */}
        <div className="ad-left">
          <div className="ad-tabs">
            {TABS.map(t => (
              <button key={t.key} className={`ad-tab ${activeTab === t.key ? 'ad-tab--active' : ''}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="ad-search">
            <input
              type="text"
              placeholder="Search client or quotation #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="ad-loading">Loading...</div>
          ) : quotations.length === 0 ? (
            <div className="ad-empty">No approved quotations found</div>
          ) : (
            <div className="ad-list">
              {quotations.map(q => {
                const ds = DELIVERY_STATUS[q.deliveryStatus || 'not_started'];
                const pct = q.total > 0 ? Math.min(100, Math.round(((q.totalDelivered || 0) / q.total) * 100)) : 0;
                return (
                  <div
                    key={q._id}
                    className={`ad-card ${selectedQuotation?._id === q._id ? 'ad-card--active' : ''}`}
                    onClick={() => openQuotation(q)}
                  >
                    <div className="ad-card__top">
                      <span className="ad-card__num">{q.quotationNumber}</span>
                      <span className={`ad-badge ${ds.cls}`}>{ds.label}</span>
                    </div>
                    <div className="ad-card__client">{q.clientName}</div>
                    <div className="ad-card__amounts">
                      <span>Total: {fmt(q.total)}</span>
                      <span>Delivered: {fmt(q.totalDelivered)}</span>
                    </div>
                    <div className="ad-progress-bar">
                      <div className="ad-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="ad-progress-label">{pct}% delivered</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Delivery detail */}
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
                  <p>{selectedQuotation.clientName} {selectedQuotation.clientPhone && `· ${selectedQuotation.clientPhone}`}</p>
                </div>
                <button className="ad-add-btn" onClick={openAddForm}>+ Record Delivery</button>
              </div>

              {/* Summary cards */}
              {deliverySummary && (
                <div className="ad-summary">
                  <div className="ad-summary-card">
                    <span>Quotation Total</span>
                    <strong>{fmt(deliverySummary.quotationTotal)}</strong>
                  </div>
                  <div className="ad-summary-card ad-summary-card--delivered">
                    <span>Total Delivered</span>
                    <strong>{fmt(deliverySummary.totalDelivered)}</strong>
                  </div>
                  <div className="ad-summary-card ad-summary-card--pending">
                    <span>Remaining</span>
                    <strong>{fmt(deliverySummary.remaining)}</strong>
                  </div>
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

                  <div className="ad-form-items">
                    <table className="ad-items-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Ordered</th>
                          <th>Delivering</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formItems.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <div className="ad-item-name">{item.productName}</div>
                              {item.companyName && <div className="ad-item-sub">{item.companyName}</div>}
                            </td>
                            <td>{item.quantityOrdered}</td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                max={item.quantityOrdered}
                                value={item.quantityDelivered}
                                onChange={e => updateItemQty(idx, e.target.value)}
                                className="ad-qty-input"
                              />
                            </td>
                            <td>{fmt(item.unitPrice)}</td>
                            <td>{fmt(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600 }}>Delivery Value:</td>
                          <td style={{ fontWeight: 700, color: '#276749' }}>
                            {fmt(formItems.reduce((s, i) => s + i.totalPrice, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="ad-form-group">
                    <label>Notes</label>
                    <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Delivery notes..." rows={2} />
                  </div>

                  <div className="ad-form-actions">
                    <button className="ad-btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                    <button className="ad-btn-primary" onClick={handleAddDelivery}>Save Delivery</button>
                  </div>
                </div>
              )}

              {/* Delivery history */}
              <div className="ad-history">
                <h3>Delivery History ({deliveries.length})</h3>
                {deliveries.length === 0 ? (
                  <div className="ad-empty">No deliveries recorded yet</div>
                ) : (
                  deliveries.map((d, idx) => (
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
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDeliveries;
