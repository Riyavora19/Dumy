import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import AdminDashboard from '../components/AdminDashboard';
import AdminCategories from '../components/AdminCategories';
import AdminProducts from '../components/AdminProducts';
import AdminProductsDebug from '../components/AdminProductsDebug';
import AdminCompanies from '../components/AdminCompanies';
import AdminClients from '../components/AdminClients';
import AdminInquiries from '../components/AdminInquiries';
import AdminLiveRequests from '../components/AdminLiveRequests';
import AdminRoomTemplates from '../components/AdminRoomTemplates';
import AdminItemTypes from '../components/AdminItemTypes';
import AdminBudgetPlans from '../components/AdminBudgetPlans';
import AdminBudgetPlanPresets from '../components/AdminBudgetPlanPresets';
import AdminReviews from '../components/AdminReviews';
import AdminQuotations from '../components/AdminQuotations';
import AdminContacts from '../components/AdminContacts';
import AdminOrders from '../components/AdminOrders';
import AdminCompanySettings from '../components/AdminCompanySettings';
import AdminQuotationSettings from '../components/AdminQuotationSettings';
import AdminStaff from '../components/AdminStaff';
import './Admin.css';

const Admin = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    try {
      const response = await axios.get('https://dumy-2-mli2.onrender.com/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAdminInfo(response.data.admin);
        setLoading(false);
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login', { replace: true });
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      navigate('/admin/login', { replace: true });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login', { replace: true });
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
    <div className="admin">
      {/* Sidebar */}
      <aside className="admin__sidebar">
        <div className="admin__sidebar-header">
          <div className="admin__logo">
            <div className="admin__logo-icon">K</div>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin__nav">
          <button 
            className={`admin__nav-item ${activeMenu === 'dashboard' ? 'admin__nav-item--active' : ''}`}
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

          <button 
            className={`admin__nav-item ${activeMenu === 'inquiries' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('inquiries')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Inquiries</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'categories' ? 'admin__nav-item--active' : ''}`}
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

          <button 
            className={`admin__nav-item ${activeMenu === 'products' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('products')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <span>Products</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'reviews' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('reviews')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>Reviews</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'companies' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('companies')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Companies</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'clients' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('clients')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Clients</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'contacts' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('contacts')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Contacts & Network</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'orders' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('orders')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>Orders</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'staff' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('staff')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Staff Management</span>
          </button>

          <div className="admin__nav-divider">Budget Planner</div>

          <button 
            className={`admin__nav-item ${activeMenu === 'room-templates' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('room-templates')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <span>Room Templates</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'item-types' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('item-types')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span>Item Types</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'budget-plans' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('budget-plans')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>Budget Plans</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'budget-plan-presets' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('budget-plan-presets')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Plan Presets</span>
          </button>

          <div className="admin__nav-divider">Other</div>

          <button 
            className={`admin__nav-item ${activeMenu === 'quotations' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('quotations')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>Quotations</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'quotation-settings' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('quotation-settings')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <circle cx="12" cy="15" r="2"/>
              <path d="M12 12v1m0 4v1"/>
            </svg>
            <span>Quotation Settings</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'company-settings' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('company-settings')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m-6-6h6m6 0h-6"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>Company Settings</span>
          </button>

          <button className="admin__nav-item" onClick={() => setActiveMenu('clients')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Clients</span>
          </button>

          <button 
            className={`admin__nav-item ${activeMenu === 'live-requests' ? 'admin__nav-item--active' : ''}`}
            onClick={() => setActiveMenu('live-requests')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Live Requests</span>
          </button>

          <button className="admin__nav-item" onClick={() => showNotification('Coming soon', 'info')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Deliveries</span>
          </button>

          <button className="admin__nav-item" onClick={() => showNotification('Coming soon', 'info')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span>Invoices</span>
          </button>

          <button className="admin__nav-item" onClick={() => showNotification('Coming soon', 'info')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>Purchase Orders</span>
          </button>

          <button className="admin__nav-item" onClick={() => showNotification('Coming soon', 'info')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>All Requests</span>
          </button>
        </nav>

        <button className="admin__signout" onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin__main">
        {activeMenu === 'dashboard' && (
          <AdminDashboard onNavigate={setActiveMenu} />
        )}

        {activeMenu === 'inquiries' && (
          <AdminInquiries />
        )}

        {activeMenu === 'categories' && (
          <AdminCategories />
        )}

        {activeMenu === 'products' && (
          <AdminProducts />
        )}

        {activeMenu === 'reviews' && (
          <AdminReviews />
        )}

        {activeMenu === 'companies' && (
          <AdminCompanies />
        )}

        {activeMenu === 'clients' && (
          <AdminClients />
        )}

        {activeMenu === 'staff' && (
          <AdminStaff />
        )}

        {activeMenu === 'live-requests' && (
          <AdminLiveRequests />
        )}

        {activeMenu === 'room-templates' && (
          <AdminRoomTemplates />
        )}

        {activeMenu === 'item-types' && (
          <AdminItemTypes />
        )}

        {activeMenu === 'budget-plans' && (
          <AdminBudgetPlans />
        )}

        {activeMenu === 'budget-plan-presets' && (
          <AdminBudgetPlanPresets />
        )}

        {activeMenu === 'quotations' && (
          <AdminQuotations />
        )}

        {activeMenu === 'quotation-settings' && (
          <AdminQuotationSettings />
        )}
        {activeMenu === 'contacts' && (
          <AdminContacts />
        )}

        {activeMenu === 'orders' && (
          <AdminOrders />
        )}

        {activeMenu === 'company-settings' && (
          <AdminCompanySettings />
        )}
      </main>
    </div>
  );
};

export default Admin;
