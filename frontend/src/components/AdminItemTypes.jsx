import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import axios from '../utils/axios';
import './AdminItemTypes.css';

function AdminItemTypes() {
  const { showNotification } = useNotification();
  const [itemTypes, setItemTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    icon: '📦',
    priceRange: {
      min: 0,
      max: 10000
    },
    isActive: true
  });

  useEffect(() => {
    fetchItemTypes();
    fetchCategories();
  }, []);

  const fetchItemTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/item-types');
      setItemTypes(response.data);
    } catch (error) {
      console.error('Error fetching item types:', error);
      showNotification('Failed to fetch item types', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories/active');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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
          [child]: type === 'number' ? Number(value) : value
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
      if (editingItem) {
        await axios.put(`/item-types/${editingItem._id}`, formData);
      } else {
        await axios.post('/item-types', formData);
      }

      showNotification(`Item type ${editingItem ? 'updated' : 'created'} successfully!`, 'success');
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      fetchItemTypes();
    } catch (error) {
      console.error('Error saving item type:', error);
      showNotification('Failed to save item type', 'error');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category._id || item.category,
      icon: item.icon || '📦',
      priceRange: item.priceRange,
      isActive: item.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/item-types/${id}`);
      showNotification('Item type deleted successfully!', 'success');
      fetchItemTypes();
    } catch (error) {
      console.error('Error deleting item type:', error);
      showNotification('Failed to delete item type', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      icon: '📦',
      priceRange: {
        min: 0,
        max: 10000
      },
      isActive: true
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    resetForm();
  };

  if (loading) {
    return <div className="admin-section-loading">Loading item types...</div>;
  }

  return (
    <div className="admin-item-types">
      <div className="admin-section-header">
        <h2>📦 Product Item Types</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add New Item Type
        </button>
      </div>

      {showForm && (
        <div className="item-form-modal">
          <div className="item-form-container">
            <div className="form-header">
              <h3>{editingItem ? 'Edit Item Type' : 'Create New Item Type'}</h3>
              <button className="btn-close" onClick={handleCancel}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="item-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Item Type Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Toilet Seat"
                  />
                </div>

                <div className="form-group">
                  <label>Icon</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="📦"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of this item type"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Price (₹)</label>
                  <input
                    type="number"
                    name="priceRange.min"
                    value={formData.priceRange.min}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Max Price (₹)</label>
                  <input
                    type="number"
                    name="priceRange.max"
                    value={formData.priceRange.max}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingItem ? 'Update Item Type' : 'Create Item Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="item-types-grid">
        {itemTypes.length === 0 ? (
          <div className="no-data">
            <p>No item types found.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Create First Item Type
            </button>
          </div>
        ) : (
          itemTypes.map(item => (
            <div key={item._id} className="item-type-card">
              <div className="item-card-header">
                <div className="item-icon">{item.icon}</div>
                <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3>{item.name}</h3>
              {item.description && (
                <p className="item-description">{item.description}</p>
              )}

              <div className="item-info">
                <div className="info-row">
                  <span className="label">Category:</span>
                  <span className="value">
                    {item.category?.icon} {item.category?.name}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Price Range:</span>
                  <span className="value">
                    ₹{item.priceRange.min.toLocaleString()} - 
                    ₹{item.priceRange.max.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="item-actions">
                <button 
                  className="btn-edit"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminItemTypes;
