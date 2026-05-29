import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import AdminBudgetPlanForm from './AdminBudgetPlanForm';
import QuotationPDFGenerator from './QuotationPDFGenerator';
import './AdminQuotations.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://dumy-2-mli2.onrender.com/api';

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
      console.error(err);
      showNotification('Failed to fetch quotations', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

  // Save quotation from form — the form now calls /api/quotations directly
  // and passes back the saved quotation object. We just refresh the list.
  const handleSaveQuotation = (savedQuotation) => {
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
      if (data.success) {
        showNotification('Quotation approved!', 'success');
        fetchQuotations();
      }
    } catch (err) {
      showNotification('Failed to approve', 'error');
    }
  };

  const openRejectModal = (quotation) => {
    setRejectTarget(quotation);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      const res = await fetch(`${API_URL}/quotations/${rejectTarget._id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectedBy: 'Admin', rejectionReason: rejectReason })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Quotation rejected', 'info');
        setShowRejectModal(false);
        fetchQuotations();
      }
    } catch (err) {
      showNotification('Failed to reject', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quotation?')) return;
    try {
      await fetch(`${API_URL}/quotations/${id}`, { method: 'DELETE' });
      showNotification('Quotation deleted', 'success');
      fetchQuotations();
    } catch (err) {
      showNotification('Failed to delete', 'error');
    }
  };

  const handleGeneratePDF = async (quotation) => {
    // Build legacy format for PDF generator
    const legacyFormat = {
      quotationNumber: quotation.quotationNumber,
      quotationDate: quotation.quotationDate,
      quotationValidity: quotation.quotationValidity,
      deliveryTime: quotation.deliveryTime,
      paymentTerms: quotation.paymentTerms,
      specialInstructions: quotation.specialInstructions,
      clientData: {
        clientName: quotation.clientName,
        email: quotation.clientEmail,
        phone: quotation.clientPhone,
        address: quotation.clientAddress,
        companyName: quotation.companyName,
        gst: quotation.clientGST
      },
      items: quotation.items,
      subtotal: quotation.subtotal,
      gstAmount: quotation.gstAmount,
      total: quotation.total,
      gst: quotation.gstRate
    };
    await QuotationPDFGenerator(legacyFormat);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const formatCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

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
      {/* Header */}
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

      {/* Tabs */}
      <div className="aq-tabs">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            className={`aq-tab ${activeTab === tab.key ? 'aq-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="aq-tab__count">{statusCounts[tab.key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="aq-search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search by name, phone, quotation number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
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
                <th>Quotation #</th>
                <th>Client</th>
                <th>Items</th>
                <th>Total</th>
                <th>Delivered</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
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
                    <td className="aq-amount">{formatCurrency(q.total)}</td>
                    <td>
                      <span className={`aq-mini-badge ${q.deliveryStatus === 'completed' ? 'badge--success' : q.deliveryStatus === 'partial' ? 'badge--warning' : 'badge--neutral'}`}>
                        {formatCurrency(q.totalDelivered || 0)}
                      </span>
                    </td>
                    <td>
                      <div className="aq-payment-cell">
                        <span className={`aq-mini-badge ${q.paymentStatus === 'paid' ? 'badge--success' : q.paymentStatus === 'partial' ? 'badge--warning' : 'badge--neutral'}`}>
                          {formatCurrency(q.totalPaid || 0)}
                        </span>
                        {balance > 0 && <span className="aq-balance">Due: {formatCurrency(balance)}</span>}
                      </div>
                    </td>
                    <td><span className={`aq-badge ${badge.cls}`}>{badge.label}</span></td>
                    <td>{formatDate(q.quotationDate)}</td>
                    <td>
                      <div className="aq-actions">
                        {/* PDF */}
                        <button className="aq-btn aq-btn--pdf" title="Download PDF" onClick={() => handleGeneratePDF(q)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
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
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
            />
            <div className="aq-modal-actions">
              <button className="aq-btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="aq-btn-danger" onClick={handleReject}>Reject Quotation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminQuotations;
