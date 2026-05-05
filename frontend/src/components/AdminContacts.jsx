import { useState, useEffect } from 'react';
import './AdminContacts.css';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterReferrer, setFilterReferrer] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contactType: 'individual',
    isReferrer: false,
    commissionRate: 0,
    status: 'active',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    companyName: '',
    designation: '',
    notes: ''
  });

  useEffect(() => {
    fetchContacts();
  }, [searchTerm, filterType, filterReferrer]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterType) params.append('contactType', filterType);
      if (filterReferrer) params.append('isReferrer', filterReferrer);

      const response = await fetch(`http://localhost:5000/api/contacts?${params}`);
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = selectedContact
        ? `http://localhost:5000/api/contacts/${selectedContact._id}`
        : 'http://localhost:5000/api/contacts';
      
      const method = selectedContact ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(selectedContact ? 'Contact updated successfully!' : 'Contact created successfully!');
        setShowModal(false);
        resetForm();
        fetchContacts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving contact');
    }
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      contactType: contact.contactType || 'individual',
      isReferrer: contact.isReferrer || false,
      commissionRate: contact.commissionRate || 0,
      status: contact.status || 'active',
      address: contact.address || {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      companyName: contact.companyName || '',
      designation: contact.designation || '',
      notes: contact.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this contact?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/contacts/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Contact deactivated successfully!');
        fetchContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Error deleting contact');
    }
  };

  const resetForm = () => {
    setSelectedContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      contactType: 'individual',
      isReferrer: false,
      commissionRate: 0,
      status: 'active',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      },
      companyName: '',
      designation: '',
      notes: ''
    });
  };

  const handleViewDetails = (contact) => {
    setSelectedContact(contact);
    setShowViewModal(true);
  };

  return (
    <div className="admin-contacts">
      <div className="contacts-header">
        <h2>Contact Management</h2>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Add Contact
        </button>
      </div>

      <div className="contacts-filters">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
          <option value="">All Types</option>
          <option value="individual">Individual</option>
          <option value="business">Business</option>
          <option value="architect">Architect</option>
          <option value="contractor">Contractor</option>
          <option value="designer">Designer</option>
          <option value="agent">Agent</option>
          <option value="partner">Partner</option>
        </select>

        <select value={filterReferrer} onChange={(e) => setFilterReferrer(e.target.value)} className="filter-select">
          <option value="">All Contacts</option>
          <option value="true">Referrers Only</option>
          <option value="false">Non-Referrers</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading contacts...</div>
      ) : (
        <div className="contacts-table-container">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Referrer</th>
                <th>Referrals</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data">No contacts found</td>
                </tr>
              ) : (
                contacts.map(contact => (
                  <tr key={contact._id}>
                    <td>
                      <div className="contact-name">
                        <strong>{contact.name}</strong>
                        {contact.referralCode && (
                          <span className="referral-code">{contact.referralCode}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${contact.contactType}`}>
                        {contact.contactType}
                      </span>
                    </td>
                    <td>{contact.email || '-'}</td>
                    <td>{contact.phone || '-'}</td>
                    <td>
                      {contact.isReferrer ? (
                        <span className="badge badge-success">Yes ({contact.commissionRate}%)</span>
                      ) : (
                        <span className="badge badge-secondary">No</span>
                      )}
                    </td>
                    <td>{contact.totalReferrals || 0}</td>
                    <td>{contact.totalOrders || 0}</td>
                    <td>₹{(contact.totalRevenue || 0).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${contact.status}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleViewDetails(contact)} className="btn-view" title="View Details">
                          👁️
                        </button>
                        <button onClick={() => handleEdit(contact)} className="btn-edit" title="Edit">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(contact._id)} className="btn-delete" title="Deactivate">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedContact ? 'Edit Contact' : 'Add New Contact'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="contact-form">
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
                  <label>Contact Type *</label>
                  <select name="contactType" value={formData.contactType} onChange={handleInputChange} required>
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                    <option value="architect">Architect</option>
                    <option value="contractor">Contractor</option>
                    <option value="designer">Designer</option>
                    <option value="agent">Agent</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
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
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      name="isReferrer"
                      checked={formData.isReferrer}
                      onChange={handleInputChange}
                    />
                    Is Referrer (Can refer clients)
                  </label>
                </div>

                {formData.isReferrer && (
                  <div className="form-group">
                    <label>Commission Rate (%)</label>
                    <input
                      type="number"
                      name="commissionRate"
                      value={formData.commissionRate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                )}

                <div className="form-group full-width">
                  <h4>Address</h4>
                </div>

                <div className="form-group full-width">
                  <label>Street</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {selectedContact ? 'Update Contact' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedContact && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Contact Details</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            
            <div className="contact-details">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedContact.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Type:</label>
                    <span className={`badge badge-${selectedContact.contactType}`}>
                      {selectedContact.contactType}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedContact.email || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedContact.phone || '-'}</span>
                  </div>
                  {selectedContact.companyName && (
                    <div className="detail-item">
                      <label>Company:</label>
                      <span>{selectedContact.companyName}</span>
                    </div>
                  )}
                  {selectedContact.designation && (
                    <div className="detail-item">
                      <label>Designation:</label>
                      <span>{selectedContact.designation}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge status-${selectedContact.status}`}>
                      {selectedContact.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedContact.address && (selectedContact.address.street || selectedContact.address.city) && (
                <div className="detail-section">
                  <h4>Address</h4>
                  <div className="detail-grid">
                    {selectedContact.address.street && (
                      <div className="detail-item full-width">
                        <label>Street:</label>
                        <span>{selectedContact.address.street}</span>
                      </div>
                    )}
                    {selectedContact.address.city && (
                      <div className="detail-item">
                        <label>City:</label>
                        <span>{selectedContact.address.city}</span>
                      </div>
                    )}
                    {selectedContact.address.state && (
                      <div className="detail-item">
                        <label>State:</label>
                        <span>{selectedContact.address.state}</span>
                      </div>
                    )}
                    {selectedContact.address.pincode && (
                      <div className="detail-item">
                        <label>Pincode:</label>
                        <span>{selectedContact.address.pincode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h4>Referrer Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Is Referrer:</label>
                    <span>
                      {selectedContact.isReferrer ? (
                        <span className="badge badge-success">Yes</span>
                      ) : (
                        <span className="badge badge-secondary">No</span>
                      )}
                    </span>
                  </div>
                  {selectedContact.isReferrer && (
                    <>
                      <div className="detail-item">
                        <label>Commission Rate:</label>
                        <span>{selectedContact.commissionRate}%</span>
                      </div>
                      <div className="detail-item">
                        <label>Referral Code:</label>
                        <span className="referral-code">{selectedContact.referralCode || '-'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>Statistics</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Total Referrals:</label>
                    <span>{selectedContact.totalReferrals || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Orders:</label>
                    <span>{selectedContact.totalOrders || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Revenue:</label>
                    <span>₹{(selectedContact.totalRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Commission Earned:</label>
                    <span>₹{(selectedContact.commissionEarned || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedContact.notes && (
                <div className="detail-section">
                  <h4>Notes</h4>
                  <p className="notes-text">{selectedContact.notes}</p>
                </div>
              )}

              <div className="detail-section">
                <h4>Timestamps</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{new Date(selectedContact.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{new Date(selectedContact.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setShowViewModal(false)} className="btn-secondary">
                Close
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedContact);
                }} 
                className="btn-primary"
              >
                Edit Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
