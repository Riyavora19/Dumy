import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import './AdminCompanies.css';

const AdminCompanies = () => {
  const { showNotification } = useNotification();
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [expandedProducts, setExpandedProducts] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: [],
    website: '',
    email: '',
    phone: '',
    isActive: true
  });
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [existingLogo, setExistingLogo] = useState('');

  useEffect(() => {
    fetchCompanies();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/companies');
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const toggleCategoryDropdown = (companyId) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  const toggleProductsDropdown = (companyId) => {
    setExpandedProducts(expandedProducts === companyId ? null : companyId);
  };

  const handleCategoryClick = (companyId) => {
    // When clicking a category, open the products dropdown
    setExpandedProducts(companyId);
  };

  const getProductCountForCategory = (categoryId) => {
    return products.filter(product => product.category._id === categoryId).length;
  };

  const getProductsForCompany = (company) => {
    // Get all products that belong to categories this company serves
    const companyCategoryIds = company.categories.map(cat => cat._id);
    // Show all products in the company's categories
    return products.filter(product => 
      companyCategoryIds.includes(product.category._id)
    );
  };

  const getProductsByCategory = (company) => {
    // Group products by category
    const companyProducts = getProductsForCompany(company);
    const grouped = {};
    
    // Safety check: ensure company.categories is an array
    if (!company.categories || !Array.isArray(company.categories)) {
      return grouped;
    }
    
    company.categories.forEach(category => {
      // Safety check: ensure category is a valid object with _id
      if (!category || !category._id) {
        return;
      }
      
      const categoryProducts = companyProducts.filter(
        product => product.category && product.category._id === category._id
      );
      if (categoryProducts.length > 0) {
        grouped[category._id] = {
          category: category,
          products: categoryProducts
        };
      }
    });
    
    return grouped;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCategoryToggle = (categoryId) => {
    const currentCategories = formData.categories;
    if (currentCategories.includes(categoryId)) {
      setFormData({
        ...formData,
        categories: currentCategories.filter(id => id !== categoryId)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...currentCategories, categoryId]
      });
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedLogo(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('categories', JSON.stringify(formData.categories));
    data.append('website', formData.website);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('isActive', formData.isActive);

    if (editingCompany && existingLogo) {
      data.append('existingLogo', existingLogo);
    }

    if (selectedLogo) {
      data.append('logo', selectedLogo);
    }

    try {
      if (editingCompany) {
        const response = await axios.put(
          `http://localhost:5000/api/companies/${editingCompany._id}`,
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (response.data.success) {
          showNotification('Company updated successfully!', 'success');
        }
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/companies',
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (response.data.success) {
          showNotification('Company created successfully!', 'success');
        }
      }
      
      fetchCompanies();
      closeModal();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to save company', 'error');
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      description: company.description || '',
      categories: company.categories.map(cat => cat._id),
      website: company.website || '',
      email: company.email || '',
      phone: company.phone || '',
      isActive: company.isActive
    });
    setExistingLogo(company.logo || '');
    setSelectedLogo(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/companies/${id}`);
      if (response.data.success) {
        showNotification('Company deleted successfully!', 'success');
        fetchCompanies();
      }
    } catch (error) {
      showNotification('Failed to delete company', 'error');
    }
  };

  const openModal = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      description: '',
      categories: [],
      website: '',
      email: '',
      phone: '',
      isActive: true
    });
    setSelectedLogo(null);
    setExistingLogo('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCompany(null);
    setSelectedLogo(null);
    setExistingLogo('');
  };

  return (
    <div className="admin-companies">
      <header className="admin-companies__header">
        <div>
          <h1>Company Management</h1>
          <p className="admin-companies__subtitle">{companies.length} total companies</p>
        </div>
        <button className="admin-companies__add-btn" onClick={openModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Company
        </button>
      </header>

      {loading ? (
        <div className="admin-companies__loading">Loading companies...</div>
      ) : companies.length === 0 ? (
        <div className="admin-companies__empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <h2>No Companies Yet</h2>
          <p>Add your first company to get started</p>
        </div>
      ) : (
        <div className="admin-companies__table-container">
          <table className="admin-companies__table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Company Name</th>
                <th>Contact</th>
                <th>Categories</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => {
                const isCategoryExpanded = expandedCompany === company._id;
                const isProductsExpanded = expandedProducts === company._id;
                const companyProducts = getProductsForCompany(company);

                return (
                  <tr key={company._id}>
                    <td>
                      {company.logo ? (
                        <img 
                          src={`http://localhost:5000${company.logo}`} 
                          alt={company.name}
                          className="admin-companies__logo-img"
                        />
                      ) : (
                        <div className="admin-companies__logo-placeholder">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="admin-companies__name-cell">
                        <strong>{company.name}</strong>
                        {company.description && (
                          <span className="admin-companies__description-text">{company.description}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="admin-companies__contact-cell">
                        {company.email && (
                          <div className="admin-companies__contact-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                              <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <span>{company.email}</span>
                          </div>
                        )}
                        {company.phone && (
                          <div className="admin-companies__contact-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16.92z"/>
                            </svg>
                            <span>{company.phone}</span>
                          </div>
                        )}
                        {company.website && (
                          <div className="admin-companies__contact-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="2" y1="12" x2="22" y2="12"/>
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                            <span>{company.website}</span>
                          </div>
                        )}
                        {!company.email && !company.phone && !company.website && (
                          <span className="admin-companies__no-contact">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="admin-companies__category-cell">
                        <button 
                          className="admin-companies__category-btn"
                          onClick={() => toggleCategoryDropdown(company._id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                          </svg>
                          {company.categories.length} {company.categories.length === 1 ? 'Category' : 'Categories'}
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                            style={{ transform: isCategoryExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                          >
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                        {isCategoryExpanded && company.categories && company.categories.length > 0 && (
                          <div className="admin-companies__category-dropdown">
                            {company.categories.filter(cat => cat && cat._id && cat.name).map(category => {
                              const productCount = getProductCountForCategory(category._id);
                              return (
                                <div 
                                  key={category._id} 
                                  className="admin-companies__category-item"
                                  onClick={() => handleCategoryClick(company._id)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <div className="admin-companies__category-icon" style={{ background: category.color }}>
                                    {category.icon}
                                  </div>
                                  <div className="admin-companies__category-info">
                                    <span className="admin-companies__category-name">{category.name}</span>
                                    <span className="admin-companies__category-products">
                                      {productCount} {productCount === 1 ? 'product' : 'products'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {isCategoryExpanded && (!company.categories || company.categories.length === 0) && (
                          <div className="admin-companies__category-dropdown">
                            <div className="admin-companies__no-categories-dropdown">No categories assigned</div>
                          </div>
                        )}
                        {/* Products dropdown appears when clicking a category */}
                        {isProductsExpanded && companyProducts.length > 0 && (
                          <div className="admin-companies__products-dropdown">
                            {Object.values(getProductsByCategory(company)).filter(item => item && item.category && item.products).map(({ category, products: categoryProducts }) => (
                              <div key={category._id} className="admin-companies__category-group">
                                <div className="admin-companies__category-header">
                                  <div className="admin-companies__category-icon-small" style={{ background: category.color }}>
                                    {category.icon}
                                  </div>
                                  <span className="admin-companies__category-title">{category.name}</span>
                                  <span className="admin-companies__category-count">
                                    {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
                                  </span>
                                </div>
                                <div className="admin-companies__category-products">
                                  {categoryProducts.map(product => (
                                    <div key={product._id} className="admin-companies__product-item">
                                      <img 
                                        src={`http://localhost:5000${product.images[0]}`} 
                                        alt={product.name}
                                        className="admin-companies__product-img"
                                      />
                                      <div className="admin-companies__product-info">
                                        <span className="admin-companies__product-name">{product.name}</span>
                                        <span className="admin-companies__product-price">₹{product.price?.toLocaleString('en-IN')}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {isProductsExpanded && companyProducts.length === 0 && (
                          <div className="admin-companies__products-dropdown">
                            <div className="admin-companies__no-products">No products found</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`admin-companies__badge ${company.isActive ? 'active' : 'inactive'}`}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-companies__actions">
                        <button onClick={() => handleEdit(company)} title="Edit">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(company._id)} title="Delete">
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
        <div className="admin-companies__modal-overlay" onClick={closeModal}>
          <div className="admin-companies__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-companies__modal-header">
              <h2>{editingCompany ? 'Edit Company' : 'Add New Company'}</h2>
              <button onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-companies__form">
              <div className="admin-companies__field">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Kohler, American Standard"
                />
              </div>

              <div className="admin-companies__field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Brief description about the company"
                />
              </div>

              <div className="admin-companies__row">
                <div className="admin-companies__field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@company.com"
                  />
                </div>

                <div className="admin-companies__field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="admin-companies__field">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.company.com"
                />
              </div>

              <div className="admin-companies__field">
                <label>Company Logo</label>
                {existingLogo && !selectedLogo && (
                  <div className="admin-companies__existing-logo">
                    <img src={`http://localhost:5000${existingLogo}`} alt="Current logo" />
                  </div>
                )}
                <label className="admin-companies__upload-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>{selectedLogo ? selectedLogo.name : 'Select Logo Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <small>Recommended: Square image, max 2MB</small>
              </div>

              <div className="admin-companies__field">
                <label>Categories This Company Sells *</label>
                <div className="admin-companies__category-selector">
                  {categories.map(category => (
                    <label key={category._id} className="admin-companies__category-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category._id)}
                        onChange={() => handleCategoryToggle(category._id)}
                      />
                      <span className="admin-companies__category-option" style={{ borderColor: category.color }}>
                        <span className="admin-companies__category-icon" style={{ background: category.color }}>
                          {category.icon}
                        </span>
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.categories.length === 0 && (
                  <small style={{ color: '#e94560' }}>Please select at least one category</small>
                )}
              </div>

              <div className="admin-companies__field">
                <label className="admin-companies__checkbox">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Active (visible on frontend)</span>
                </label>
              </div>

              <div className="admin-companies__modal-actions">
                <button type="button" onClick={closeModal} className="admin-companies__btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="admin-companies__btn-submit">
                  {editingCompany ? 'Update' : 'Create'} Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
