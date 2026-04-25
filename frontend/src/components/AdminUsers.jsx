import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [changingPassword, setChangingPassword] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  const [passwordFormData, setPasswordFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get('http://localhost:5000/api/users', { params });
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleToggleStatus = async (userId) => {
    if (!window.confirm('Are you sure you want to change this user\'s status?')) return;

    try {
      const response = await axios.patch(`http://localhost:5000/api/users/${userId}/toggle-status`);
      if (response.data.success) {
        alert(response.data.message);
        fetchUsers();
      }
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/users/${userId}`);
      if (response.data.success) {
        alert('User deleted successfully!');
        fetchUsers();
      }
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleView = (user) => {
    setViewingUser(user);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditFormData({
        ...editFormData,
        address: {
          ...editFormData.address,
          [addressField]: value
        }
      });
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${editingUser._id}/admin-update`,
        editFormData
      );
      
      if (response.data.success) {
        alert('User updated successfully!');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleChangePassword = (user) => {
    setChangingPassword(user);
    setPasswordFormData({
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordFormData({
      ...passwordFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${changingPassword._id}/admin-change-password`,
        { newPassword: passwordFormData.newPassword }
      );
      
      if (response.data.success) {
        alert('Password changed successfully!');
        setChangingPassword(null);
        setPasswordFormData({ newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change password');
    }
  };

  const closeModal = () => {
    setViewingUser(null);
    setEditingUser(null);
    setChangingPassword(null);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="admin-users__badge admin-users__badge--active">Active</span>
    ) : (
      <span className="admin-users__badge admin-users__badge--inactive">Inactive</span>
    );
  };

  return (
    <div className="admin-users">
      <header className="admin-users__header">
        <div>
          <h1>Users Management</h1>
          <p className="admin-users__subtitle">{users.length} total users</p>
        </div>
      </header>

      {/* Filters */}
      <div className="admin-users__filters">
        <div className="admin-users__search">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-users__loading">Loading users...</div>
      ) : (
        <div className="admin-users__table-container">
          <table className="admin-users__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="admin-users__user-cell">
                      <div className="admin-users__avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <div className="admin-users__avatar-placeholder">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <strong>{user.name}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{getStatusBadge(user.isActive)}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <div className="admin-users__actions">
                      <button onClick={() => handleView(user)} title="View Details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button onClick={() => handleEdit(user)} title="Edit User">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button onClick={() => handleChangePassword(user)} title="Change Password">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </button>
                      <button onClick={() => handleToggleStatus(user._id)} title={user.isActive ? 'Deactivate' : 'Activate'}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(user._id)} title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="admin-users__modal-overlay" onClick={closeModal}>
          <div className="admin-users__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-users__modal-header">
              <h2>User Details</h2>
              <button onClick={closeModal}>×</button>
            </div>

            <div className="admin-users__modal-content">
              <div className="admin-users__modal-avatar">
                {viewingUser.avatar ? (
                  <img src={viewingUser.avatar} alt={viewingUser.name} />
                ) : (
                  <div className="admin-users__avatar-placeholder-large">
                    {viewingUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="admin-users__detail-section">
                <h3>Personal Information</h3>
                <div className="admin-users__detail-item">
                  <strong>Name:</strong>
                  <span>{viewingUser.name}</span>
                </div>
                <div className="admin-users__detail-item">
                  <strong>Email:</strong>
                  <span>{viewingUser.email}</span>
                </div>
                <div className="admin-users__detail-item">
                  <strong>Phone:</strong>
                  <span>{viewingUser.phone || 'Not provided'}</span>
                </div>
                <div className="admin-users__detail-item">
                  <strong>Status:</strong>
                  {getStatusBadge(viewingUser.isActive)}
                </div>
              </div>

              {viewingUser.address && (viewingUser.address.street || viewingUser.address.city) && (
                <div className="admin-users__detail-section">
                  <h3>Address</h3>
                  <div className="admin-users__detail-item">
                    <span>
                      {viewingUser.address.street && <>{viewingUser.address.street}<br /></>}
                      {viewingUser.address.city && `${viewingUser.address.city}, `}
                      {viewingUser.address.state && `${viewingUser.address.state} `}
                      {viewingUser.address.pincode}
                    </span>
                  </div>
                </div>
              )}

              <div className="admin-users__detail-section">
                <h3>Account Information</h3>
                <div className="admin-users__detail-item">
                  <strong>Joined:</strong>
                  <span>{new Date(viewingUser.createdAt).toLocaleString()}</span>
                </div>
                <div className="admin-users__detail-item">
                  <strong>Last Login:</strong>
                  <span>{viewingUser.lastLogin ? new Date(viewingUser.lastLogin).toLocaleString() : 'Never'}</span>
                </div>
                <div className="admin-users__detail-item">
                  <strong>Login Count:</strong>
                  <span>{viewingUser.loginCount || 0} times</span>
                </div>
                <div className="admin-users__detail-item">
                  <strong>Verified:</strong>
                  <span>{viewingUser.isVerified ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="admin-users__modal-overlay" onClick={closeModal}>
          <div className="admin-users__modal admin-users__modal--edit" onClick={(e) => e.stopPropagation()}>
            <div className="admin-users__modal-header">
              <h2>Edit User</h2>
              <button onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSaveEdit} className="admin-users__edit-form">
              <div className="admin-users__form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="admin-users__form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="admin-users__form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditChange}
                  placeholder="+91-9876543210"
                />
              </div>

              <div className="admin-users__form-divider">Address</div>

              <div className="admin-users__form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={editFormData.address.street}
                  onChange={handleEditChange}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="admin-users__form-row">
                <div className="admin-users__form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={editFormData.address.city}
                    onChange={handleEditChange}
                    placeholder="Mumbai"
                  />
                </div>

                <div className="admin-users__form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={editFormData.address.state}
                    onChange={handleEditChange}
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              <div className="admin-users__form-row">
                <div className="admin-users__form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={editFormData.address.pincode}
                    onChange={handleEditChange}
                    placeholder="400001"
                  />
                </div>

                <div className="admin-users__form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={editFormData.address.country}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="admin-users__form-actions">
                <button type="button" onClick={closeModal} className="admin-users__btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="admin-users__btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changingPassword && (
        <div className="admin-users__modal-overlay" onClick={closeModal}>
          <div className="admin-users__modal admin-users__modal--password" onClick={(e) => e.stopPropagation()}>
            <div className="admin-users__modal-header">
              <h2>Change Password</h2>
              <button onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSavePassword} className="admin-users__edit-form">
              <div className="admin-users__user-info">
                <div className="admin-users__avatar">
                  {changingPassword.avatar ? (
                    <img src={changingPassword.avatar} alt={changingPassword.name} />
                  ) : (
                    <div className="admin-users__avatar-placeholder">
                      {changingPassword.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <strong>{changingPassword.name}</strong>
                  <p>{changingPassword.email}</p>
                </div>
              </div>

              <div className="admin-users__form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordFormData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  placeholder="Enter new password"
                />
                <small>Must be at least 6 characters</small>
              </div>

              <div className="admin-users__form-group">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordFormData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Confirm new password"
                />
              </div>

              <div className="admin-users__form-actions">
                <button type="button" onClick={closeModal} className="admin-users__btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="admin-users__btn-save">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
