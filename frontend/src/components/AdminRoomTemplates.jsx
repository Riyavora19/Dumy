import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import axios from '../utils/axios';
import './AdminRoomTemplates.css';

function AdminRoomTemplates() {
  const { showNotification } = useNotification();
  const [templates, setTemplates] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏠',
    estimatedBudget: {
      min: 10000,
      max: 100000,
      recommended: 50000
    },
    requiredItems: [],
    isActive: true,
    displayOrder: 0
  });

  useEffect(() => {
    fetchTemplates();
    fetchItemTypes();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log('Fetching templates from API...');
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await axios.get('/room-templates', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Templates response:', response.data);
      
      // Handle both array and object responses
      const templatesData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || response.data.templates || [];
      
      setTemplates(templatesData);
      console.log('Templates loaded:', templatesData.length);
    } catch (error) {
      console.error('Error fetching templates:', error);
      
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        showNotification('Request timeout. Please check your connection and try again.', 'error');
      } else {
        showNotification('Failed to fetch templates. Using empty list.', 'error');
      }
      
      setTemplates([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchItemTypes = async () => {
    try {
      const response = await axios.get('/item-types');
      console.log('Item types response:', response.data);
      
      // Handle both array and object responses
      const itemTypesData = Array.isArray(response.data)
        ? response.data
        : response.data.data || response.data.itemTypes || [];
      
      setItemTypes(itemTypesData);
    } catch (error) {
      console.error('Error fetching item types:', error);
      setItemTypes([]); // Set empty array on error
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
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      requiredItems: [
        ...prev.requiredItems,
        {
          itemType: '',
          itemName: '',
          isEssential: true,
          quantity: { min: 1, max: 1 },
          budgetAllocation: 10,
          priceRange: { min: 0, max: 10000 },
          priority: prev.requiredItems.length + 1
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      requiredItems: prev.requiredItems.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.requiredItems];
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newItems[index] = {
          ...newItems[index],
          [parent]: {
            ...newItems[index][parent],
            [child]: typeof value === 'string' && !isNaN(value) ? Number(value) : value
          }
        };
      } else {
        // If itemType is being changed, update itemName
        if (field === 'itemType') {
          const selectedItemType = itemTypes.find(it => it._id === value);
          newItems[index] = {
            ...newItems[index],
            itemType: value,
            itemName: selectedItemType ? selectedItemType.name : ''
          };
        } else {
          newItems[index] = {
            ...newItems[index],
            [field]: typeof value === 'string' && field !== 'itemName' && !isNaN(value) ? Number(value) : value
          };
        }
      }
      
      return { ...prev, requiredItems: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTemplate) {
        await axios.put(`/room-templates/${editingTemplate._id}`, formData);
      } else {
        await axios.post('/room-templates', formData);
      }

      showNotification(`Template ${editingTemplate ? 'updated' : 'created'} successfully!`, 'success');
      setShowForm(false);
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      showNotification(error.response?.data?.message || 'Failed to save template', 'error');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      icon: template.icon || '🏠',
      estimatedBudget: template.estimatedBudget,
      requiredItems: template.requiredItems.map(item => ({
        itemType: item.itemType._id || item.itemType,
        itemName: item.itemName,
        isEssential: item.isEssential,
        quantity: item.quantity,
        budgetAllocation: item.budgetAllocation,
        priceRange: item.priceRange,
        priority: item.priority
      })),
      isActive: template.isActive,
      displayOrder: template.displayOrder || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await axios.delete(`/room-templates/${id}`);
      showNotification('Template deleted successfully', 'success');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      showNotification(error.response?.data?.message || 'Failed to delete template', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '🏠',
      estimatedBudget: {
        min: 10000,
        max: 100000,
        recommended: 50000
      },
      requiredItems: [],
      isActive: true,
      displayOrder: 0
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
    resetForm();
  };

  if (loading) {
    return <div className="admin-section-loading">Loading templates...</div>;
  }

  return (
    <div className="admin-room-templates">
      <div className="admin-section-header">
        <h2>🏠 Room Templates</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add New Template
        </button>
      </div>

      {showForm && (
        <div className="template-form-modal">
          <div className="template-form-container">
            <div className="form-header">
              <h3>{editingTemplate ? 'Edit Template' : 'Create New Template'}</h3>
              <button className="btn-close" onClick={handleCancel}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="template-form">
              <div className="form-section">
                <h4>Basic Information</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Template Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Basic Toilet"
                    />
                  </div>

                  <div className="form-group">
                    <label>Icon</label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                      placeholder="🏠"
                    />
                    <div className="icon-picker">
                      <button type="button" className="icon-option" onClick={() => setFormData(prev => ({ ...prev, icon: '🚽' }))}>🚽</button>
                      <button type="button" className="icon-option" onClick={() => setFormData(prev => ({ ...prev, icon: '🛁' }))}>🛁</button>
                      <button type="button" className="icon-option" onClick={() => setFormData(prev => ({ ...prev, icon: '🚿' }))}>🚿</button>
                      <button type="button" className="icon-option" onClick={() => setFormData(prev => ({ ...prev, icon: '🍳' }))}>🍳</button>
                      <button type="button" className="icon-option" onClick={() => setFormData(prev => ({ ...prev, icon: '🏠' }))}>🏠</button>
                      <button type="button" className="icon-option" onClick={() => setFormData(prev => ({ ...prev, icon: '🔧' }))}>🔧</button>
                      <button type="button" className="icon-option" onClick={() => setFormData(prev => ({ ...prev, icon: '🛏️' }))}>🛏️</button>
                      <button type="button" className="icon-option" onClick={() => setFormData(prev => ({ ...prev, icon: '🪟' }))}>🪟</button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Brief description of this room template"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Display Order</label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      min="0"
                    />
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
                </div>
              </div>

              <div className="form-section">
                <h4>Budget Range</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Minimum Budget (₹) *</label>
                    <input
                      type="number"
                      name="estimatedBudget.min"
                      value={formData.estimatedBudget.min}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Maximum Budget (₹) *</label>
                    <input
                      type="number"
                      name="estimatedBudget.max"
                      value={formData.estimatedBudget.max}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Recommended Budget (₹)</label>
                    <input
                      type="number"
                      name="estimatedBudget.recommended"
                      value={formData.estimatedBudget.recommended}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h4>Required Items</h4>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleAddItem}
                  >
                    + Add Item
                  </button>
                </div>

                {formData.requiredItems.length === 0 ? (
                  <p className="no-items">No items added yet. Click "Add Item" to start.</p>
                ) : (
                  <div className="items-list">
                    {formData.requiredItems.map((item, index) => (
                      <div key={index} className="item-card">
                        <div className="item-card-header">
                          <span className="item-number">Item #{index + 1}</span>
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => handleRemoveItem(index)}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Item Type *</label>
                            <select
                              value={item.itemType}
                              onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                              required
                            >
                              <option value="">Select Item Type</option>
                              {itemTypes.map(it => (
                                <option key={it._id} value={it._id}>
                                  {it.icon} {it.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Priority</label>
                            <input
                              type="number"
                              value={item.priority}
                              onChange={(e) => handleItemChange(index, 'priority', e.target.value)}
                              min="1"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Budget Allocation (%)</label>
                            <input
                              type="number"
                              value={item.budgetAllocation}
                              onChange={(e) => handleItemChange(index, 'budgetAllocation', e.target.value)}
                              min="0"
                              max="100"
                            />
                          </div>

                          <div className="form-group">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={item.isEssential}
                                onChange={(e) => handleItemChange(index, 'isEssential', e.target.checked)}
                              />
                              Essential Item
                            </label>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Min Quantity</label>
                            <input
                              type="number"
                              value={item.quantity.min}
                              onChange={(e) => handleItemChange(index, 'quantity.min', e.target.value)}
                              min="1"
                            />
                          </div>

                          <div className="form-group">
                            <label>Max Quantity</label>
                            <input
                              type="number"
                              value={item.quantity.max}
                              onChange={(e) => handleItemChange(index, 'quantity.max', e.target.value)}
                              min="1"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Min Price (₹)</label>
                            <input
                              type="number"
                              value={item.priceRange.min}
                              onChange={(e) => handleItemChange(index, 'priceRange.min', e.target.value)}
                              min="0"
                            />
                          </div>

                          <div className="form-group">
                            <label>Max Price (₹)</label>
                            <input
                              type="number"
                              value={item.priceRange.max}
                              onChange={(e) => handleItemChange(index, 'priceRange.max', e.target.value)}
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="templates-grid">
        {templates.length === 0 ? (
          <div className="no-data">
            <p>No room templates found.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Create First Template
            </button>
          </div>
        ) : (
          templates.map(template => (
            <div key={template._id} className="template-card">
              <div className="template-card-header">
                <div className="template-icon">{template.icon}</div>
                <div className="template-status">
                  <span className={`status-badge ${template.isActive ? 'active' : 'inactive'}`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <h3>{template.name}</h3>
              <p className="template-description">{template.description}</p>

              <div className="template-info">
                <div className="info-row">
                  <span className="label">Budget Range:</span>
                  <span className="value">
                    ₹{(template.estimatedBudget.min / 1000).toFixed(0)}k - 
                    ₹{(template.estimatedBudget.max / 1000).toFixed(0)}k
                  </span>
                </div>
                {template.estimatedBudget.recommended && (
                  <div className="info-row">
                    <span className="label">Recommended:</span>
                    <span className="value">₹{(template.estimatedBudget.recommended / 1000).toFixed(0)}k</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Items:</span>
                  <span className="value">{template.requiredItems.length}</span>
                </div>
                <div className="info-row">
                  <span className="label">Display Order:</span>
                  <span className="value">{template.displayOrder}</span>
                </div>
              </div>

              <div className="template-actions">
                <button 
                  className="btn-edit"
                  onClick={() => handleEdit(template)}
                >
                  Edit
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(template._id)}
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

export default AdminRoomTemplates;
