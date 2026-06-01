import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import AdminBudgetPlanForm from './AdminBudgetPlanForm';
import QuotationPDFGenerator from './QuotationPDFGenerator';
import './AdminQuotations.css';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending_approval', label: 'Pending Approval' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_BADGE = {
  pending_approval: { label: 'Pending Approval', cls: 'badge--warning' },
  approved: { label: 'Approved', cls: 'badge--success' },
  rejected: { label: 'Rejected', cls: 'badge--danger' },
  draft: { label: 'Draft', cls: 'badge--neutral' },
};

// ── Inline Margin Modal ──────────────────────────────────────────────────────
function MarginModal({ quotation, onClose }) {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/products?limit=200`)
      .then(r => r.json())
      .then(d => {
        const map = {};
        (d.data || d.products || []).forEach(p => {
          map[p._id] = { npp: p.npp || 0, sdp: p.sdp || 0, mrp: p.mrp || p.price || 0 };
        });
        setProducts(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const items = (quotation.items || []).map(item => {
    const qty = item.quantity || 1;
    const sellPrice = item.totalPrice || (item.unitPrice * qty);
    const pd = products[item.product] || {};
    const costPerUnit = pd.npp || 0;
    const totalCost = costPerUnit * qty;
    const mrpTotal = (pd.mrp || item.unitPrice || 0) * qty;
    const profit = sellPrice - totalCost;
    const margin = sellPrice > 0 && costPerUnit > 0 ? (profit / sellPrice) * 100 : null;
    return { ...item, qty, sellPrice, totalCost, mrpTotal, profit, margin, hasCost: costPerUnit > 0 };
  });

  const totalSell = items.reduce((s, i) => s + i.sellPrice, 0);
  const totalCost = items.reduce((s, i) => s + i.totalCost, 0);
  const totalMRP = items.reduce((s, i) => s + i.mrpTotal, 0);
  const totalProfit = totalSell - totalCost;
  const totalMargin = totalSell > 0 && totalCost > 0 ? (totalProfit / totalSell) * 100 : null;

  const badgeStyle = (m) => {
    if (m === null) return { background: '#edf2f7', color: '#718096' };
    if (m >= 20) return { background: '#c6f6d5', color: '#276749' };
    if (m >= 10) return { background: '#fefcbf', color: '#744210' };
    return { background: '#fed7d7', color: '#9b2c2c' };
  };

  return (
    <div className="aq-modal-overlay" onClick={onClose}>
      <div className="aq-margin-modal" onClick={e => e.stopPropagation()}>
        <div className="aq-margin-modal__header">
          <div>
            <h3>📊 Margin Analysis — {quotation.quotationNumber}</h3>
            <p>{quotation.clientName}</p>
          </div>
          <button className="aq-margin-modal__close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#a0aec0' }}>Loading product data...</div>
        ) : (
          <>
            <div className="aq-margin-summary">
              <div className="aq-margin-card">
                <span>Total MRP</span>
                <strong>{fmt(totalMRP)}</strong>
              </div>
              <div className="aq-margin-card aq-margin-card--sell">
                <span>Sell Price</span>
                <strong>{fmt(totalSell)}</strong>
              </div>
              <div className="aq-margin-card aq-margin-card--cost">
                <span>Our Cost</span>
                <strong>{fmt(totalCost)}</strong>
              </div>
              <div className={`aq-margin-card ${totalProfit >= 0 ? 'aq-margin-card--profit' : 'aq-margin-card--loss'}`}>
                <span>Gross Profit</span>
                <strong>{fmt(totalProfit)}</strong>
                {totalMargin !== null && <small>{totalMargin.toFixed(1)}% margin</small>}
              </div>
            </div>

            {totalMargin !== null && (
              <div className="aq-margin-bar-wrap">
                <div className="aq-margin-bar-label">
                  <span>Margin: {totalMargin.toFixed(1)}%</span>
                  <span style={{ fontSize: '0.875rem', color: '#718096' }}>
                    {totalMargin >= 20 ? '✅ Good' : totalMargin >= 10 ? '⚠️ Low' : '❌ Very Low'}
                  </span>
                </div>
                <div className="aq-margin-bar">
                  <div className="aq-margin-fill" style={{
                    width: `${Math.min(100, totalMargin)}%`,
                    background: totalMargin >= 20 ? '#48bb78' : totalMargin >= 10 ? '#ed8936' : '#e53e3e'
                  }} />
                </div>
              </div>
            )}

            <div className="aq-margin-table-wrap">
              <table className="aq-margin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>MRP</th>
                    <th>Sell Price</th>
                    <th>Our Cost</th>
                    <th>Profit</th>
                    <th>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.productName}</div>
                        {item.companyName && <div style={{ fontSize: '0.78rem', color: '#4f46e5' }}>{item.companyName}</div>}
                      </td>
                      <td>{item.qty}</td>
                      <td>{fmt(item.mrpTotal)}</td>
                      <td>{fmt(item.sellPrice)}</td>
                      <td>{item.hasCost ? fmt(item.totalCost) : <span style={{ color: '#a0aec0' }}>—</span>}</td>
                      <td style={{ fontWeight: 600, color: item.hasCost ? (item.profit >= 0 ? '#276749' : '#c53030') : '#a0aec0' }}>
                        {item.hasCost ? fmt(item.profit) : '—'}
                      </td>
                      <td>
                        <span style={{ ...badgeStyle(item.margin), padding: '2px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {item.margin !== null ? `${item.margin.toFixed(1)}%` : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ fontWeight: 700 }}>TOTAL</td>
                    <td style={{ fontWeight: 700 }}>{fmt(totalMRP)}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(totalSell)}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(totalCost)}</td>
                    <td style={{ fontWeight: 700, color: totalProfit >= 0 ? '#276749' : '#c53030' }}>{fmt(totalProfit)}</td>
                    <td>
                      {totalMargin !== null && (
                        <span style={{ ...badgeStyle(totalMargin), padding: '2px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {totalMargin.toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function AdminQuotations() {
  const { showNotification } = useNotification();
  const [quotations, setQuotations] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ all: 0, pending_approval: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [marginQuotation, setMarginQuotation] = useState(null); // for margin modal

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (search) params.append('search', search);
      const res = await fetch(`${API_URL}/quotations?${params}`);
      const data = await res.json();
      if (data.success) {
        setQuotations(data.quotations);
        setStatusCounts(data.statusCounts || {});
      }
    } catch (err) {
      showNotification('Failed to fetch quotations', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

  const handleSaveQuotation = () => {
    showNotification('Quotation saved successfully!', 'success');
    setShowForm(false);
    setEditingQuotation(null);
    fetchQuotations();
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_URL}/quotations/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Admin' })
      });
      const data = await res.json();
      if (data.success) { showNotification('Quotation approved!', 'success'); fetchQuotations(); }
    } catch { showNotification('Failed to approve', 'error'); }
  };

  const openRejectModal = (q) => { setRejectTarget(q); setRejectReason(''); setShowRejectModal(true); };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      const res = await fetch(`${API_URL}/quotations/${rejectTarget._id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectedBy: 'Admin', rejectionReason: rejectReason })
      });
      const data = await res.json();
      if (data.success) { showNotification('Quotation rejected', 'info'); setShowRejectModal(false); fetchQuotations(); }
    } catch { showNotification('Failed to reject', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quotation?')) return;
    try {
      await fetch(`${API_URL}/quotations/${id}`, { method: 'DELETE' });
      showNotification('Quotation deleted', 'success');
      fetchQuotations();
    } catch { showNotification('Failed to delete', 'error'); }
  };

  const handleGeneratePDF = async (quotation) => {
    const roomsMap = {};
    (quotation.items || []).forEach(item => {
      const roomName = item.roomName || 'Products';
      const areaName = item.areaName || 'General';
      if (!roomsMap[roomName]) roomsMap[roomName] = {};
      if (!roomsMap[roomName][areaName]) roomsMap[roomName][areaName] = [];
      roomsMap[roomName][areaName].push({
        productName: item.productName, companyName: item.companyName,
        categoryName: item.categoryName, quantity: item.quantity,
        unitPrice: item.unitPrice, rate: item.unitPrice,
        discountPercent: item.discountPercent || 0, totalPrice: item.totalPrice,
        image: item.image, images: item.image ? [item.image] : [], sku: item.sku, areaName
      });
    });
    const rooms = Object.entries(roomsMap).map(([roomName, areas]) => ({
      name: roomName,
      areas: Object.entries(areas).map(([areaName, products]) => ({
        id: areaName.toLowerCase().replace(/\s+/g, '_'), name: areaName, products
      }))
    }));
    await QuotationPDFGenerator({
      quotationNumber: quotation.quotationNumber,
      quotationDate: quotation.quotationDate || quotation.createdAt,
      quotationValidity: quotation.quotationValidity,
      deliveryTime: quotation.deliveryTime,
      paymentTerms: quotation.paymentTerms,
      specialInstructions: quotation.specialInstructions,
      gstRate: quotation.gstRate || 18,
      columnFormat: 'format2',
      rooms, items: quotation.items || [],
      clientData: {
        clientName: quotation.clientName, customerName: quotation.clientName,
        companyName: quotation.companyName || quotation.clientName,
        email: quotation.clientEmail, customerEmail: quotation.clientEmail,
        phone: quotation.clientPhone, mobileNumber: quotation.clientPhone,
        customerPhone: quotation.clientPhone, address: quotation.clientAddress,
        customerAddress: quotation.clientAddress, gstNumber: quotation.clientGST,
        customerGST: quotation.clientGST, projectLocation: quotation.projectLocation,
        attention: quotation.attention
      }
    });
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const fmtCur = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  if (showForm) {
    return (
      <AdminBudgetPlanForm
        onClose={() => { setShowForm(false); setEditingQuotation(null); }}
        onSuccess={handleSaveQuotation}
      />
    );
  }

  return (
    <div className="admin-quotations">
      <div className="admin-quotations__header">
        <div>
          <h1>📋 Quotations</h1>
          <p>Manage and create quotations for clients</p>
        </div>
        <button className="admin-quotations__create-btn" onClick={() => { setEditingQuotation(null); setShowForm(true); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create New Quotation
        </button>
      </div>

      <div className="aq-tabs">
        {STATUS_TABS.map(tab => (
          <button key={tab.key} className={`aq-tab ${activeTab === tab.key ? 'aq-tab--active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
            <span className="aq-tab__count">{statusCounts[tab.key] || 0}</span>
          </button>
        ))}
      </div>

      <div className="aq-search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Search by name, phone, quotation number..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="aq-loading">Loading quotations...</div>
      ) : quotations.length === 0 ? (
        <div className="aq-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <h3>No quotations found</h3>
          <p>Create your first quotation to get started</p>
        </div>
      ) : (
        <div className="aq-table-wrap">
          <table className="aq-table">
            <thead>
              <tr>
                <th>Quotation #</th><th>Client</th><th>Items</th><th>Total</th>
                <th>Delivered</th><th>Paid</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map(q => {
                const badge = STATUS_BADGE[q.status] || { label: q.status, cls: 'badge--neutral' };
                const balance = (q.total || 0) - (q.totalPaid || 0);
                return (
                  <tr key={q._id}>
                    <td className="aq-qnum">{q.quotationNumber}</td>
                    <td>
                      <div className="aq-client">
                        <strong>{q.clientName}</strong>
                        {q.clientPhone && <span>{q.clientPhone}</span>}
                      </div>
                    </td>
                    <td>{(q.items || []).length} items</td>
                    <td className="aq-amount">{fmtCur(q.total)}</td>
                    <td>
                      <span className={`aq-mini-badge ${q.deliveryStatus === 'completed' ? 'badge--success' : q.deliveryStatus === 'partial' ? 'badge--warning' : 'badge--neutral'}`}>
                        {fmtCur(q.totalDelivered || 0)}
                      </span>
                    </td>
                    <td>
                      <div className="aq-payment-cell">
                        <span className={`aq-mini-badge ${q.paymentStatus === 'paid' ? 'badge--success' : q.paymentStatus === 'partial' ? 'badge--warning' : 'badge--neutral'}`}>
                          {fmtCur(q.totalPaid || 0)}
                        </span>
                        {balance > 0 && <span className="aq-balance">Due: {fmtCur(balance)}</span>}
                      </div>
                    </td>
                    <td><span className={`aq-badge ${badge.cls}`}>{badge.label}</span></td>
                    <td>{fmtDate(q.quotationDate)}</td>
                    <td>
                      <div className="aq-actions">
                        {/* PDF */}
                        <button className="aq-btn aq-btn--pdf" title="Download PDF" onClick={() => handleGeneratePDF(q)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </button>
                        {/* Margin Analysis */}
                        <button className="aq-btn aq-btn--margin" title="Margin Analysis" onClick={() => setMarginQuotation(q)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="20" x2="18" y2="10"/>
                            <line x1="12" y1="20" x2="12" y2="4"/>
                            <line x1="6" y1="20" x2="6" y2="14"/>
                          </svg>
                        </button>
                        {/* Approve */}
                        {q.status === 'pending_approval' && (
                          <button className="aq-btn aq-btn--approve" title="Approve" onClick={() => handleApprove(q._id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </button>
                        )}
                        {/* Reject */}
                        {q.status === 'pending_approval' && (
                          <button className="aq-btn aq-btn--reject" title="Reject" onClick={() => openRejectModal(q)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        )}
                        {/* Edit */}
                        <button className="aq-btn aq-btn--edit" title="Edit" onClick={() => { setEditingQuotation(q); setShowForm(true); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        {/* Delete */}
                        <button className="aq-btn aq-btn--delete" title="Delete" onClick={() => handleDelete(q._id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="aq-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="aq-modal" onClick={e => e.stopPropagation()}>
            <h3>Reject Quotation</h3>
            <p>Quotation: <strong>{rejectTarget?.quotationNumber}</strong></p>
            <label>Reason (optional)</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter rejection reason..." rows={3} />
            <div className="aq-modal-actions">
              <button className="aq-btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="aq-btn-danger" onClick={handleReject}>Reject Quotation</button>
            </div>
          </div>
        </div>
      )}

      {/* Margin Analysis Modal */}
      {marginQuotation && (
        <MarginModal quotation={marginQuotation} onClose={() => setMarginQuotation(null)} />
      )}
    </div>
  );
}

export default AdminQuotations;
