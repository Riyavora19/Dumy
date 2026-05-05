import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './UserLogin.css';

const UserLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
      const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
      console.log('Submitting to:', `${API_URL}${endpoint}`);
      console.log('Form data:', { ...formData, password: '***' });
      
      const response = await axios.post(`${API_URL}${endpoint}`, formData);
      
      console.log('Response:', response.data);
      
      if (response.data.success) {
        // Store token and user info
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        
        // Redirect to home or profile
        navigate('/');
        
        // Reload to update navbar
        window.location.reload();
      }
    } catch (error) {
      console.error('Error details:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || `${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-login">
      <div className="user-login__container">
        <div className="user-login__header">
          <div className="user-login__logo">
            <div className="user-login__logo-icon">👤</div>
          </div>
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Login to your account' : 'Sign up to get started'}</p>
        </div>

        <form onSubmit={handleSubmit} className="user-login__form">
          {error && (
            <div className="user-login__error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="user-login__field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
          )}

          <div className="user-login__field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {!isLogin && (
            <div className="user-login__field">
              <label>Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91-9876543210"
                autoComplete="tel"
              />
            </div>
          )}

          <div className="user-login__field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {isLogin && (
            <div className="user-login__forgot">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          )}

          <button type="submit" className="user-login__submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="user-login__toggle">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setIsLogin(false)}>Sign Up</button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)}>Login</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
