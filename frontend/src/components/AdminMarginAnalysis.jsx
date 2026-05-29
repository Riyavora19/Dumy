import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import './AdminMarginAnalysis.css';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://dumy-2-mli2.onrender.com/api';

function AdminMarginAnalysis() {
  const { showNotification } = useNotification();
  const [quotations, setQuotations] = useState([]);
  const [products, setProducts] = useState({}); // productId → { npp, sdp }
  const [loading, setLoading] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, pRes] = await Promise.all([
        fetch(`${API_URL}/quotations?status=approved&limit=100`),
        fetch(`${API_URL}/products?limit=200`)
      ]);
      const qData = await qRes.json();
      const pData = await pRes.json();

      if (qData.success) setQuotations(qData.quotations);

      // Build product price map
      const pMap = {};
      (pData.data || pData.products || []).forEach(p => {
        pMap[p._id] = { npp: p.npp || 0, sdp: p.sdp || 0, mrp: p.mrp || p.price || 0 };
      });
      setProducts(pMap);
    } catch (err) {
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
  const pct = (n, d) => d > 0 ? ((n / d) * 100).toFixed(1) + '%' : '0%';

  // Calculate margin for a quotation
  const calcMargin = (quotation) => {
    let totalSellPrice = 0;
    let totalPurchasePrice = 0;
    let totalMRP = 0;

    (quotation.items || []).forEach(item => {
      const qty = item.quantity || 1;
      const sellPrice = item.totalPrice || (item.unitPrice * qty);
      const productData = products[item.product] || {};
      const purchasePrice = (productData.npp || 0) * qty;
      const mrp = (productData.mrp || item.unitPrice || 0) * qty;

      totalSellPrice += sellPrice;
      totalPurchasePrice += purchasePrice;
      totalMRP += mrp;
    });

    const grossProfit = totalSellPrice - totalPurchasePrice;
    const marginPct = totalSellPrice > 0 ? (grossProfit / totalSellPrice) * 100 : 0;
    const discountFromMRP = totalMRP - totalSellPrice;

    return {
      totalSellPrice,
      totalPurchasePrice,
      totalMRP,
      grossProfit,
      marginPct,
      discountFromMRP
    };
  };

  const filtered = quotations.filter(q =>
    !search ||
    q.quotationNumber?.toLowerCase().includes(search.toLowerCase()) ||
    q.clientName?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedMargin = selectedQuotation ? calcMargin(selectedQuotation) : null;

  return (
    <div className="admin-margin">
      <div className="am-header">
        <div>
          <h1>📊 Margin Analysis</h1>
          <p>Track profit margins and earnings from approved quotations</p>
        </div>
      </div>

      <div className="am-layout">
        {/* Left: Quotation list */}
        <div className="am-left">
          <div className="am-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search quotation or client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="am-loading">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="am-empty">No approved quotations</div>
          ) : (
            <div className="am-list">
              {filtered.map(q => {
                const m = calcMargin(q);
                const marginColor = m.marginPct >= 20 ? '#276749' : m.marginPct >= 10 ? '#c05621' : '#c53030';
                return (
                  <div
                    key={q._id}
                    className={`am-card ${selectedQuotation?._id === q._id ? 'am-card--active' : ''}`}
                    onClick={() => setSelectedQuotation(q)}
                  >
                    <div className="am-card__top">
                      <span className="am-card__num">{q.quotationNumber}</span>
                      <span className="am-card__margin" style={{ color: marginColor }}>
                        {m.marginPct.toFixed(1)}% margin
                      </span>
                    </div>
                    <div className="am-card__client">{q.clientName}</div>
                    <div className="am-card__amounts">
                      <span>Sell: {fmt(m.totalSellPrice)}</span>
                      <span>Profit: {fmt(m.grossProfit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Detail */}
        <div className="am-right">
          {!selectedQuotation ? (
            <div className="am-placeholder">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <p>Select a quotation to view margin analysis</p>
            </div>
          ) : (
            <>
              <div className="am-detail-header">
                <div>
                  <h2>{selectedQuotation.quotationNumber}</h2>
                  <p>{selectedQuotation.clientName}{selectedQuotation.clientPhone && ` · ${selectedQuotation.clientPhone}`}</p>
                </div>
              </div>

              {/* Summary cards */}
              {selectedMargin && (
                <>
                  <div className="am-summary">
                    <div className="am-summary-card">
                      <span>Total MRP</span>
                      <strong>{fmt(selectedMargin.totalMRP)}</strong>
                      <small>Listed price</small>
                    </div>
                    <div className="am-summary-card am-summary-card--sell">
                      <span>Sell Price</span>
                      <strong>{fmt(selectedMargin.totalSellPrice)}</strong>
                      <small>Discount given: {fmt(selectedMargin.discountFromMRP)}</small>
                    </div>
                    <div className="am-summary-card am-summary-card--cost">
                      <span>Our Cost</span>
                      <strong>{fmt(selectedMargin.totalPurchasePrice)}</strong>
                      <small>Purchase price</small>
                    </div>
                    <div className={`am-summary-card ${selectedMargin.grossProfit >= 0 ? 'am-summary-card--profit' : 'am-summary-card--loss'}`}>
                      <span>Gross Profit</span>
                      <strong>{fmt(selectedMargin.grossProfit)}</strong>
                      <small>{selectedMargin.marginPct.toFixed(1)}% margin</small>
                    </div>
                  </div>

                  {/* Margin bar */}
                  <div className="am-margin-bar-wrap">
                    <div className="am-margin-bar-label">
                      <span>Margin: {selectedMargin.marginPct.toFixed(1)}%</span>
                      <span style={{ color: '#718096', fontSize: '0.875rem' }}>
                        {selectedMargin.marginPct >= 20 ? '✅ Good' : selectedMargin.marginPct >= 10 ? '⚠️ Low' : '❌ Very Low'}
                      </span>
                    </div>
                    <div className="am-margin-bar">
                      <div
                        className="am-margin-fill"
                        style={{
                          width: `${Math.min(100, selectedMargin.marginPct)}%`,
                          background: selectedMargin.marginPct >= 20 ? '#48bb78' : selectedMargin.marginPct >= 10 ? '#ed8936' : '#e53e3e'
                        }}
                      />
                    </div>
                  </div>

                  {/* Per-item breakdown */}
                  <div className="am-items">
                    <h3>Item-wise Margin Breakdown</h3>
                    <div className="am-items-table-wrap">
                      <table className="am-items-table">
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
                          {(selectedQuotation.items || []).map((item, idx) => {
                            const qty = item.quantity || 1;
                            const sellPrice = item.totalPrice || (item.unitPrice * qty);
                            const productData = products[item.product] || {};
                            const costPerUnit = productData.npp || 0;
                            const totalCost = costPerUnit * qty;
                            const mrpTotal = (productData.mrp || item.unitPrice || 0) * qty;
                            const profit = sellPrice - totalCost;
                            const itemMargin = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;
                            const marginColor = itemMargin >= 20 ? '#276749' : itemMargin >= 10 ? '#c05621' : '#c53030';

                            return (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>
                                  <div className="am-item-name">{item.productName}</div>
                                  {item.companyName && <div className="am-item-company">{item.companyName}</div>}
                                </td>
                                <td>{qty}</td>
                                <td>{fmt(mrpTotal)}</td>
                                <td>{fmt(sellPrice)}</td>
                                <td>{costPerUnit > 0 ? fmt(totalCost) : <span className="am-no-cost">—</span>}</td>
                                <td style={{ color: profit >= 0 ? '#276749' : '#c53030', fontWeight: 600 }}>
                                  {costPerUnit > 0 ? fmt(profit) : <span className="am-no-cost">—</span>}
                                </td>
                                <td>
                                  {costPerUnit > 0 ? (
                                    <span className="am-margin-badge" style={{ background: itemMargin >= 20 ? '#c6f6d5' : itemMargin >= 10 ? '#fefcbf' : '#fed7d7', color: marginColor }}>
                                      {itemMargin.toFixed(1)}%
                                    </span>
                                  ) : <span className="am-no-cost">—</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} style={{ fontWeight: 700 }}>TOTAL</td>
                            <td style={{ fontWeight: 700 }}>{fmt(selectedMargin.totalMRP)}</td>
                            <td style={{ fontWeight: 700 }}>{fmt(selectedMargin.totalSellPrice)}</td>
                            <td style={{ fontWeight: 700 }}>{fmt(selectedMargin.totalPurchasePrice)}</td>
                            <td style={{ fontWeight: 700, color: selectedMargin.grossProfit >= 0 ? '#276749' : '#c53030' }}>{fmt(selectedMargin.grossProfit)}</td>
                            <td>
                              <span className="am-margin-badge" style={{
                                background: selectedMargin.marginPct >= 20 ? '#c6f6d5' : selectedMargin.marginPct >= 10 ? '#fefcbf' : '#fed7d7',
                                color: selectedMargin.marginPct >= 20 ? '#276749' : selectedMargin.marginPct >= 10 ? '#c05621' : '#c53030'
                              }}>
                                {selectedMargin.marginPct.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMarginAnalysis;
