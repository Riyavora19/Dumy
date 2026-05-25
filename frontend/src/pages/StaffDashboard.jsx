import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import AdminBudgetPlanForm from '../components/AdminBudgetPlanForm';
import AdminBudgetPlans from '../components/AdminBudgetPlans';
import AdminOrderForm from '../components/AdminOrderForm';
import AdminOrders from '../components/AdminOrders';
import AdminContacts from '../components/AdminContacts';
import AdminProducts from '../components/AdminProducts';
import AdminCategories from '../components/AdminCategories';
import './StaffDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function StaffDashboard() {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [staffInfo, setStaffInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myQuotations: 0,
    myOrders: 0,
    todayQuotations: 0,
    todayOrders: 0
  });

  useEffect(() => {
    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (staffInfo) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffInfo]);

  const verifyAuth = async () => {
    const token = localStorage.getItem('staffToken');
    
    if (!token) {
      navigate('/staff/login', { replace: true });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/staff/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      setStaffInfo(data);
      setLoading(false);
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('staffToken');
      localStorage.removeItem('staffInfo');
      navigate('/staff/login', { replace: true });
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('staffToken');
      
      // Fetch staff's quotations and orders
      const [quotationsRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/budget-plans?createdBy=${staffInfo._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/orders?createdBy=${staffInfo._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const quotations = await quotationsRes.json();
      const orders = await ordersRes.json();

      const today = new Date().toDateString();
      const todayQuotations = quotations.filter(q => 
        new Date(q.createdAt).toDateString() === today
      ).length;
      const todayOrders = (orders.orders || orders).filter(o => 
        new Date(o.createdAt).toDateString() === today
      ).length;

      setStats({
        myQuotations: quotations.length,
        myOrders: (orders.orders || orders).length,
        todayQuotations,
        todayOrders
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffInfo');
    navigate('/staff/login', { replace: true });
  };

  const canAccess = (permission) => {
    if (!staffInfo) return false;
    if (staffInfo.role === 'admin') return true;
    return staffInfo.permissions?.[permission] === true;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#718096'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      {/* Sidebar */}
      <aside className="staff-dashboard__sidebar">
        <div className="staff-dashboard__sidebar-header">
          <div className="staff-dashboard__logo">
            <div className="staff-dashboard__logo-icon">S</div>
            <span>Staff Panel</span>
          </div>
        </div>

        <div className="staff-dashboard__profile">
          <div className="staff-dashboard__profile-avatar">
            {staffInfo.name.charAt(0).toUpperCase()}
          </div>
          <div className="staff-dashboard__profile-info">
            <h3>{staffInfo.name}</h3>
            <p>{staffInfo.role.replace('_', ' ')}</p>
            <span className="staff-dashboard__employee-id">{staffInfo.employeeId}</span>
          </div>
        </div>

        <nav className="staff-dashboard__nav">
          <button 
            className={`staff-dashboard__nav-item ${activeMenu === 'dashboard' ? 'staff-dashboard__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9"/>
              <rect x="14" y="3" width="7" height="5"/>
              <rect x="14" y="12" width="7" height="9"/>
              <rect x="3" y="16" width="7" height="5"/>
            </svg>
            <span>Dashboard</span>
          </button>

          {canAccess('canCreateQuotation') && (
            <button 
              className={`staff-dashboard__nav-item ${activeMenu === 'create-quotation' ? 'staff-dashboard__nav-item--active' : ''}`}
              onClick={() => setActiveMenu('create-quotation')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Create Quotation</span>
            </button>
          )}

          {(canAccess('canViewAllQuotations') || canAccess('canCreateQuotation')) && (
            <button 
              className={`staff-dashboard__nav-item ${activeMenu === 'quotations' ? 'staff-dashboard__nav-item--active' : ''}`}
              onClick={() => setActiveMenu('quotations')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span>My Quotations</span>
            </button>
          )}

          {(canAccess('canViewAllOrders') || canAccess('canCreateOrder')) && (
            <button 
              className={`staff-dashboard__nav-item ${activeMenu === 'orders' ? 'staff-dashboard__nav-item--active' : ''}`}
              onClick={() => setActiveMenu('orders')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span>Orders</span>
            </button>
          )}

          {canAccess('canManageContacts') && (
            <button 
              className={`staff-dashboard__nav-item ${activeMenu === 'contacts' ? 'staff-dashboard__nav-item--active' : ''}`}
              onClick={() => setActiveMenu('contacts')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Customers</span>
            </button>
          )}

          {canAccess('canManageProducts') && (
            <button 
              className={`staff-dashboard__nav-item ${activeMenu === 'products' ? 'staff-dashboard__nav-item--active' : ''}`}
              onClick={() => setActiveMenu('products')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              <span>Products</span>
            </button>
          )}

          {canAccess('canManageCategories') && (
            <button 
              className={`staff-dashboard__nav-item ${activeMenu === 'categories' ? 'staff-dashboard__nav-item--active' : ''}`}
              onClick={() => setActiveMenu('categories')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>Categories</span>
            </button>
          )}
        </nav>

        <button className="staff-dashboard__signout" onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="staff-dashboard__main">
        {activeMenu === 'dashboard' && (
          <div className="staff-dashboard__content">
            <h2>Welcome, {staffInfo.name}!</h2>
            
            <div className="staff-dashboard__stats">
              <div className="stat-card">
                <div className="stat-card__icon" style={{ background: '#bee3f8' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2c5282" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className="stat-card__content">
                  <h3>My Quotations</h3>
                  <p className="stat-card__number">{stats.myQuotations}</p>
                  <p className="stat-card__subtitle">Total created</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card__icon" style={{ background: '#c6f6d5' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22543d" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <div className="stat-card__content">
                  <h3>My Orders</h3>
                  <p className="stat-card__number">{stats.myOrders}</p>
                  <p className="stat-card__subtitle">Total created</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card__icon" style={{ background: '#feebc8' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c2d12" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="stat-card__content">
                  <h3>Today's Quotations</h3>
                  <p className="stat-card__number">{stats.todayQuotations}</p>
                  <p className="stat-card__subtitle">Created today</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card__icon" style={{ background: '#fed7d7' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c53030" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className="stat-card__content">
                  <h3>Today's Orders</h3>
                  <p className="stat-card__number">{stats.todayOrders}</p>
                  <p className="stat-card__subtitle">Created today</p>
                </div>
              </div>
            </div>

            <div className="staff-dashboard__quick-actions">
              <h3>Quick Actions</h3>
              <div className="quick-actions-grid">
                {canAccess('canCreateQuotation') && (
                  <button 
                    className="quick-action-btn"
                    onClick={() => setActiveMenu('create-quotation')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Create New Quotation
                  </button>
                )}
                {canAccess('canManageContacts') && (
                  <button 
                    className="quick-action-btn"
                    onClick={() => setActiveMenu('contacts')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                    </svg>
                    Manage Customers
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'create-quotation' && (
          <AdminBudgetPlanForm 
            staffMode={true} 
            staffInfo={staffInfo}
            onClose={() => setActiveMenu('dashboard')}
          />
        )}

        {activeMenu === 'quotations' && (
          <AdminBudgetPlans staffMode={true} staffInfo={staffInfo} />
        )}

        {activeMenu === 'orders' && (
          <AdminOrders staffMode={true} staffInfo={staffInfo} />
        )}

        {activeMenu === 'contacts' && (
          <AdminContacts staffMode={true} staffInfo={staffInfo} />
        )}

        {activeMenu === 'products' && (
          <AdminProducts staffMode={true} staffInfo={staffInfo} />
        )}

        {activeMenu === 'categories' && (
          <AdminCategories staffMode={true} staffInfo={staffInfo} />
        )}
      </main>
    </div>
  );
}

export default StaffDashboard;
