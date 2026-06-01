import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import axios from '../utils/axios';
import './AdminStock.css';

function AdminStock() {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('all'); // all, in-stock, low-stock, out-of-stock
  const [editingStock, setEditingStock] = useState({});
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('all');

  useEffect(() => {
    fetchProducts();
    fetchCompanies();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch products...');
      const response = await axios.get('/products');
      console.log('Products API Response:', response);
      console.log('Products API Response Data:', response.data);
      
      // Handle different response structures
      let productsData = [];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (response.data.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      }
      
      console.log('Processed Products Data:', productsData);
      console.log('Products Count:', productsData.length);
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', error.response);
      showNotification('Failed to fetch products', 'error');
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
      console.log('Finished fetching products');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/companies');
      console.log('Companies API Response:', response.data);
      
      // Handle different response structures
      let companiesData = [];
      if (Array.isArray(response.data)) {
        companiesData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        companiesData = response.data.data;
      } else if (response.data.companies && Array.isArray(response.data.companies)) {
        companiesData = response.data.companies;
      }
      
      console.log('Processed Companies Data:', companiesData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]); // Set empty array on error
    }
  };

  const handleStockChange = (productId, value) => {
    setEditingStock(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const updateStock = async (productId) => {
    const newStock = editingStock[productId];
    
    console.log('=== UPDATE STOCK DEBUG ===');
    console.log('Product ID:', productId);
    console.log('New Stock Value:', newStock);
    console.log('Type:', typeof newStock);
    
    if (newStock === undefined || newStock === '') {
      showNotification('Please enter a valid stock value', 'error');
      return;
    }

    const stockValue = parseInt(newStock);
    console.log('Parsed Stock Value:', stockValue);
    
    if (isNaN(stockValue) || stockValue < 0) {
      showNotification('Please enter a valid positive number', 'error');
      return;
    }

    try {
      console.log('Sending PUT request to:', `/products/${productId}`);
      console.log('Request body:', { stock: stockValue });
      
      const response = await axios.put(`/products/${productId}`, {
        stock: stockValue
      });
      
      console.log('✅ Update response:', response.data);
      console.log('Updated product stock:', response.data.data?.stock);

      // Update local state immediately
      setProducts(prev => {
        const updated = prev.map(p => {
          if (p._id === productId) {
            console.log('Updating product in state:', p.name, 'from', p.stock, 'to', stockValue);
            return { ...p, stock: stockValue };
          }
          return p;
        });
        console.log('Updated products state');
        return updated;
      });

      // Clear editing state
      setEditingStock(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });

      showNotification(`Stock updated to ${stockValue} successfully!`, 'success');
      console.log('=== UPDATE COMPLETE ===');
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      showNotification(error.response?.data?.message || 'Failed to update stock', 'error');
    }
  };

  const bulkUpdateStock = async (adjustment) => {
    if (!window.confirm(`Are you sure you want to ${adjustment > 0 ? 'increase' : 'decrease'} stock by ${Math.abs(adjustment)} for filtered products?`)) {
      return;
    }

    try {
      const filteredProducts = getFilteredProducts();
      const updates = filteredProducts.map(product => 
        axios.put(`/products/${product._id}`, {
          stock: Math.max(0, product.stock + adjustment)
        })
      );

      await Promise.all(updates);
      await fetchProducts();
      showNotification(`Bulk stock update completed for ${filteredProducts.length} products!`, 'success');
    } catch (error) {
      console.error('Error in bulk update:', error);
      showNotification('Failed to complete bulk update', 'error');
    }
  };

  const getFilteredProducts = () => {
    // Safety check: ensure products is an array
    if (!Array.isArray(products)) {
      console.log('Products is not an array:', products);
      return [];
    }

    return products.filter(product => {
      // Search filter
      const matchesSearch = 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.variant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Stock filter - handle undefined/null stock values and convert to number
      const productStock = parseInt(product.stock) || 0;
      let matchesStock = true;
      if (filterStock === 'in-stock') {
        matchesStock = productStock > 10;
      } else if (filterStock === 'low-stock') {
        matchesStock = productStock >= 1 && productStock <= 10;
      } else if (filterStock === 'out-of-stock') {
        matchesStock = productStock === 0;
      }

      // Company filter
      const matchesCompany = selectedCompany === 'all' || product.company?._id === selectedCompany;

      return matchesSearch && matchesStock && matchesCompany;
    });
  };

  const getStockStatus = (stock) => {
    const stockValue = parseInt(stock) || 0;
    if (stockValue === 0) return { label: 'Out of Stock', class: 'out-of-stock' };
    if (stockValue <= 10) return { label: 'Low Stock', class: 'low-stock' };
    return { label: 'In Stock', class: 'in-stock' };
  };

  const filteredProducts = getFilteredProducts();

  // Safety check for stock statistics
  const safeProducts = Array.isArray(products) ? products : [];
  
  console.log('🔄 Component render - Total products:', safeProducts.length);
  console.log('🔄 Filtered products:', filteredProducts.length);
  
  const stockStats = {
    total: safeProducts.length,
    inStock: safeProducts.filter(p => parseInt(p.stock) > 10).length,
    lowStock: safeProducts.filter(p => {
      const stock = parseInt(p.stock) || 0;
      return stock >= 1 && stock <= 10;
    }).length,
    outOfStock: safeProducts.filter(p => (parseInt(p.stock) || 0) === 0).length,
    totalUnits: safeProducts.reduce((sum, p) => sum + (parseInt(p.stock) || 0), 0)
  };

  console.log('Current products state:', products);
  console.log('Safe products:', safeProducts);
  console.log('Filtered products:', filteredProducts);
  console.log('Stock stats:', stockStats);

  if (loading) {
    return <div className="admin-section-loading">Loading stock data...</div>;
  }

  return (
    <div className="admin-stock">
      <div className="admin-section-header">
        <h2>📦 Stock Management</h2>
        <div className="header-actions">
          <button 
            className="btn-refresh"
            onClick={fetchProducts}
            title="Refresh stock data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stock Statistics */}
      <div className="stock-stats">
        <div 
          className={`stat-card ${filterStock === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStock('all')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{stockStats.total}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div 
          className={`stat-card in-stock ${filterStock === 'in-stock' ? 'active' : ''}`}
          onClick={() => setFilterStock('in-stock')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stockStats.inStock}</div>
            <div className="stat-label">In Stock</div>
          </div>
        </div>
        <div 
          className={`stat-card low-stock ${filterStock === 'low-stock' ? 'active' : ''}`}
          onClick={() => setFilterStock('low-stock')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{stockStats.lowStock}</div>
            <div className="stat-label">Low Stock</div>
          </div>
        </div>
        <div 
          className={`stat-card out-of-stock ${filterStock === 'out-of-stock' ? 'active' : ''}`}
          onClick={() => setFilterStock('out-of-stock')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-value">{stockStats.outOfStock}</div>
            <div className="stat-label">Out of Stock</div>
          </div>
        </div>
        <div className="stat-card total-units">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{stockStats.totalUnits.toLocaleString()}</div>
            <div className="stat-label">Total Units</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="stock-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Search by name, variant, item code, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Stock Levels</option>
            <option value="in-stock">In Stock (&gt;10)</option>
            <option value="low-stock">Low Stock (1-10)</option>
            <option value="out-of-stock">Out of Stock (0)</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Companies</option>
            {companies.map(company => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <button 
            className="btn-bulk"
            onClick={() => bulkUpdateStock(10)}
            disabled={filteredProducts.length === 0}
          >
            +10 Bulk
          </button>
          <button 
            className="btn-bulk"
            onClick={() => bulkUpdateStock(-10)}
            disabled={filteredProducts.length === 0}
          >
            -10 Bulk
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        Showing {filteredProducts.length} of {safeProducts.length} products
      </div>

      {/* Stock Table */}
      <div className="stock-table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Variant</th>
              <th>Company</th>
              <th>Item Code</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Update Stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No products found matching your filters
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const status = getStockStatus(product.stock);
                const isEditing = editingStock.hasOwnProperty(product._id);
                const editValue = isEditing ? editingStock[product._id] : product.stock;

                return (
                  <tr key={`${product._id}-${product.stock}`}>
                    <td>
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="product-thumb"
                        />
                      ) : (
                        <div className="product-thumb-placeholder">📦</div>
                      )}
                    </td>
                    <td className="product-name">{product.name}</td>
                    <td className="product-variant">{product.variant || '-'}</td>
                    <td className="product-company">
                      {product.company?.name || '-'}
                    </td>
                    <td className="product-item-code">{product.itemCode || '-'}</td>
                    <td className="stock-value">
                      <span className={`stock-badge ${status.class}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          min="0"
                          value={editValue}
                          onChange={(e) => handleStockChange(product._id, e.target.value)}
                          className="stock-input"
                          placeholder="New stock"
                          style={{ width: '80px' }}
                        />
                        <button
                          className="btn-update"
                          onClick={() => {
                            console.log('Update button clicked for product:', product._id);
                            console.log('isEditing:', editingStock.hasOwnProperty(product._id));
                            console.log('editValue:', editingStock[product._id]);
                            console.log('product.stock:', product.stock);
                            updateStock(product._id);
                          }}
                          disabled={!editingStock.hasOwnProperty(product._id) || parseInt(editingStock[product._id]) === parseInt(product.stock)}
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminStock;
