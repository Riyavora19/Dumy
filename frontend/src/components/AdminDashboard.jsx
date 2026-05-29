import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Filler
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import './AdminDashboard.css';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Filler
);

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://dumy-2-mli2.onrender.com/api';

const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalCompanies: 0,
    totalClients: 0,
    totalInquiries: 0,
    totalBudgetPlans: 0,
    totalContacts: 0,
    totalOrders: 0,
    totalReferrers: 0,
    recentInquiries: [],
    recentBudgetPlans: [],
    recentOrders: [],
    lowStockProducts: [],
    // chart data
    quotationStatusData: [],
    deliveryPaymentData: [],
    productsByCompany: [],
    quotationTrend: [],
    totalQuotations: 0,
    totalQuotationValue: 0,
    totalDelivered: 0,
    totalCollected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        productsRes,
        categoriesRes,
        companiesRes,
        clientsRes,
        inquiriesRes,
        budgetPlansRes,
        contactsRes,
        ordersRes,
        quotationsRes
      ] = await Promise.all([
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/companies`),
        axios.get(`${API_BASE}/clients`),
        axios.get(`${API_BASE}/inquiries`),
        axios.get(`${API_BASE}/budget-plans`),
        axios.get(`${API_BASE}/contacts`),
        axios.get(`${API_BASE}/orders`),
        axios.get(`${API_BASE}/quotations?limit=100`).catch(() => ({ data: { quotations: [] } }))
      ]);

      const products = productsRes.data.data || [];
      const lowStock = products.filter(p => p.stock < 10).slice(0, 5);
      const inquiries = inquiriesRes.data.data || [];
      const budgetPlans = budgetPlansRes.data || [];
      const contacts = contactsRes.data.contacts || [];
      const referrers = contacts.filter(c => c.isReferrer);
      const orders = ordersRes.data.orders || [];
      const quotations = quotationsRes.data.quotations || [];

      // ── Chart 1: Quotation status breakdown (Pie) ──
      const statusCount = { pending_approval: 0, approved: 0, rejected: 0, draft: 0 };
      quotations.forEach(q => { statusCount[q.status] = (statusCount[q.status] || 0) + 1; });
      const quotationStatusData = [
        { name: 'Pending', value: statusCount.pending_approval, color: '#ed8936' },
        { name: 'Approved', value: statusCount.approved, color: '#48bb78' },
        { name: 'Rejected', value: statusCount.rejected, color: '#e53e3e' },
        { name: 'Draft', value: statusCount.draft, color: '#a0aec0' },
      ].filter(d => d.value > 0);

      // ── Chart 2: Delivery & Payment status (Bar) ──
      const approvedQuotations = quotations.filter(q => q.status === 'approved');
      const deliveryPaymentData = [
        { name: 'Not Started', deliveries: approvedQuotations.filter(q => q.deliveryStatus === 'not_started').length, payments: approvedQuotations.filter(q => q.paymentStatus === 'unpaid').length },
        { name: 'Partial', deliveries: approvedQuotations.filter(q => q.deliveryStatus === 'partial').length, payments: approvedQuotations.filter(q => q.paymentStatus === 'partial').length },
        { name: 'Completed', deliveries: approvedQuotations.filter(q => q.deliveryStatus === 'completed').length, payments: approvedQuotations.filter(q => q.paymentStatus === 'paid').length },
      ];

      // ── Chart 3: Products by company (Bar) ──
      const companyCount = {};
      products.forEach(p => {
        const name = p.companyName || 'Unknown';
        companyCount[name] = (companyCount[name] || 0) + 1;
      });
      const productsByCompany = Object.entries(companyCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // ── Chart 4: Quotation value trend by month ──
      const monthMap = {};
      quotations.forEach(q => {
        const d = new Date(q.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
        if (!monthMap[key]) monthMap[key] = { label, value: 0, count: 0 };
        monthMap[key].value += q.total || 0;
        monthMap[key].count += 1;
      });
      const quotationTrend = Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([, v]) => ({ name: v.label, value: Math.round(v.value), count: v.count }));

      // ── Summary numbers ──
      const totalQuotationValue = quotations.reduce((s, q) => s + (q.total || 0), 0);
      const totalDelivered = quotations.reduce((s, q) => s + (q.totalDelivered || 0), 0);
      const totalCollected = quotations.reduce((s, q) => s + (q.totalPaid || 0), 0);

      setStats({
        totalProducts: products.length,
        totalCategories: categoriesRes.data.data?.length || 0,
        totalCompanies: companiesRes.data.data?.length || 0,
        totalClients: clientsRes.data.data?.length || 0,
        totalInquiries: inquiries.length,
        totalBudgetPlans: budgetPlans.length,
        totalContacts: contacts.length,
        totalOrders: orders.length,
        totalReferrers: referrers.length,
        recentInquiries: inquiries.slice(0, 5),
        recentBudgetPlans: budgetPlans.slice(0, 5),
        recentOrders: orders.slice(0, 5),
        lowStockProducts: lowStock,
        quotationStatusData,
        deliveryPaymentData,
        productsByCompany,
        quotationTrend,
        totalQuotations: quotations.length,
        totalQuotationValue,
        totalDelivered,
        totalCollected,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard__loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__header">
        <h1>Dashboard Overview</h1>
        <p className="admin-dashboard__subtitle">Welcome to your admin panel</p>
      </header>

      {/* Stats Cards */}
      <div className="admin-dashboard__stats">
        <div className="admin-dashboard__stat-card" onClick={() => onNavigate('products')} style={{ cursor: 'pointer' }}>
          <div className="admin-dashboard__stat-icon" style={{ background: '#667eea' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="admin-dashboard__stat-card" onClick={() => onNavigate('categories')} style={{ cursor: 'pointer' }}>
          <div className="admin-dashboard__stat-icon" style={{ background: '#f093fb' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>{stats.totalCategories}</h3>
            <p>Categories</p>
          </div>
        </div>

        <div className="admin-dashboard__stat-card" onClick={() => onNavigate('companies')} style={{ cursor: 'pointer' }}>
          <div className="admin-dashboard__stat-icon" style={{ background: '#4facfe' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>{stats.totalCompanies}</h3>
            <p>Companies</p>
          </div>
        </div>

        <div className="admin-dashboard__stat-card" onClick={() => onNavigate('clients')} style={{ cursor: 'pointer' }}>
          <div className="admin-dashboard__stat-icon" style={{ background: '#38b2ac' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>{stats.totalClients}</h3>
            <p>Clients</p>
          </div>
        </div>

        <div className="admin-dashboard__stat-card" onClick={() => onNavigate('inquiries')} style={{ cursor: 'pointer' }}>
          <div className="admin-dashboard__stat-icon" style={{ background: '#43e97b' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>{stats.totalInquiries}</h3>
            <p>Inquiries</p>
          </div>
        </div>

        <div className="admin-dashboard__stat-card" onClick={() => onNavigate('budget-plans')} style={{ cursor: 'pointer' }}>
          <div className="admin-dashboard__stat-icon" style={{ background: '#fa709a' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>{stats.totalBudgetPlans}</h3>
            <p>Budget Plans</p>
          </div>
        </div>

        <div className="admin-dashboard__stat-card" onClick={() => onNavigate('contacts')} style={{ cursor: 'pointer' }}>
          <div className="admin-dashboard__stat-icon" style={{ background: '#764ba2' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>{stats.totalContacts}</h3>
            <p>Contacts ({stats.totalReferrers} Referrers)</p>
          </div>
        </div>

        <div className="admin-dashboard__stat-card" onClick={() => onNavigate('orders')} style={{ cursor: 'pointer' }}>
          <div className="admin-dashboard__stat-icon" style={{ background: '#f093fb' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div className="admin-dashboard__stat-content">
            <h3>{stats.totalOrders}</h3>
            <p>Orders</p>
          </div>
        </div>
      </div>

      {/* ── CHARTS SECTION ── */}
      <div className="admin-dashboard__charts-header">
        <h2>Business Overview</h2>
        <div className="admin-dashboard__biz-stats">
          <div className="admin-dashboard__biz-stat">
            <span>Total Quotations</span>
            <strong>{stats.totalQuotations}</strong>
          </div>
          <div className="admin-dashboard__biz-stat">
            <span>Quotation Value</span>
            <strong>₹{(stats.totalQuotationValue || 0).toLocaleString('en-IN')}</strong>
          </div>
          <div className="admin-dashboard__biz-stat admin-dashboard__biz-stat--green">
            <span>Total Delivered</span>
            <strong>₹{(stats.totalDelivered || 0).toLocaleString('en-IN')}</strong>
          </div>
          <div className="admin-dashboard__biz-stat admin-dashboard__biz-stat--blue">
            <span>Total Collected</span>
            <strong>₹{(stats.totalCollected || 0).toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>

      <div className="admin-dashboard__charts">
        {/* Chart 1: Quotation Status Pie */}
        <div className="admin-dashboard__chart-card">
          <h3>Quotation Status</h3>
          {stats.quotationStatusData.length === 0 ? (
            <div className="admin-dashboard__chart-empty">No quotations yet</div>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pie
                data={{
                  labels: stats.quotationStatusData.map(d => d.name),
                  datasets: [{
                    data: stats.quotationStatusData.map(d => d.value),
                    backgroundColor: stats.quotationStatusData.map(d => d.color),
                    borderWidth: 2,
                    borderColor: '#fff'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}` } } }
                }}
              />
            </div>
          )}
        </div>

        {/* Chart 2: Delivery & Payment Status Bar */}
        <div className="admin-dashboard__chart-card">
          <h3>Delivery & Payment Status</h3>
          {stats.deliveryPaymentData.every(d => d.deliveries === 0 && d.payments === 0) ? (
            <div className="admin-dashboard__chart-empty">No approved quotations yet</div>
          ) : (
            <div style={{ height: 220 }}>
              <Bar
                data={{
                  labels: stats.deliveryPaymentData.map(d => d.name),
                  datasets: [
                    { label: 'Deliveries', data: stats.deliveryPaymentData.map(d => d.deliveries), backgroundColor: '#4f46e5', borderRadius: 4 },
                    { label: 'Payments', data: stats.deliveryPaymentData.map(d => d.payments), backgroundColor: '#48bb78', borderRadius: 4 }
                  ]
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } },
                  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } }
                }}
              />
            </div>
          )}
        </div>

        {/* Chart 3: Products by Company Bar */}
        <div className="admin-dashboard__chart-card">
          <h3>Products by Company</h3>
          {stats.productsByCompany.length === 0 ? (
            <div className="admin-dashboard__chart-empty">No products yet</div>
          ) : (
            <div style={{ height: 220 }}>
              <Bar
                data={{
                  labels: stats.productsByCompany.map(d => d.name),
                  datasets: [{
                    label: 'Products',
                    data: stats.productsByCompany.map(d => d.count),
                    backgroundColor: ['#4f46e5','#48bb78','#ed8936','#e53e3e','#38b2ac','#f093fb','#667eea','#764ba2'],
                    borderRadius: 4
                  }]
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: { legend: { display: false } },
                  scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } }
                }}
              />
            </div>
          )}
        </div>

        {/* Chart 4: Quotation Value Trend Line */}
        <div className="admin-dashboard__chart-card">
          <h3>Quotation Value Trend</h3>
          {stats.quotationTrend.length === 0 ? (
            <div className="admin-dashboard__chart-empty">No quotation data yet</div>
          ) : (
            <div style={{ height: 220 }}>
              <Line
                data={{
                  labels: stats.quotationTrend.map(d => d.name),
                  datasets: [{
                    label: 'Value (₹)',
                    data: stats.quotationTrend.map(d => d.value),
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79,70,229,0.08)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#4f46e5',
                    pointRadius: 4,
                    fill: true,
                    tension: 0.3
                  }]
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ₹${ctx.raw.toLocaleString('en-IN')}` } } },
                  scales: {
                    y: { beginAtZero: true, ticks: { callback: v => `₹${(v/1000).toFixed(0)}k` } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="admin-dashboard__grid">
        {/* Recent Inquiries */}
        <div className="admin-dashboard__card">
          <div className="admin-dashboard__card-header">
            <h2>Recent Inquiries</h2>
            <span className="admin-dashboard__badge">{stats.recentInquiries.length}</span>
          </div>
          <div className="admin-dashboard__card-content">
            {stats.recentInquiries.length === 0 ? (
              <p className="admin-dashboard__empty">No inquiries yet</p>
            ) : (
              <div className="admin-dashboard__list">
                {stats.recentInquiries.map((inquiry) => (
                  <div key={inquiry._id} className="admin-dashboard__list-item">
                    <div className="admin-dashboard__list-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div className="admin-dashboard__list-content">
                      <h4>{inquiry.name}</h4>
                      <p>{inquiry.email}</p>
                      <small>{new Date(inquiry.createdAt).toLocaleDateString()}</small>
                    </div>
                    <span className={`admin-dashboard__status admin-dashboard__status--${inquiry.status}`}>
                      {inquiry.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Budget Plans */}
        <div className="admin-dashboard__card">
          <div className="admin-dashboard__card-header">
            <h2>Recent Budget Plans</h2>
            <span className="admin-dashboard__badge">{stats.recentBudgetPlans.length}</span>
          </div>
          <div className="admin-dashboard__card-content">
            {stats.recentBudgetPlans.length === 0 ? (
              <p className="admin-dashboard__empty">No budget plans yet</p>
            ) : (
              <div className="admin-dashboard__list">
                {stats.recentBudgetPlans.map((plan) => (
                  <div key={plan._id} className="admin-dashboard__list-item">
                    <div className="admin-dashboard__list-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      </svg>
                    </div>
                    <div className="admin-dashboard__list-content">
                      <h4>{plan.roomName}</h4>
                      <p>Budget: ₹{plan.totalBudget?.toLocaleString('en-IN')}</p>
                      <small>{new Date(plan.createdAt).toLocaleDateString()}</small>
                    </div>
                    <span className={`admin-dashboard__status admin-dashboard__status--${plan.status}`}>
                      {plan.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="admin-dashboard__card">
          <div className="admin-dashboard__card-header">
            <h2>Recent Orders</h2>
            <span className="admin-dashboard__badge">{stats.recentOrders.length}</span>
          </div>
          <div className="admin-dashboard__card-content">
            {stats.recentOrders.length === 0 ? (
              <p className="admin-dashboard__empty">No orders yet</p>
            ) : (
              <div className="admin-dashboard__list">
                {stats.recentOrders.map((order) => (
                  <div key={order._id} className="admin-dashboard__list-item">
                    <div className="admin-dashboard__list-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                      </svg>
                    </div>
                    <div className="admin-dashboard__list-content">
                      <h4>{order.orderNumber}</h4>
                      <p>{order.customerName}</p>
                      <small>₹{order.total?.toLocaleString('en-IN')}</small>
                    </div>
                    <span className={`admin-dashboard__status admin-dashboard__status--${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="admin-dashboard__card admin-dashboard__card--full">
          <div className="admin-dashboard__card-header">
            <h2>Low Stock Alert</h2>
            <span className="admin-dashboard__badge admin-dashboard__badge--warning">
              {stats.lowStockProducts.length}
            </span>
          </div>
          <div className="admin-dashboard__card-content">
            {stats.lowStockProducts.length === 0 ? (
              <p className="admin-dashboard__empty">All products are well stocked! 🎉</p>
            ) : (
              <div className="admin-dashboard__table-container">
                <table className="admin-dashboard__table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockProducts.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <div className="admin-dashboard__product">
                            {product.images && product.images[0] && (
                              <img 
                                src={`${product.images[0].startsWith('http') ? product.images[0] : 'https://dumy-2-mli2.onrender.com' + product.images[0]}`} 
                                alt={product.name}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/40x40/667eea/ffffff?text=?';
                                }}
                              />
                            )}
                            <span>{product.name}</span>
                          </div>
                        </td>
                        <td>{product.category?.name || 'N/A'}</td>
                        <td>₹{product.price?.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`admin-dashboard__stock ${product.stock === 0 ? 'admin-dashboard__stock--out' : 'admin-dashboard__stock--low'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td>
                          {product.stock === 0 ? (
                            <span className="admin-dashboard__status admin-dashboard__status--danger">Out of Stock</span>
                          ) : (
                            <span className="admin-dashboard__status admin-dashboard__status--warning">Low Stock</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-dashboard__actions">
        <h2>Quick Actions</h2>
        <div className="admin-dashboard__action-grid">
          <button className="admin-dashboard__action-btn" onClick={() => onNavigate('products')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Add Product</span>
          </button>
          <button className="admin-dashboard__action-btn" onClick={() => onNavigate('categories')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
            </svg>
            <span>Add Category</span>
          </button>
          <button className="admin-dashboard__action-btn" onClick={() => onNavigate('companies')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <span>Add Company</span>
          </button>
          <button className="admin-dashboard__action-btn" onClick={() => onNavigate('clients')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <span>Add Client</span>
          </button>
          <button className="admin-dashboard__action-btn" onClick={() => onNavigate('inquiries')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>View Inquiries</span>
          </button>
          <button className="admin-dashboard__action-btn" onClick={() => onNavigate('room-templates')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <span>Room Templates</span>
          </button>
          <button className="admin-dashboard__action-btn" onClick={() => onNavigate('item-types')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
            <span>Item Types</span>
          </button>
          <button className="admin-dashboard__action-btn" onClick={() => onNavigate('budget-plans')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>Budget Plans</span>
          </button>
          <button className="admin-dashboard__action-btn" onClick={() => onNavigate('contacts')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Manage Contacts</span>
          </button>
          <button className="admin-dashboard__action-btn" onClick={() => onNavigate('orders')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>Create Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
