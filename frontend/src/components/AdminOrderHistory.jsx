import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import './AdminOrderHistory.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://dumy-2-mli2.onrender.com/api';

function AdminOrderHistory() {
  const { showNotification } = useNotification();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [detail, setDetail] = useState(null); // { quotation, deliveries, payments }
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: 100 });
      if (search) params.append('search', search);
      const res = await fetch(`${API_URL}/quotations?${params}`);
      const data = await res.json();
      if (data.success) setQuotations(data.quotations);
    } catch (err) {
      showNotification('Failed to load quotations', 'error');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

  const openDetail = async (quotation) => {
    setSelectedQuotation(quotation);
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_URL}/quotations/${quotation._id}`);
      const data = await res.json();
      if (data.success) setDetail(data);
    } catch (err) {
      showNotification('Failed to load history', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  // Build timeline events from quotation + deliveries + payments
  const buildTimeline = (q, deliveries, payments) => {
    const events = [];

    events.push({
      type: 'created',
      icon: '📋',
      title: 'Quotation Created',
      subtitle: `${q.quotationNumber} · ${(q.items || []).length} items`,
      amount: q.total,
      date: q.createdAt,
      color: '#4f46e5'
    });

    if (q.status === 'approved' || q.approvedAt) {
      events.push({
        type: 'approved',
        icon: '✅',
        title: 'Quotation Approved',
        subtitle: q.approvedBy ? `by ${q.approvedBy}` : '',
        date: q.approvedAt || q.updatedAt,
        color: '#276749'
      });
    }

    if (q.status === 'rejected' || q.rejectedAt) {
      events.push({
        type: 'rejected',
        icon: '❌',
        title: 'Quotation Rejected',
        subtitle: q.rejectionReason || (q.rejectedBy ? `by ${q.rejectedBy}` : ''),
        date: q.rejectedAt || q.updatedAt,
        color: '#c53030'
      });
    }

    (deliveries || []).forEach((d, idx) => {
      events.push({
        type: 'delivery',
        icon: '🚚',
        title: `Delivery #${idx + 1} Recorded`,
        subtitle: `${d.deliveryNumber} · ${(d.items || []).length} items`,
        amount: d.deliveryValue,
        date: d.deliveredDate || d.createdAt,
        color: '#2b6cb0',
        items: d.items,
        notes: d.notes,
        deliveredBy: d.deliveredBy
      });
    });

    (payments || []).forEach((p, idx) => {
      events.push({
        type: 'payment',
        icon: '💰',
        title: `Payment #${idx + 1} Received`,
        subtitle: `${p.paymentMethod?.replace('_', ' ').toUpperCase()} ${p.transactionId ? `· Ref: ${p.transactionId}` : ''}`,
        amount: p.amount,
        date: p.paymentDate || p.createdAt,
        color: '#276749',
        balance: p.balanceAfterThis,
        notes: p.notes
      });
    });

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    return events;
  };

  const STATUS_BADGE = {
    pending_approval: { label: 'Pending Approval', cls: 'oh-badge--warning' },
    approved:         { label: 'Approved',          cls: 'oh-badge--success' },
    rejected:         { label: 'Rejected',           cls: 'oh-badge--danger' },
    draft:            { label: 'Draft',              cls: 'oh-badge--neutral' },
  };

  return (
    <div className="admin-order-history">
      <div className="oh-header">
        <div>
          <h1>📊 Order History</h1>
          <p>Complete timeline for every quotation — creation, approval, deliveries, and payments</p>
        </div>
      </div>

      <div className="oh-layout">
        {/* Left: Quotation list */}
        <div className="oh-left">
          <div className="oh-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search quotations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="oh-loading">Loading...</div>
          ) : quotations.length === 0 ? (
            <div className="oh-empty">No quotations found</div>
          ) : (
            <div className="oh-list">
              {quotations.map(q => {
                const badge = STATUS_BADGE[q.status] || { label: q.status, cls: 'oh-badge--neutral' };
                return (
                  <div
                    key={q._id}
                    className={`oh-card ${selectedQuotation?._id === q._id ? 'oh-card--active' : ''}`}
                    onClick={() => openDetail(q)}
                  >
                    <div className="oh-card__top">
                      <span className="oh-card__num">{q.quotationNumber}</span>
                      <span className={`oh-badge ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <div className="oh-card__client">{q.clientName}</div>
                    <div className="oh-card__meta">
                      <span>{fmt(q.total)}</span>
                      <span>{fmtDate(q.quotationDate)}</span>
                    </div>
                    <div className="oh-card__stats">
                      <span>🚚 {fmt(q.totalDelivered || 0)}</span>
                      <span>💰 {fmt(q.totalPaid || 0)}</span>
                      {(q.total - (q.totalPaid || 0)) > 0 && (
                        <span className="oh-due">Due: {fmt(q.total - (q.totalPaid || 0))}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Timeline */}
        <div className="oh-right">
          {!selectedQuotation ? (
            <div className="oh-placeholder">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <p>Select a quotation to view its full history</p>
            </div>
          ) : detailLoading ? (
            <div className="oh-loading">Loading history...</div>
          ) : detail ? (
            <>
              {/* Quotation summary */}
              <div className="oh-detail-header">
                <div>
                  <h2>{detail.quotation.quotationNumber}</h2>
                  <p>{detail.quotation.clientName}
                    {detail.quotation.clientPhone && ` · ${detail.quotation.clientPhone}`}
                    {detail.quotation.clientEmail && ` · ${detail.quotation.clientEmail}`}
                  </p>
                </div>
                <span className={`oh-badge ${(STATUS_BADGE[detail.quotation.status] || {}).cls || 'oh-badge--neutral'}`}>
                  {(STATUS_BADGE[detail.quotation.status] || { label: detail.quotation.status }).label}
                </span>
              </div>

              {/* Financial summary */}
              <div className="oh-fin-summary">
                <div className="oh-fin-card">
                  <span>Quotation Total</span>
                  <strong>{fmt(detail.quotation.total)}</strong>
                </div>
                <div className="oh-fin-card oh-fin-card--delivered">
                  <span>Delivered</span>
                  <strong>{fmt(detail.quotation.totalDelivered)}</strong>
                  <small>{detail.quotation.total > 0 ? Math.round(((detail.quotation.totalDelivered || 0) / detail.quotation.total) * 100) : 0}%</small>
                </div>
                <div className="oh-fin-card oh-fin-card--paid">
                  <span>Collected</span>
                  <strong>{fmt(detail.quotation.totalPaid)}</strong>
                  <small>{detail.quotation.total > 0 ? Math.round(((detail.quotation.totalPaid || 0) / detail.quotation.total) * 100) : 0}%</small>
                </div>
                <div className={`oh-fin-card ${(detail.quotation.total - (detail.quotation.totalPaid || 0)) > 0 ? 'oh-fin-card--due' : 'oh-fin-card--clear'}`}>
                  <span>Balance Due</span>
                  <strong>{fmt(detail.quotation.total - (detail.quotation.totalPaid || 0))}</strong>
                </div>
              </div>

              {/* Timeline */}
              <div className="oh-timeline">
                <h3>Full Timeline</h3>
                {buildTimeline(detail.quotation, detail.deliveries, detail.payments).map((event, idx) => (
                  <div key={idx} className="oh-event">
                    <div className="oh-event__line">
                      <div className="oh-event__dot" style={{ background: event.color }}>{event.icon}</div>
                      <div className="oh-event__connector" />
                    </div>
                    <div className="oh-event__content">
                      <div className="oh-event__header">
                        <span className="oh-event__title">{event.title}</span>
                        {event.amount !== undefined && (
                          <span className="oh-event__amount" style={{ color: event.color }}>{fmt(event.amount)}</span>
                        )}
                      </div>
                      {event.subtitle && <div className="oh-event__subtitle">{event.subtitle}</div>}
                      {event.deliveredBy && <div className="oh-event__meta">Delivered by: {event.deliveredBy}</div>}
                      {event.balance !== undefined && (
                        <div className={`oh-event__meta ${event.balance > 0 ? 'oh-due' : 'oh-clear'}`}>
                          {event.balance > 0 ? `Balance remaining: ${fmt(event.balance)}` : 'Fully paid ✓'}
                        </div>
                      )}
                      {event.notes && <div className="oh-event__notes">{event.notes}</div>}
                      {event.items && event.items.length > 0 && (
                        <div className="oh-event__items">
                          {event.items.map((item, i) => (
                            <div key={i} className="oh-event__item">
                              <span>{item.productName}</span>
                              <span>×{item.quantityDelivered}</span>
                              <span>{fmt(item.totalPrice)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="oh-event__date">{fmtDateTime(event.date)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Products in quotation */}
              <div className="oh-products">
                <h3>Quotation Items ({(detail.quotation.items || []).length})</h3>
                <div className="oh-products-table-wrap">
                  <table className="oh-products-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Company</th>
                        <th>Room</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.quotation.items || []).map((item, i) => (
                        <tr key={i}>
                          <td>{item.productName}</td>
                          <td>{item.companyName || '-'}</td>
                          <td>{item.roomName || '-'}</td>
                          <td>{item.quantity}</td>
                          <td>{fmt(item.unitPrice)}</td>
                          <td>{fmt(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'right', fontWeight: 600 }}>Total:</td>
                        <td style={{ fontWeight: 700 }}>{fmt(detail.quotation.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default AdminOrderHistory;
