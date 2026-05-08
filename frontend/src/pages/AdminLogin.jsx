import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try staff login first
      let response;
      let isStaff = false;
      
      try {
        response = await axios.post('http://localhost:5000/api/staff/login', formData);
        isStaff = true;
      } catch (staffError) {
        // If staff login fails, try admin login
        try {
          response = await axios.post('http://localhost:5000/api/auth/login', formData);
          isStaff = false;
        } catch (adminError) {
          throw new Error('Invalid credentials');
        }
      }
      
      if (response.data.success) {
        if (isStaff) {
          // Store staff token and info
          localStorage.setItem('staffToken', response.data.token);
          localStorage.setItem('staffInfo', JSON.stringify(response.data.staff));
          
          // Store individual fields for easy access in PDF generation
          localStorage.setItem('staffId', response.data.staff.staffId || '');
          localStorage.setItem('staffName', response.data.staff.name || '');
          localStorage.setItem('staffPhone', response.data.staff.phone || '');
          localStorage.setItem('staffEmail', response.data.staff.email || '');
          
          // Redirect to staff dashboard
          navigate('/staff');
        } else {
          // Store admin token and info
          localStorage.setItem('adminToken', response.data.token);
          localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
          
          // Redirect to admin panel
          navigate('/admin');
        }
        
        // Reload to update navbar
        window.location.reload();
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__container">
        <div className="admin-login__header">
          <div className="admin-login__logo">
            <div className="admin-login__logo-icon">K</div>
          </div>
          <h1>Login</h1>
          <p>Enter your credentials to access the system</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login__form">
          {error && (
            <div className="admin-login__error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="admin-login__field">
            <label>Email or Staff ID</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@example.com or GTSS/HB"
              autoComplete="email"
            />
          </div>

          <div className="admin-login__field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="admin-login__submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
