import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import './AdminPayments.css';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

const PAYMENT_STATUS = {
  unpaid:  { label: 'Unpaid',   cls: 'badge--danger' },
  partial: { label: 'Partial',  cls: 'badge--warning' },
  paid:    { label: 'Paid',     cls: 'badge--success' },
};

const PAYMENT_METHODS = ['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'other'];

function AdminPayments() {
  const { showNotification } = useNotification();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState('cash');
  const [formTxnId, setFormTxnId] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');

  const TABS = [
    { key: 'all',     label: 'All Approved' },
    { key: 'unpaid',  label: 'Unpaid' },
    { key: 'partial', label: 'Partial' },
    { key: 'paid',    label: 'Paid' },
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
        if (activeTab !== 'all') {
          list = list.filter(q => (q.paymentStatus || 'unpaid') === activeTab);
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
      const res = await fetch(`${API_URL}/payments/quotation/${quotation._id}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
        setPaymentSummary(data.summary);
      }
    } catch (err) {
      showNotification('Failed to load payments', 'error');
    }
  };

  const handleAddPayment = async () => {
    const amount = parseFloat(formAmount);
    if (!amount || amount <= 0) {
      showNotification('Enter a valid amount', 'error');
      return;
    }
    try {
      const payload = {
        quotation: selectedQuotation._id,
        amount,
        paymentMethod: formMethod,
        transactionId: formTxnId,
        paymentDate: formDate,
        notes: formNotes
      };
      const res = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Payment recorded!', 'success');
        setShowAddForm(false);
        setFormAmount('');
        setFormTxnId('');
        setFormNotes('');
        openQuotation(selectedQuotation);
        fetchQuotations();
      } else {
        showNotification(data.message || 'Failed to record payment', 'error');
      }
    } catch (err) {
      showNotification('Failed to record payment', 'error');
    }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await fetch(`${API_URL}/payments/${id}`, { method: 'DELETE' });
      showNotification('Payment deleted', 'success');
      openQuotation(selectedQuotation);
      fetchQuotations();
    } catch (err) {
      showNotification('Failed to delete', 'error');
    }
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className="admin-payments">
      <div className="ap-header">
        <div>
          <h1>💰 Payments</h1>
          <p>Track payments collected for approved quotations</p>
        </div>
      </div>

      <div className="ap-layout">
        {/* Left: Quotation list */}
        <div className="ap-left">
          <div className="ap-tabs">
            {TABS.map(t => (
              <button key={t.key} className={`ap-tab ${activeTab === t.key ? 'ap-tab--active' : ''}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="ap-search">
            <input
              type="text"
              placeholder="Search client or quotation #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="ap-loading">Loading...</div>
          ) : quotations.length === 0 ? (
            <div className="ap-empty">No approved quotations found</div>
          ) : (
            <div className="ap-list">
              {quotations.map(q => {
                const ps = PAYMENT_STATUS[q.paymentStatus || 'unpaid'];
                const paid = q.totalPaid || 0;
                const total = q.total || 0;
                const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
                const balance = total - paid;
                return (
                  <div
                    key={q._id}
                    className={`ap-card ${selectedQuotation?._id === q._id ? 'ap-card--active' : ''}`}
                    onClick={() => openQuotation(q)}
                  >
                    <div className="ap-card__top">
                      <span className="ap-card__num">{q.quotationNumber}</span>
                      <span className={`ap-badge ${ps.cls}`}>{ps.label}</span>
                    </div>
                    <div className="ap-card__client">{q.clientName}</div>
                    <div className="ap-card__amounts">
                      <span>Total: {fmt(total)}</span>
                      <span>Paid: {fmt(paid)}</span>
                    </div>
                    {balance > 0 && <div className="ap-card__balance">Due: {fmt(balance)}</div>}
                    <div className="ap-progress-bar">
                      <div className="ap-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="ap-progress-label">{pct}% paid</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Payment detail */}
        <div className="ap-right">
          {!selectedQuotation ? (
            <div className="ap-placeholder">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <p>Select a quotation to manage payments</p>
            </div>
          ) : (
            <>
              <div className="ap-detail-header">
                <div>
                  <h2>{selectedQuotation.quotationNumber}</h2>
                  <p>{selectedQuotation.clientName} {selectedQuotation.clientPhone && `· ${selectedQuotation.clientPhone}`}</p>
                </div>
                <button className="ap-add-btn" onClick={() => setShowAddForm(true)}>+ Record Payment</button>
              </div>

              {/* Summary */}
              {paymentSummary && (
                <div className="ap-summary">
                  <div className="ap-summary-card">
                    <span>Quotation Total</span>
                    <strong>{fmt(paymentSummary.quotationTotal)}</strong>
                  </div>
                  <div className="ap-summary-card ap-summary-card--paid">
                    <span>Total Collected</span>
                    <strong>{fmt(paymentSummary.totalPaid)}</strong>
                  </div>
                  <div className={`ap-summary-card ${paymentSummary.balance > 0 ? 'ap-summary-card--due' : 'ap-summary-card--clear'}`}>
                    <span>{paymentSummary.balance > 0 ? 'Balance Due' : 'Overpaid'}</span>
                    <strong>{fmt(Math.abs(paymentSummary.balance))}</strong>
                  </div>
                </div>
              )}

              {/* Add payment form */}
              {showAddForm && (
                <div className="ap-form">
                  <h3>Record New Payment</h3>
                  <div className="ap-form-row">
                    <div className="ap-form-group">
                      <label>Amount (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Enter amount"
                        value={formAmount}
                        onChange={e => setFormAmount(e.target.value)}
                      />
                      {paymentSummary && paymentSummary.balance > 0 && (
                        <span className="ap-hint">Balance due: {fmt(paymentSummary.balance)}</span>
                      )}
                    </div>
                    <div className="ap-form-group">
                      <label>Payment Method</label>
                      <select value={formMethod} onChange={e => setFormMethod(e.target.value)}>
                        {PAYMENT_METHODS.map(m => (
                          <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="ap-form-row">
                    <div className="ap-form-group">
                      <label>Payment Date</label>
                      <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
                    </div>
                    <div className="ap-form-group">
                      <label>Transaction ID / Cheque No.</label>
                      <input type="text" placeholder="Optional" value={formTxnId} onChange={e => setFormTxnId(e.target.value)} />
                    </div>
                  </div>
                  <div className="ap-form-group">
                    <label>Notes</label>
                    <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Payment notes..." rows={2} />
                  </div>
                  <div className="ap-form-actions">
                    <button className="ap-btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                    <button className="ap-btn-primary" onClick={handleAddPayment}>Save Payment</button>
                  </div>
                </div>
              )}

              {/* Payment history */}
              <div className="ap-history">
                <h3>Payment History ({payments.length})</h3>
                {payments.length === 0 ? (
                  <div className="ap-empty">No payments recorded yet</div>
                ) : (
                  <>
                    {payments.map((p, idx) => (
                      <div key={p._id} className="ap-payment-card">
                        <div className="ap-payment-card__header">
                          <div>
                            <span className="ap-payment-num">Payment #{idx + 1} · {p.paymentNumber}</span>
                            <span className="ap-payment-date">{fmtDate(p.paymentDate)}</span>
                            <span className="ap-payment-method">{p.paymentMethod?.replace('_', ' ').toUpperCase()}</span>
                            {p.transactionId && <span className="ap-txn-id">Ref: {p.transactionId}</span>}
                          </div>
                          <div className="ap-payment-amount">{fmt(p.amount)}</div>
                        </div>
                        <div className="ap-payment-running">
                          <span>Cumulative paid: {fmt(p.totalPaidAfterThis)}</span>
                          <span className={p.balanceAfterThis > 0 ? 'ap-due' : 'ap-clear'}>
                            {p.balanceAfterThis > 0 ? `Balance: ${fmt(p.balanceAfterThis)}` : 'Fully paid ✓'}
                          </span>
                        </div>
                        {p.notes && <div className="ap-payment-notes">{p.notes}</div>}
                        <button className="ap-delete-btn" onClick={() => handleDeletePayment(p._id)}>Delete</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPayments;
