import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StaffLogin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StaffLogin = () => {
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
      const response = await axios.post(`${API_URL}/api/staff/login`, formData);
      
      if (response.data.success) {
        // Store token and staff info
        localStorage.setItem('staffToken', response.data.token);
        localStorage.setItem('staffInfo', JSON.stringify(response.data.staff));
        
        // Store individual fields for easy access in PDF generation
        localStorage.setItem('staffId', response.data.staff.staffId || '');
        localStorage.setItem('staffName', response.data.staff.name || '');
        localStorage.setItem('staffPhone', response.data.staff.phone || '');
        localStorage.setItem('staffEmail', response.data.staff.email || '');
        
        // Redirect to staff dashboard
        navigate('/staff');
        
        // Reload to update navbar
        window.location.reload();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-login">
      <div className="staff-login__container">
        <div className="staff-login__header">
          <div className="staff-login__logo">
            <div className="staff-login__logo-icon">👨‍💼</div>
          </div>
          <h1>Staff Login</h1>
          <p>Access your staff dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="staff-login__form">
          {error && (
            <div className="staff-login__error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="staff-login__field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="staff@example.com"
              autoComplete="email"
            />
          </div>

          <div className="staff-login__field">
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

          <button type="submit" className="staff-login__submit" disabled={loading}>
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

        <div className="staff-login__footer">
          <p>Need help? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
