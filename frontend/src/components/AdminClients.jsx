import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import './AdminClients.css';

const AdminClients = () => {
  const { showNotification } = useNotification();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    clientType: 'individual',
    status: 'active',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    gstNumber: '',
    mainContact: {
      name: '',
      phone: '',
      email: ''
    },
    wifeContact: {
      name: '',
      phone: '',
      email: ''
    },
    familyMembers: [],
    projectIncharge: {
      name: '',
      phone: '',
      email: '',
      designation: ''
    },
    source: 'website',
    assignedTo: '',
    notes: '',
    tags: ''
  });

  useEffect(() => {
    fetchClients();
  }, [filterStatus, filterType]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.clientType = filterType;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get('http://localhost:5000/api/clients', { params });
      if (response.data.success) {
        setClients(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchClients();
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
    } else if (name.startsWith('mainContact.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        mainContact: {
          ...formData.mainContact,
          [field]: value
        }
      });
    } else if (name.startsWith('wifeContact.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        wifeContact: {
          ...formData.wifeContact,
          [field]: value
        }
      });
    } else if (name.startsWith('projectIncharge.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        projectIncharge: {
          ...formData.projectIncharge,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    };

    try {
      if (editingClient) {
        const response = await axios.put(
          `http://localhost:5000/api/clients/${editingClient._id}`,
          clientData
        );
        if (response.data.success) {
          showNotification('Client updated successfully!', 'success');
        }
      } else {
        const response = await axios.post('http://localhost:5000/api/clients', clientData);
        if (response.data.success) {
          showNotification('Client created successfully!', 'success');
        }
      }
      
      fetchClients();
      closeModal();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save client', 'error');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      companyName: client.companyName || '',
      email: client.email,
      phone: client.phone,
      gstNumber: client.gstNumber || '',
      clientType: client.clientType,
      status: client.status,
      address: client.address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      mainContact: client.mainContact || {
        name: '',
        phone: '',
        email: ''
      },
      wifeContact: client.wifeContact || {
        name: '',
        phone: '',
        email: ''
      },
      familyMembers: client.familyMembers || [],
      projectIncharge: client.projectIncharge || {
        name: '',
        phone: '',
        email: '',
        designation: ''
      },
      source: client.source || 'website',
      assignedTo: client.assignedTo || '',
      notes: client.notes || '',
      tags: client.tags ? client.tags.join(', ') : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/clients/${id}`);
      if (response.data.success) {
        showNotification('Client deleted successfully!', 'success');
        fetchClients();
      }
    } catch (error) {
      showNotification('Failed to delete client', 'error');
    }
  };

  const openModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      clientType: 'individual',
      status: 'active',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      gstNumber: '',
      mainContact: {
        name: '',
        phone: '',
        email: ''
      },
      wifeContact: {
        name: '',
        phone: '',
        email: ''
      },
      familyMembers: [],
      projectIncharge: {
        name: '',
        phone: '',
        email: '',
        designation: ''
      },
      source: 'website',
      assignedTo: '',
      notes: '',
      tags: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: '#43e97b', bg: '#e6ffe6', text: 'Active' },
      inactive: { color: '#a0aec0', bg: '#f7fafc', text: 'Inactive' },
      potential: { color: '#f6ad55', bg: '#fef5e7', text: 'Potential' }
    };
    const badge = badges[status] || badges.active;
    return (
      <span style={{
        background: badge.bg,
        color: badge.color,
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }}>
        {badge.text}
      </span>
    );
  };

  const getClientTypeIcon = (type) => {
    const icons = {
      individual: '👤',
      business: '🏢',
      contractor: '👷',
      architect: '📐'
    };
    return icons[type] || '👤';
  };

  return (
    <div className="admin-clients">
      <header className="admin-clients__header">
        <div>
          <h1>Clients Management</h1>
          <p className="admin-clients__subtitle">{clients.length} total clients</p>
        </div>
        <button className="admin-clients__add-btn" onClick={openModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Client
        </button>
      </header>

      {/* Filters */}
      <div className="admin-clients__filters">
        <div className="admin-clients__search">
          <input
            type="text"
            placeholder="Search by name, email, phone, or company..."
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
          <option value="potential">Potential</option>
        </select>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="individual">Individual</option>
          <option value="business">Business</option>
          <option value="contractor">Contractor</option>
          <option value="architect">Architect</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-clients__loading">Loading clients...</div>
      ) : (
        <div className="admin-clients__grid">
          {clients.map(client => (
            <div key={client._id} className="admin-clients__card">
              <div className="admin-clients__card-header">
                <div className="admin-clients__avatar">
                  {getClientTypeIcon(client.clientType)}
                </div>
                <div className="admin-clients__card-actions">
                  <button onClick={() => handleEdit(client)} title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(client._id)} title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="admin-clients__card-body">
                <h3>{client.name}</h3>
                {client.company && <p className="admin-clients__company">{client.company}</p>}
                
                <div className="admin-clients__info">
                  <div className="admin-clients__info-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>{client.email}</span>
                  </div>
                  <div className="admin-clients__info-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>{client.phone}</span>
                  </div>
                  {client.address?.city && (
                    <div className="admin-clients__info-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{client.address.city}, {client.address.state}</span>
                    </div>
                  )}
                </div>

                <div className="admin-clients__stats">
                  <div className="admin-clients__stat">
                    <span className="admin-clients__stat-value">{client.totalProjects || 0}</span>
                    <span className="admin-clients__stat-label">Projects</span>
                  </div>
                  <div className="admin-clients__stat">
                    <span className="admin-clients__stat-value">₹{(client.totalSpent || 0).toLocaleString('en-IN')}</span>
                    <span className="admin-clients__stat-label">Total Spent</span>
                  </div>
                </div>
              </div>

              <div className="admin-clients__card-footer">
                {getStatusBadge(client.status)}
                <span className="admin-clients__type">{client.clientType}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-clients__modal-overlay" onClick={closeModal}>
          <div className="admin-clients__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-clients__modal-header">
              <h2>{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
              <button onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-clients__form">
              <div className="admin-clients__row">
                <div className="admin-clients__field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="admin-clients__field">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="admin-clients__row">
                <div className="admin-clients__field">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91-9876543210"
                  />
                </div>

                <div className="admin-clients__field">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Company name (if applicable)"
                  />
                </div>
              </div>

              <div className="admin-clients__row">
                <div className="admin-clients__field">
                  <label>GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="GST Number (optional)"
                  />
                </div>

                <div className="admin-clients__field">
                  <label>Client Type *</label>
                  <select name="clientType" value={formData.clientType} onChange={handleChange} required>
                    <option value="individual">👤 Individual</option>
                    <option value="business">🏢 Business</option>
                    <option value="contractor">👷 Contractor</option>
                    <option value="architect">📐 Architect</option>
                  </select>
                </div>
              </div>

              {/* Main Contact Section */}
              <div className="admin-clients__section-title">Main Contact Information</div>
              <div className="admin-clients__row">
                <div className="admin-clients__field">
                  <label>Main Contact Name</label>
                  <input
                    type="text"
                    name="mainContact.name"
                    value={formData.mainContact.name}
                    onChange={handleChange}
                    placeholder="Primary contact person"
                  />
                </div>

                <div className="admin-clients__field">
                  <label>Main Contact Phone</label>
                  <input
                    type="tel"
                    name="mainContact.phone"
                    value={formData.mainContact.phone}
                    onChange={handleChange}
                    placeholder="Contact phone number"
                  />
                </div>

                <div className="admin-clients__field">
                  <label>Main Contact Email</label>
                  <input
                    type="email"
                    name="mainContact.email"
                    value={formData.mainContact.email}
                    onChange={handleChange}
                    placeholder="Contact email"
                  />
                </div>
              </div>

              {/* Wife Contact Section */}
              <div className="admin-clients__section-title">Wife Contact Information</div>
              <div className="admin-clients__row">
                <div className="admin-clients__field">
                  <label>Wife Name</label>
                  <input
                    type="text"
                    name="wifeContact.name"
                    value={formData.wifeContact.name}
                    onChange={handleChange}
                    placeholder="Wife's name"
                  />
                </div>

                <div className="admin-clients__field">
                  <label>Wife Phone</label>
                  <input
                    type="tel"
                    name="wifeContact.phone"
                    value={formData.wifeContact.phone}
                    onChange={handleChange}
                    placeholder="Wife's phone number"
                  />
                </div>

                <div className="admin-clients__field">
                  <label>Wife Email</label>
                  <input
                    type="email"
                    name="wifeContact.email"
                    value={formData.wifeContact.email}
                    onChange={handleChange}
                    placeholder="Wife's email"
                  />
                </div>
              </div>

              {/* Project Incharge Section */}
              <div className="admin-clients__section-title">Project Incharge Information</div>
              <div className="admin-clients__row">
                <div className="admin-clients__field">
                  <label>Incharge Name</label>
                  <input
                    type="text"
                    name="projectIncharge.name"
                    value={formData.projectIncharge.name}
                    onChange={handleChange}
                    placeholder="Project incharge name"
                  />
                </div>

                <div className="admin-clients__field">
                  <label>Incharge Phone</label>
                  <input
                    type="tel"
                    name="projectIncharge.phone"
                    value={formData.projectIncharge.phone}
                    onChange={handleChange}
                    placeholder="Incharge phone number"
                  />
                </div>
              </div>

              <div className="admin-clients__row">
                <div className="admin-clients__field">
                  <label>Incharge Email</label>
                  <input
                    type="email"
                    name="projectIncharge.email"
                    value={formData.projectIncharge.email}
                    onChange={handleChange}
                    placeholder="Incharge email"
                  />
                </div>

                <div className="admin-clients__field">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="projectIncharge.designation"
                    value={formData.projectIncharge.designation}
                    onChange={handleChange}
                    placeholder="Project manager, Architect, etc."
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="admin-clients__section-title">Address Information</div>

              {/* Address Section */}
              <div className="admin-clients__section-title">Address Information</div>
              <div className="admin-clients__field">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="admin-clients__row">
                <div className="admin-clients__field">
                  <label>City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                  />
                </div>

                <div className="admin-clients__field">
                  <label>State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                  />
                </div>

                <div className="admin-clients__field">
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

              {/* Additional Information */}
              <div className="admin-clients__section-title">Additional Information</div>
              <div className="admin-clients__row">
                <div className="admin-clients__field">
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleChange} required>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="potential">Potential</option>
                  </select>
                </div>

                <div className="admin-clients__field">
                  <label>Source</label>
                  <select name="source" value={formData.source} onChange={handleChange}>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social-media">Social Media</option>
                    <option value="direct">Direct</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="admin-clients__field">
                  <label>Assigned To</label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    placeholder="Sales person name"
                  />
                </div>
              </div>

              <div className="admin-clients__field">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="vip, premium, repeat-customer"
                />
              </div>

              <div className="admin-clients__field">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Additional notes about the client..."
                />
              </div>

              <div className="admin-clients__modal-actions">
                <button type="button" onClick={closeModal} className="admin-clients__btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="admin-clients__btn-submit">
                  {editingClient ? 'Update' : 'Create'} Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
