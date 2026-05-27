import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import './AdminCategories.css';

const AdminCategories = () => {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📦',
    color: '#d6e4f0',
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
    fetchCompanies();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://dumy-2-mli2.onrender.com/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('https://dumy-2-mli2.onrender.com/api/companies');
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://dumy-2-mli2.onrender.com/api/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const getCompaniesForCategory = (categoryId) => {
    return companies.filter(company => 
      company.categories.some(cat => cat._id === categoryId)
    );
  };

  const getProductCountForCategory = (categoryId) => {
    return products.filter(product => product.category._id === categoryId).length;
  };

  const toggleCompanyDropdown = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Update existing category
        const response = await axios.put(
          `https://dumy-2-mli2.onrender.com/api/categories/${editingCategory._id}`,
          formData
        );
        if (response.data.success) {
          showNotification('Category updated successfully!', 'success');
        }
      } else {
        // Create new category
        const response = await axios.post('https://dumy-2-mli2.onrender.com/api/categories', formData);
        if (response.data.success) {
          showNotification('Category created successfully!', 'success');
        }
      }
      
      fetchCategories();
      closeModal();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save category', 'error');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
      isActive: category.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`https://dumy-2-mli2.onrender.com/api/categories/${id}`);
      if (response.data.success) {
        showNotification('Category deleted successfully!', 'success');
        fetchCategories();
      }
    } catch (error) {
      showNotification('Failed to delete category', 'error');
    }
  };

  const openModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '📦',
      color: '#d6e4f0',
      isActive: true
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const iconOptions = ['📦', '🚽', '🪞', '🛁', '🚿', '🚰', '🔧', '🏢', '✨', '🎨', '🔨', '⚙️'];
  const colorOptions = [
    '#d6e4f0', '#e8f0e0', '#f0e6d6', '#e0e6f0', 
    '#f0e0e6', '#e6f0e8', '#f0f0d6', '#2c2c2c'
  ];

  return (
    <div className="admin-categories">
      <header className="admin-categories__header">
        <div>
          <h1>Categories Management</h1>
          <p className="admin-categories__subtitle">{categories.length} total categories</p>
        </div>
        <button className="admin-categories__add-btn" onClick={openModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Category
        </button>
      </header>

      {loading ? (
        <div className="admin-categories__loading">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="admin-categories__empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <h2>No Categories Yet</h2>
          <p>Add your first category to get started</p>
        </div>
      ) : (
        <div className="admin-categories__table-container">
          <table className="admin-categories__table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Category Name</th>
                <th>Companies</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => {
                const categoryCompanies = getCompaniesForCategory(category._id);
                const productCount = getProductCountForCategory(category._id);
                const isExpanded = expandedCategory === category._id;

                return (
                  <tr key={category._id}>
                    <td>
                      <div className="admin-categories__icon-cell" style={{ background: category.color }}>
                        {category.icon}
                      </div>
                    </td>
                    <td>
                      <div className="admin-categories__name-cell">
                        <strong>{category.name}</strong>
                        {category.description && (
                          <span className="admin-categories__description">{category.description}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="admin-categories__company-cell">
                        <button 
                          className="admin-categories__company-btn"
                          onClick={() => toggleCompanyDropdown(category._id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                          {categoryCompanies.length} {categoryCompanies.length === 1 ? 'Company' : 'Companies'}
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                          >
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                        {isExpanded && categoryCompanies.length > 0 && (
                          <div className="admin-categories__company-dropdown">
                            {categoryCompanies.map(company => (
                              <div key={company._id} className="admin-categories__company-item">
                                {company.logo ? (
                                  <img src={`${company.logo.startsWith('http') ? company.logo : 'https://dumy-2-mli2.onrender.com' + company.logo}`} alt={company.name} />
                                ) : (
                                  <div className="admin-categories__company-placeholder">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                      <polyline points="9 22 9 12 15 12 15 22"/>
                                    </svg>
                                  </div>
                                )}
                                <span>{company.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {isExpanded && categoryCompanies.length === 0 && (
                          <div className="admin-categories__company-dropdown">
                            <div className="admin-categories__no-companies">No companies assigned</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="admin-categories__product-count">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                        {productCount} {productCount === 1 ? 'Product' : 'Products'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-categories__badge ${category.isActive ? 'active' : 'inactive'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-categories__actions">
                        <button onClick={() => handleEdit(category)} title="Edit">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(category._id)} title="Delete">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="admin-categories__modal-overlay" onClick={closeModal}>
          <div className="admin-categories__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-categories__modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-categories__form">
              <div className="admin-categories__field">
                <label>Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Toilets"
                />
              </div>

              <div className="admin-categories__field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Brief description of the category"
                />
              </div>

              <div className="admin-categories__field">
                <label>Icon</label>
                <div className="admin-categories__icon-picker">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`admin-categories__icon-option ${formData.icon === icon ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-categories__field">
                <label>Background Color</label>
                <div className="admin-categories__color-picker">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`admin-categories__color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="admin-categories__field">
                <label className="admin-categories__checkbox">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Active (visible on frontend)</span>
                </label>
              </div>

              <div className="admin-categories__modal-actions">
                <button type="button" onClick={closeModal} className="admin-categories__btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="admin-categories__btn-submit">
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
