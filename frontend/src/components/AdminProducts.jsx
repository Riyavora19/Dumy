import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import './AdminProducts.css';

const AdminProducts = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterItemType, setFilterItemType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    company: '',
    companyName: '',
    itemType: '',
    itemTypeName: '',
    variant: '',
    price: '',
    originalPrice: '',
    sku: '',
    stock: 0,
    isActive: true,
    tags: '',
    rating: 0,
    specifications: {
      material: '',
      size: '',
      color: '',
      warranty: '',
      features: ''
    }
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkProducts, setBulkProducts] = useState([
    {
      id: Date.now(),
      name: '',
      description: '',
      category: '',
      company: '',
      price: '',
      sku: '',
      stock: 0,
      images: [],
      isActive: true
    }
  ]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCompanies();
    fetchItemTypes();
  }, [filterCategory, filterCompany, filterItemType, filterStatus]);

  const handleSearch = () => {
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterCompany('');
    setFilterItemType('');
    setFilterStatus('');
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      setLoading(true);
      
      // Build query params
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterCompany) params.company = filterCompany;
      if (filterItemType) params.itemType = filterItemType;
      if (filterStatus) params.isActive = filterStatus === 'active';
      
      const response = await axios.get('http://localhost:5000/api/products', { params });
      console.log('Products response:', response.data);
      
      if (response.data.success) {
        let filteredProducts = response.data.data.filter(p => 
          p && p._id && p.name && p.price && p.images && p.images.length > 0
        );
        
        // Apply search filter on frontend
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(search) ||
            p.description?.toLowerCase().includes(search) ||
            p.sku?.toLowerCase().includes(search) ||
            p.variant?.toLowerCase().includes(search) ||
            (typeof p.company === 'object' ? p.company?.name?.toLowerCase().includes(search) : p.company?.toLowerCase().includes(search))
          );
        }
        
        console.log('Valid products:', filteredProducts.length);
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Failed to load products. Please refresh the page.', 'error');
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

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/companies');
      if (response.data.success) {
        // Filter to show only partner companies
        const partnerCompanies = response.data.data.filter(c => c.isPartner);
        setCompanies(partnerCompanies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchItemTypes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/item-types');
      setItemTypes(response.data);
    } catch (error) {
      console.error('Error fetching item types:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle company selection
    if (name === 'company') {
      const selectedCompany = companies.find(c => c._id === value);
      setFormData({
        ...formData,
        company: value,
        companyName: selectedCompany ? selectedCompany.name : ''
      });
      return;
    }
    
    // Handle item type selection
    if (name === 'itemType') {
      const selectedItemType = itemTypes.find(it => it._id === value);
      setFormData({
        ...formData,
        itemType: value,
        itemTypeName: selectedItemType ? selectedItemType.name : ''
      });
      return;
    }
    
    // Handle specifications
    if (name.startsWith('spec_')) {
      const specField = name.replace('spec_', '');
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specField]: value
        }
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('Selected files:', selectedFiles);
    console.log('Existing images:', existingImages);
    
    // Validation
    if (!formData.name || !formData.category || !formData.price) {
      showNotification('Please fill in all required fields: Name, Category, and Price', 'error');
      return;
    }
    
    if (!editingProduct && selectedFiles.length === 0) {
      showNotification('Please select at least one image for the product', 'error');
      return;
    }
    
    if (editingProduct && existingImages.length === 0 && selectedFiles.length === 0) {
      showNotification('Please select at least one image for the product', 'error');
      return;
    }
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('company', formData.company || '');
    data.append('companyName', formData.companyName || '');
    data.append('itemType', formData.itemType || '');
    data.append('itemTypeName', formData.itemTypeName || '');
    data.append('variant', formData.variant || 'Standard');
    data.append('price', formData.price);
    data.append('originalPrice', formData.originalPrice || formData.price);
    data.append('sku', formData.sku || `SKU-${Date.now()}`);
    data.append('stock', formData.stock || 0);
    data.append('isActive', formData.isActive);
    data.append('tags', formData.tags || '');
    data.append('rating', formData.rating || 0);
    data.append('specifications', JSON.stringify(formData.specifications));

    // Add existing images if editing
    if (editingProduct) {
      existingImages.forEach(img => {
        data.append('existingImages', img);
      });
    }

    // Add new images
    selectedFiles.forEach(file => {
      data.append('images', file);
    });

    try {
      console.log('Sending request...');
      if (editingProduct) {
        const response = await axios.put(
          `http://localhost:5000/api/products/${editingProduct._id}`,
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log('Update response:', response.data);
        if (response.data.success) {
          showNotification('Product updated successfully!', 'success');
          fetchProducts();
          closeModal();
        }
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/products',
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log('Create response:', response.data);
        if (response.data.success) {
          showNotification('Product created successfully!', 'success');
          fetchProducts();
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      showNotification(error.response?.data?.message || 'Failed to save product. Check console for details.', 'error');
    }
  };

  const handleEdit = (product) => {
    console.log('Editing product:', product);
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category?._id || '',
      company: (typeof product.company === 'object' ? product.company?._id : product.company) || '',
      companyName: (typeof product.company === 'object' ? product.company?.name : product.company) || '',
      itemType: (typeof product.itemType === 'object' ? product.itemType?._id : product.itemType) || '',
      itemTypeName: (typeof product.itemType === 'object' ? product.itemType?.name : product.itemTypeName) || '',
      variant: product.variant || '',
      price: product.price || '',
      originalPrice: product.originalPrice || product.price || '',
      sku: product.sku || '',
      stock: product.stock || 0,
      isActive: product.isActive !== undefined ? product.isActive : true,
      tags: product.tags ? product.tags.join(', ') : '',
      rating: product.rating || 0,
      specifications: product.specifications || {
        material: '',
        size: '',
        color: '',
        warranty: '',
        features: ''
      }
    });
    setExistingImages(product.images || []);
    setSelectedFiles([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await axios.delete(`http://localhost:5000/api/products/${id}`);
      if (response.data.success) {
        showNotification('Product deleted successfully!', 'success');
        fetchProducts();
      }
    } catch (error) {
      showNotification('Failed to delete product', 'error');
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const openModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      company: '',
      companyName: '',
      itemType: '',
      itemTypeName: '',
      variant: '',
      price: '',
      originalPrice: '',
      sku: '',
      stock: 0,
      isActive: true,
      tags: '',
      rating: 0,
      specifications: {
        material: '',
        size: '',
        color: '',
        warranty: '',
        features: ''
      }
    });
    setSelectedFiles([]);
    setExistingImages([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setSelectedFiles([]);
    setExistingImages([]);
  };

  // Bulk upload functions
  const openBulkModal = () => {
    setBulkProducts([
      {
        id: Date.now(),
        name: '',
        description: '',
        category: '',
        company: '',
        price: '',
        sku: '',
        stock: 0,
        images: [],
        isActive: true
      }
    ]);
    setShowBulkModal(true);
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
    setBulkProducts([]);
  };

  const addBulkProduct = () => {
    setBulkProducts([
      ...bulkProducts,
      {
        id: Date.now(),
        name: '',
        description: '',
        category: '',
        company: '',
        price: '',
        sku: '',
        stock: 0,
        images: [],
        isActive: true
      }
    ]);
  };

  const removeBulkProduct = (id) => {
    if (bulkProducts.length === 1) {
      showNotification('You must have at least one product', 'warning');
      return;
    }
    setBulkProducts(bulkProducts.filter(p => p.id !== id));
  };

  const handleBulkChange = (id, field, value) => {
    setBulkProducts(bulkProducts.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleBulkFileChange = (id, files) => {
    const fileArray = Array.from(files);
    setBulkProducts(bulkProducts.map(p => 
      p.id === id ? { ...p, images: fileArray } : p
    ));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    let successCount = 0;
    let failCount = 0;

    for (const product of bulkProducts) {
      if (!product.name || !product.category || !product.price || product.images.length === 0) {
        failCount++;
        continue;
      }

      const data = new FormData();
      data.append('name', product.name);
      data.append('description', product.description);
      data.append('category', product.category);
      data.append('company', product.company);
      data.append('price', product.price);
      data.append('sku', product.sku);
      data.append('stock', product.stock);
      data.append('isActive', product.isActive);

      product.images.forEach(file => {
        data.append('images', file);
      });

      try {
        const response = await axios.post(
          'http://localhost:5000/api/products',
          data,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (response.data.success) {
          successCount++;
        }
      } catch (error) {
        console.error('Error creating product:', error);
        failCount++;
      }
    }

    showNotification(`Bulk upload complete!\nSuccess: ${successCount}\nFailed: ${failCount}`, successCount > 0 ? 'success' : 'error');
    fetchProducts();
    closeBulkModal();
  };

  return (
    <div className="admin-products">
      <header className="admin-products__header">
        <div>
          <h1>Products Management</h1>
          <p className="admin-products__subtitle">{products.length} total products</p>
        </div>
        <div className="admin-products__header-actions">
          <button className="admin-products__bulk-btn" onClick={openBulkModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            Bulk Upload
          </button>
          <button className="admin-products__add-btn" onClick={openModal}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </button>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="admin-products__filters">
        <div className="admin-products__search">
          <input
            type="text"
            placeholder="Search by name, SKU, variant, or company..."
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

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)}>
          <option value="">All Companies</option>
          {companies.map(comp => (
            <option key={comp._id} value={comp._id}>{comp.name}</option>
          ))}
        </select>

        <select value={filterItemType} onChange={(e) => setFilterItemType(e.target.value)}>
          <option value="">All Item Types</option>
          {itemTypes.map(it => (
            <option key={it._id} value={it._id}>{it.icon} {it.name}</option>
          ))}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {(searchTerm || filterCategory || filterCompany || filterItemType || filterStatus) && (
          <button className="admin-products__clear-btn" onClick={handleClearFilters}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="admin-products__loading">Loading products...</div>
      ) : (
        <div className="admin-products__table-container">
          <table className="admin-products__table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Company</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    {product.images && product.images[0] ? (
                      <img 
                        src={`http://localhost:5000${product.images[0]}`} 
                        alt={product.name}
                        className="admin-products__thumb"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100/667eea/ffffff?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="admin-products__thumb" style={{ 
                        background: '#f0f0f0', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: '#999'
                      }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td><strong>{product.name}</strong></td>
                  <td>{product.category?.name || 'N/A'}</td>
                  <td>
                    {typeof product.company === 'object' 
                      ? (product.company?.name || '-')
                      : (product.company || '-')
                    }
                  </td>
                  <td>${product.price}</td>
                  <td>{product.stock || 0}</td>
                  <td>
                    <div className="admin-products__actions">
                      <button onClick={() => handleEdit(product)} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(product._id)} title="Delete">
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

      {/* Modal */}
      {showModal && (
        <div className="admin-products__modal-overlay" onClick={closeModal}>
          <div className="admin-products__modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-products__modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-products__form">
              <div className="admin-products__field">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="admin-products__field">
                <label>Item Type (for Budget Planner)</label>
                <select
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleChange}
                >
                  <option value="">Select item type (optional)</option>
                  {itemTypes
                    .filter(it => !formData.category || it.category._id === formData.category)
                    .map(it => (
                      <option key={it._id} value={it._id}>
                        {it.icon} {it.name}
                      </option>
                    ))}
                </select>
                <small>Select to make this product appear in budget recommendations</small>
              </div>

              <div className="admin-products__field">
                <label>Company / Brand</label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                >
                  <option value="">Select company (optional)</option>
                  {companies.map(comp => (
                    <option key={comp._id} value={comp._id}>
                      {comp.name} {comp.isPartner ? '⭐' : ''}
                    </option>
                  ))}
                </select>
                <small>⭐ = Partner company (shown in budget planner)</small>
              </div>

              <div className="admin-products__field">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Premium Ceramic Toilet Seat"
                />
              </div>

              <div className="admin-products__field">
                <label>Variant / Model</label>
                <input
                  type="text"
                  name="variant"
                  value={formData.variant}
                  onChange={handleChange}
                  placeholder="e.g., White Ceramic, Chrome Finish"
                />
              </div>

              <div className="admin-products__field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Product description"
                />
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Original Price</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <small>For showing discounts</small>
                </div>

                <div className="admin-products__field">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="admin-products__row">
                <div className="admin-products__field">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="Product SKU"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Rating (0-5)</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="4.5"
                  />
                </div>

                <div className="admin-products__field">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="premium, ceramic, soft-close"
                  />
                </div>
              </div>

              <div className="admin-products__field">
                <label>Specifications (Optional)</label>
                <div className="admin-products__specs-grid">
                  <input
                    type="text"
                    name="spec_material"
                    value={formData.specifications.material}
                    onChange={handleChange}
                    placeholder="Material (e.g., Ceramic)"
                  />
                  <input
                    type="text"
                    name="spec_size"
                    value={formData.specifications.size}
                    onChange={handleChange}
                    placeholder="Size (e.g., 24x18 inches)"
                  />
                  <input
                    type="text"
                    name="spec_color"
                    value={formData.specifications.color}
                    onChange={handleChange}
                    placeholder="Color (e.g., White)"
                  />
                  <input
                    type="text"
                    name="spec_warranty"
                    value={formData.specifications.warranty}
                    onChange={handleChange}
                    placeholder="Warranty (e.g., 2 Years)"
                  />
                  <input
                    type="text"
                    name="spec_features"
                    value={formData.specifications.features}
                    onChange={handleChange}
                    placeholder="Features (comma separated)"
                  />
                </div>
              </div>

              {editingProduct && existingImages.length > 0 && (
                <div className="admin-products__field">
                  <label>Existing Images</label>
                  <div className="admin-products__existing-images">
                    {existingImages.map((img, index) => (
                      <div key={index} className="admin-products__existing-image">
                        <img src={`http://localhost:5000${img}`} alt="" />
                        <button type="button" onClick={() => removeExistingImage(index)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="admin-products__field">
                <label>Product Images * {editingProduct && '(Add more images)'}</label>
                <div className="admin-products__upload-options">
                  <div className="admin-products__upload-option">
                    <label className="admin-products__upload-label">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span>Select Multiple Images</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
                <small>Select multiple images at once (Max 10 images, 5MB each)</small>
                {selectedFiles.length > 0 && (
                  <div className="admin-products__file-list">
                    <strong>{selectedFiles.length} file(s) selected:</strong>
                    {selectedFiles.map((file, index) => (
                      <span key={index}>📷 {file.name}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-products__field">
                <label className="admin-products__checkbox">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Active (visible on frontend)</span>
                </label>
              </div>

              <div className="admin-products__modal-actions">
                <button type="button" onClick={closeModal} className="admin-products__btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="admin-products__btn-submit">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="admin-products__modal-overlay" onClick={closeBulkModal}>
          <div className="admin-products__bulk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-products__modal-header">
              <h2>Bulk Upload Products</h2>
              <button onClick={closeBulkModal}>×</button>
            </div>

            <form onSubmit={handleBulkSubmit} className="admin-products__bulk-form">
              <div className="admin-products__bulk-products">
                {bulkProducts.map((product, index) => (
                  <div key={product.id} className="admin-products__bulk-item">
                    <div className="admin-products__bulk-item-header">
                      <h3>Product {index + 1}</h3>
                      {bulkProducts.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeBulkProduct(product.id)}
                          className="admin-products__remove-bulk"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="admin-products__bulk-grid">
                      <div className="admin-products__field">
                        <label>Category *</label>
                        <select
                          value={product.category}
                          onChange={(e) => handleBulkChange(product.id, 'category', e.target.value)}
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="admin-products__field">
                        <label>Product Name *</label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => handleBulkChange(product.id, 'name', e.target.value)}
                          required
                          placeholder="Product name"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Company / Brand</label>
                        <input
                          type="text"
                          value={product.company}
                          onChange={(e) => handleBulkChange(product.id, 'company', e.target.value)}
                          placeholder="Company name"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Price *</label>
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => handleBulkChange(product.id, 'price', e.target.value)}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>Stock</label>
                        <input
                          type="number"
                          value={product.stock}
                          onChange={(e) => handleBulkChange(product.id, 'stock', e.target.value)}
                          min="0"
                          placeholder="0"
                        />
                      </div>

                      <div className="admin-products__field">
                        <label>SKU</label>
                        <input
                          type="text"
                          value={product.sku}
                          onChange={(e) => handleBulkChange(product.id, 'sku', e.target.value)}
                          placeholder="SKU"
                        />
                      </div>
                    </div>

                    <div className="admin-products__field">
                      <label>Description</label>
                      <textarea
                        value={product.description}
                        onChange={(e) => handleBulkChange(product.id, 'description', e.target.value)}
                        rows="2"
                        placeholder="Product description"
                      />
                    </div>

                    <div className="admin-products__field">
                      <label>Product Images *</label>
                      <label className="admin-products__upload-label">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span>Select Images for This Product</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleBulkFileChange(product.id, e.target.files)}
                          required
                          style={{ display: 'none' }}
                        />
                      </label>
                      {product.images.length > 0 && (
                        <div className="admin-products__file-list">
                          <strong>{product.images.length} image(s) selected</strong>
                          {product.images.map((file, idx) => (
                            <span key={idx}>📷 {file.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={addBulkProduct}
                className="admin-products__add-more-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Another Product
              </button>

              <div className="admin-products__modal-actions">
                <button type="button" onClick={closeBulkModal} className="admin-products__btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="admin-products__btn-submit">
                  Upload All Products ({bulkProducts.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
