import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.data);
        setFormData({
          name: response.data.data.name,
          phone: response.data.data.phone || '',
          address: response.data.data.address || {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUser(response.data.data);
        setEditing(false);
        setSuccess('Profile updated successfully!');
        
        // Update localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        localStorage.setItem('userInfo', JSON.stringify({
          ...userInfo,
          name: response.data.data.name,
          phone: response.data.data.phone
        }));
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.put(
        'http://localhost:5000/api/users/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess('Password changed successfully!');
        setChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="user-profile">
        <div className="user-profile__loading">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="user-profile">
      <div className="user-profile__container">
        <div className="user-profile__header">
          <div className="user-profile__avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="user-profile__avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-profile__header-info">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <div className="user-profile__stats">
              <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
              {user.lastLogin && (
                <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <button className="user-profile__logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {error && (
          <div className="user-profile__error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="user-profile__success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {success}
          </div>
        )}

        <div className="user-profile__content">
          {/* Quick Actions */}
          <div className="user-profile__quick-actions">
            <Link to="/my-budget-plans" className="user-profile__action-card">
              <div className="user-profile__action-icon">📋</div>
              <div className="user-profile__action-content">
                <h3>My Budget Plans</h3>
                <p>View and manage your saved budget plans</p>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>

            <Link to="/request-quote" className="user-profile__action-card">
              <div className="user-profile__action-icon">✨</div>
              <div className="user-profile__action-content">
                <h3>Request Quote</h3>
                <p>Get a personalized quote for your project</p>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>

          {/* Profile Information */}
          <div className="user-profile__section">
            <div className="user-profile__section-header">
              <h2>Profile Information</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="user-profile__edit-btn">
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="user-profile__form">
                <div className="user-profile__field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="user-profile__field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91-9876543210"
                  />
                </div>

                <div className="user-profile__field">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="user-profile__row">
                  <div className="user-profile__field">
                    <label>City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                    />
                  </div>

                  <div className="user-profile__field">
                    <label>State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div className="user-profile__field">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      placeholder="400001"
                    />
                  </div>
                </div>

                <div className="user-profile__form-actions">
                  <button type="button" onClick={() => setEditing(false)} className="user-profile__cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="user-profile__save-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="user-profile__info">
                <div className="user-profile__info-item">
                  <strong>Phone:</strong>
                  <span>{user.phone || 'Not provided'}</span>
                </div>
                <div className="user-profile__info-item">
                  <strong>Address:</strong>
                  <span>
                    {user.address?.street || user.address?.city ? (
                      <>
                        {user.address.street && <>{user.address.street}<br /></>}
                        {user.address.city && `${user.address.city}, `}
                        {user.address.state && `${user.address.state} `}
                        {user.address.pincode}
                      </>
                    ) : (
                      'Not provided'
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="user-profile__section">
            <div className="user-profile__section-header">
              <h2>Change Password</h2>
              {!changingPassword && (
                <button onClick={() => setChangingPassword(true)} className="user-profile__edit-btn">
                  Change
                </button>
              )}
            </div>

            {changingPassword ? (
              <form onSubmit={handleChangePassword} className="user-profile__form">
                <div className="user-profile__field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="user-profile__field">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                  <small>Must be at least 6 characters</small>
                </div>

                <div className="user-profile__field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="user-profile__form-actions">
                  <button type="button" onClick={() => setChangingPassword(false)} className="user-profile__cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="user-profile__save-btn">
                    Update Password
                  </button>
                </div>
              </form>
            ) : (
              <p className="user-profile__password-info">
                ••••••••
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
