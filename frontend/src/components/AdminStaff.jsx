import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import './AdminStaff.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminStaff() {
  const { showNotification } = useNotification();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'sales_staff',
    status: 'active'
  });

  useEffect(() => {
    fetchStaff();
  }, [filterRole, filterStatus]);

  const getToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('staffToken');
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      let url = `${API_URL}/staff`;
      const params = new URLSearchParams();
      if (filterRole !== 'all') params.append('role', filterRole);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch staff');
      
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      showNotification('Failed to fetch staff', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = getToken();
      const url = selectedStaff
        ? `${API_URL}/staff/${selectedStaff._id}`
        : `${API_URL}/staff`;
      
      const method = selectedStaff ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      showNotification(
        selectedStaff ? 'Staff updated successfully!' : 'Staff created successfully!',
        'success'
      );
      setShowModal(false);
      resetForm();
      fetchStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      showNotification(error.message || 'Error saving staff', 'error');
    }
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      password: '', // Don't pre-fill password
      phone: staffMember.phone || '',
      role: staffMember.role,
      status: staffMember.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/staff/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete staff');

      showNotification('Staff deleted successfully!', 'success');
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      showNotification('Error deleting staff', 'error');
    }
  };

  const resetForm = () => {
    setSelectedStaff(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'sales_staff',
      status: 'active'
    });
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: 'badge-admin',
      manager: 'badge-manager',
      sales_staff: 'badge-sales',
      inventory_staff: 'badge-inventory'
    };
    return classes[role] || 'badge-default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Admin',
      manager: 'Manager',
      sales_staff: 'Sales Staff',
      inventory_staff: 'Inventory Staff'
    };
    return labels[role] || role;
  };

  if (loading) {
    return <div className="admin-section-loading">Loading staff...</div>;
  }

  return (
    <div className="admin-staff">
      <div className="admin-section-header">
        <h2>👨‍💼 Staff Management</h2>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Add Staff
        </button>
      </div>

      <div className="staff-filters">
        <div className="filter-group">
          <label>Role:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="sales_staff">Sales Staff</option>
            <option value="inventory_staff">Inventory Staff</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {staff.length === 0 ? (
        <div className="no-data">No staff members found.</div>
      ) : (
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member._id}>
                  <td><strong>{member.employeeId}</strong></td>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone || '-'}</td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeClass(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${member.status}`}>
                      {member.status}
                    </span>
                  </td>
                  <td>{new Date(member.joiningDate).toLocaleDateString()}</td>
                  <td>{member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEdit(member)} className="btn-edit" title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(member._id)} className="btn-delete" title="Delete">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div 
          className="modal-overlay" 
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedStaff ? 'Edit Staff' : 'Add New Staff'}</h3>
              <button 
                className="modal-close" 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowModal(false);
                }}
              >×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="staff-form" onClick={(e) => e.stopPropagation()}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password {!selectedStaff && '*'}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!selectedStaff}
                    placeholder={selectedStaff ? 'Leave blank to keep current' : ''}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} required>
                    <option value="sales_staff">Sales Staff</option>
                    <option value="manager">Manager</option>
                    <option value="inventory_staff">Inventory Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="role-permissions-info">
                <h4>Role Permissions:</h4>
                {formData.role === 'admin' && <p>✓ Full access to all features</p>}
                {formData.role === 'manager' && <p>✓ Manage quotations, orders, and customers</p>}
                {formData.role === 'sales_staff' && <p>✓ Create quotations and orders for walk-in customers</p>}
                {formData.role === 'inventory_staff' && <p>✓ Manage products and inventory</p>}
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowModal(false);
                  }} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {selectedStaff ? 'Update Staff' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStaff;
