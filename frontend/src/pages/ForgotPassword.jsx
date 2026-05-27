import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('https://dumy-2-mli2.onrender.com/api/users/forgot-password', { email });
      
      if (response.data.success) {
        setSuccess(true);
        setResetUrl(response.data.resetUrl);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="forgot-password">
        <div className="forgot-password__container">
          <div className="forgot-password__success-icon">✓</div>
          <h1>Check Your Email</h1>
          <p>We've sent password reset instructions to <strong>{email}</strong></p>
          
          <div className="forgot-password__dev-info">
            <p><strong>Development Mode:</strong></p>
            <p>Reset link: <a href={resetUrl}>{resetUrl}</a></p>
            <small>In production, this link will be sent via email</small>
          </div>

          <Link to="/login" className="forgot-password__back-btn">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password">
      <div className="forgot-password__container">
        <div className="forgot-password__header">
          <div className="forgot-password__icon">🔒</div>
          <h1>Forgot Password?</h1>
          <p>Enter your email address and we'll send you instructions to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password__form">
          {error && (
            <div className="forgot-password__error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="forgot-password__field">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <button type="submit" className="forgot-password__submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="forgot-password__back">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
