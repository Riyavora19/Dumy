import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

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
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        productsRes,
        categoriesRes,
        companiesRes,
        clientsRes,
        inquiriesRes,
        budgetPlansRes,
        contactsRes,
        ordersRes
      ] = await Promise.all([
        axios.get('https://dumy-2-mli2.onrender.com/api/products'),
        axios.get('https://dumy-2-mli2.onrender.com/api/categories'),
        axios.get('https://dumy-2-mli2.onrender.com/api/companies'),
        axios.get('https://dumy-2-mli2.onrender.com/api/clients'),
        axios.get('https://dumy-2-mli2.onrender.com/api/inquiries'),
        axios.get('https://dumy-2-mli2.onrender.com/api/budget-plans'),
        axios.get('https://dumy-2-mli2.onrender.com/api/contacts'),
        axios.get('https://dumy-2-mli2.onrender.com/api/orders')
      ]);

      // Process products
      const products = productsRes.data.data || [];
      const lowStock = products.filter(p => p.stock < 10).slice(0, 5);

      // Process inquiries
      const inquiries = inquiriesRes.data.data || [];
      const recentInquiries = inquiries.slice(0, 5);

      // Process budget plans
      const budgetPlans = budgetPlansRes.data || [];
      const recentPlans = budgetPlans.slice(0, 5);

      // Process contacts
      const contacts = contactsRes.data.contacts || [];
      const referrers = contacts.filter(c => c.isReferrer);

      // Process orders
      const orders = ordersRes.data.orders || [];
      const recentOrders = orders.slice(0, 5);

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
        recentInquiries,
        recentBudgetPlans: recentPlans,
        recentOrders,
        lowStockProducts: lowStock
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
                                src={`https://dumy-2-mli2.onrender.com${product.images[0]}`} 
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
