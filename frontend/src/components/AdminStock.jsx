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
      const response = await axios.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showNotification('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
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
    
    if (newStock === undefined || newStock === '') {
      showNotification('Please enter a valid stock value', 'error');
      return;
    }

    try {
      await axios.put(`/products/${productId}`, {
        stock: parseInt(newStock)
      });

      // Update local state
      setProducts(prev => prev.map(p => 
        p._id === productId ? { ...p, stock: parseInt(newStock) } : p
      ));

      // Clear editing state
      setEditingStock(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });

      showNotification('Stock updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating stock:', error);
      showNotification('Failed to update stock', 'error');
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
    return products.filter(product => {
      // Search filter
      const matchesSearch = 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.variant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Stock filter
      let matchesStock = true;
      if (filterStock === 'in-stock') {
        matchesStock = product.stock > 10;
      } else if (filterStock === 'low-stock') {
        matchesStock = product.stock > 0 && product.stock <= 10;
      } else if (filterStock === 'out-of-stock') {
        matchesStock = product.stock === 0;
      }

      // Company filter
      const matchesCompany = selectedCompany === 'all' || product.company?._id === selectedCompany;

      return matchesSearch && matchesStock && matchesCompany;
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', class: 'out-of-stock' };
    if (stock <= 10) return { label: 'Low Stock', class: 'low-stock' };
    return { label: 'In Stock', class: 'in-stock' };
  };

  const filteredProducts = getFilteredProducts();

  const stockStats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 10).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalUnits: products.reduce((sum, p) => sum + (p.stock || 0), 0)
  };

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
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{stockStats.total}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div className="stat-card in-stock">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stockStats.inStock}</div>
            <div className="stat-label">In Stock</div>
          </div>
        </div>
        <div className="stat-card low-stock">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{stockStats.lowStock}</div>
            <div className="stat-label">Low Stock</div>
          </div>
        </div>
        <div className="stat-card out-of-stock">
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
            placeholder="🔍 Search by name, variant, SKU, or company..."
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
        Showing {filteredProducts.length} of {products.length} products
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
              <th>SKU</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Update Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No products found matching your filters
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const status = getStockStatus(product.stock);
                const isEditing = editingStock.hasOwnProperty(product._id);
                const editValue = isEditing ? editingStock[product._id] : product.stock;

                return (
                  <tr key={product._id}>
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
                    <td className="product-sku">{product.sku || '-'}</td>
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
                      <input
                        type="number"
                        min="0"
                        value={editValue}
                        onChange={(e) => handleStockChange(product._id, e.target.value)}
                        className="stock-input"
                        placeholder="New stock"
                      />
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-update"
                          onClick={() => updateStock(product._id)}
                          disabled={!isEditing || editValue === product.stock}
                        >
                          Update
                        </button>
                        <button
                          className="btn-quick"
                          onClick={() => {
                            handleStockChange(product._id, product.stock + 1);
                            setTimeout(() => updateStock(product._id), 100);
                          }}
                          title="Add 1"
                        >
                          +1
                        </button>
                        <button
                          className="btn-quick"
                          onClick={() => {
                            handleStockChange(product._id, Math.max(0, product.stock - 1));
                            setTimeout(() => updateStock(product._id), 100);
                          }}
                          title="Remove 1"
                        >
                          -1
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
