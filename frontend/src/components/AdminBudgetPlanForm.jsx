import { useState, useEffect } from 'react';
import './AdminBudgetPlanForm.css';

const AdminBudgetPlanForm = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [roomTemplates, setRoomTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    // Step 1: Customer & Room Selection
    customer: null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerGST: '',
    isNewCustomer: true,
    roomTemplate: null,
    roomName: '',
    totalBudget: 50000,
    
    // Step 2: Product Selection (Manual)
    selectedProducts: [],
    
    // Notes
    notes: '',
    status: 'draft'
  });

  const [generating, setGenerating] = useState(false);
  const [savingAs, setSavingAs] = useState(null); // 'plan' or 'order'

  useEffect(() => {
    fetchRoomTemplates();
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [productSearchQuery, selectedCategory, allProducts]);

  const fetchRoomTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/room-templates');
      const data = await response.json();
      setRoomTemplates(data);
    } catch (error) {
      console.error('Error fetching room templates:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      const products = data.data || data.products || data || [];
      setAllProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      // Ensure categories is always an array
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const filterProducts = () => {
    let filtered = [...allProducts];

    // Filter by search query
    if (productSearchQuery.trim()) {
      const query = productSearchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.variant?.toLowerCase().includes(query) ||
        product.company?.name?.toLowerCase().includes(query) ||
        product.itemTypeName?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?._id === selectedCategory || product.category === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  };

  const searchContacts = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/contacts/search/autocomplete?q=${query}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching contacts:', error);
    }
  };

  const handleCustomerSearch = (e) => {
    const query = e.target.value;
    setFormData(prev => ({ ...prev, customerName: query }));
    searchContacts(query);
  };

  const selectCustomer = (contact) => {
    setFormData(prev => ({
      ...prev,
      customer: contact._id,
      customerName: contact.name,
      customerEmail: contact.email || '',
      customerPhone: contact.phone || '',
      customerAddress: contact.address ? 
        `${contact.address.street || ''}, ${contact.address.city || ''}, ${contact.address.state || ''} ${contact.address.pincode || ''}`.trim() : '',
      customerGST: contact.gstNumber || '',
      isNewCustomer: false
    }));
    setSearchResults([]);
  };

  const selectRoomTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      roomTemplate: template._id,
      roomName: template.name,
      totalBudget: template.estimatedBudget?.recommended || template.estimatedBudget?.min || 50000
    }));
  };

  const addProductToCart = (product) => {
    const existingIndex = formData.selectedProducts.findIndex(p => p.product === product._id);
    
    if (existingIndex >= 0) {
      // Product already exists, increase quantity
      const updated = [...formData.selectedProducts];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice = updated[existingIndex].unitPrice * updated[existingIndex].quantity;
      setFormData(prev => ({ ...prev, selectedProducts: updated }));
      return;
    }

    // Add new product
    const newProduct = {
      product: product._id,
      productName: product.name,
      variant: product.variant,
      sku: product.sku || '',
      company: product.company?._id || product.company,
      companyName: product.company?.name || '',
      category: product.category?._id || product.category,
      categoryName: product.category?.name || '',
      itemType: product.itemType?._id || product.itemType,
      itemName: product.itemTypeName || product.name,
      itemTypeName: product.itemTypeName || '',
      quantity: 1,
      unitPrice: product.price,
      discount: 0,
      totalPrice: product.price,
      image: product.images?.[0] || ''
    };

    setFormData(prev => ({
      ...prev,
      selectedProducts: [...prev.selectedProducts, newProduct]
    }));
  };

  const updateProductQuantity = (index, quantity) => {
    const updated = [...formData.selectedProducts];
    updated[index].quantity = parseInt(quantity) || 1;
    updated[index].totalPrice = updated[index].unitPrice * updated[index].quantity;
    setFormData(prev => ({ ...prev, selectedProducts: updated }));
  };

  const updateProductDiscount = (index, discount) => {
    const updated = [...formData.selectedProducts];
    updated[index].discount = parseFloat(discount) || 0;
    const discountedPrice = updated[index].unitPrice - updated[index].discount;
    updated[index].totalPrice = discountedPrice * updated[index].quantity;
    setFormData(prev => ({ ...prev, selectedProducts: updated }));
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const totalCost = formData.selectedProducts.reduce((sum, item) => {
      return sum + item.totalPrice;
    }, 0);
    const remainingBudget = formData.totalBudget - totalCost;
    return { totalCost, remainingBudget };
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.customerName) {
        alert('Please provide customer name');
        return;
      }
      
      // Create customer if new
      if (formData.isNewCustomer && !formData.customer) {
        try {
          const response = await fetch('http://localhost:5000/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.customerName,
              email: formData.customerEmail,
              phone: formData.customerPhone,
              contactType: 'individual',
              status: 'active'
            })
          });
          
          if (response.ok) {
            const newContact = await response.json();
            setFormData(prev => ({ ...prev, customer: newContact._id }));
          }
        } catch (error) {
          console.error('Error creating contact:', error);
        }
      }
    }
    
    if (currentStep === 2 && formData.selectedProducts.length === 0) {
      alert('Please add at least one product');
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSaveBudgetPlan = async () => {
    try {
      setSavingAs('plan');
      const totals = calculateTotals();
      
      const budgetPlanData = {
        userId: formData.customer,
        userName: formData.customerName,
        userEmail: formData.customerEmail,
        userPhone: formData.customerPhone,
        roomTemplate: formData.roomTemplate || null,
        roomName: formData.roomName || 'Custom Project',
        totalBudget: formData.totalBudget,
        selectedProducts: formData.selectedProducts.map(item => ({
          itemType: item.itemType,
          itemName: item.itemName || item.itemTypeName || item.productName,
          product: item.product,
          productName: item.productName,
          company: item.company || null,
          companyName: item.companyName || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        totalCost: totals.totalCost,
        remainingBudget: totals.remainingBudget,
        status: 'draft',
        notes: formData.notes
      };

      console.log('Saving budget plan:', budgetPlanData);

      const response = await fetch('http://localhost:5000/api/budget-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetPlanData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Budget plan saved successfully!');
        onSuccess && onSuccess(result);
        onClose && onClose();
      } else {
        console.error('Server error:', result);
        alert(`Error: ${result.message || 'Failed to save budget plan'}`);
      }
    } catch (error) {
      console.error('Error saving budget plan:', error);
      alert(`Error saving budget plan: ${error.message}`);
    } finally {
      setSavingAs(null);
    }
  };

  const handleConvertToOrder = async () => {
    try {
      setSavingAs('order');
      const totals = calculateTotals();
      
      const orderData = {
        customer: formData.customer,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        products: formData.selectedProducts,
        shippingAddress: {
          name: formData.customerName,
          phone: formData.customerPhone,
          street: formData.customerAddress || '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        billingAddress: {
          name: formData.customerName,
          phone: formData.customerPhone,
          street: formData.customerAddress || '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        sameAsShipping: true,
        subtotal: totals.totalCost,
        discount: 0,
        discountType: 'none',
        tax: (totals.totalCost * 18) / 100,
        taxRate: 18,
        shippingCharges: 0,
        total: totals.totalCost + (totals.totalCost * 18) / 100,
        paymentMethod: 'pending',
        paymentStatus: 'pending',
        status: 'draft',
        notes: formData.notes,
        source: 'admin',
        createdBy: 'admin'
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Order created successfully! Order Number: ${result.orderNumber}`);
        onSuccess && onSuccess(result);
        onClose && onClose();
      } else {
        alert(`Error: ${result.message || 'Failed to create order'}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Error creating order: ${error.message}`);
    } finally {
      setSavingAs(null);
    }
  };

  const renderStep1 = () => {
    const selectedTemplate = roomTemplates.find(t => t._id === formData.roomTemplate);
    
    return (
      <div className="form-step full-width">
        <h3>Step 1: Customer & Project Details</h3>
        
        <div className="form-row">
          <div className="form-group flex-2">
            <label>Customer Name *</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={handleCustomerSearch}
              placeholder="Search or enter customer name"
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(contact => (
                  <div key={contact._id} className="search-result-item" onClick={() => selectCustomer(contact)}>
                    <strong>{contact.name}</strong>
                    <span>{contact.phone}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>GST Number</label>
            <input
              type="text"
              value={formData.customerGST}
              onChange={(e) => setFormData(prev => ({ ...prev, customerGST: e.target.value }))}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            value={formData.customerAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
            placeholder="Full address"
          />
        </div>

        <div className="form-group">
          <label>Project / Room Name</label>
          <input
            type="text"
            value={formData.roomName}
            onChange={(e) => setFormData(prev => ({ ...prev, roomName: e.target.value }))}
            placeholder="e.g., Master Bathroom, Kitchen Renovation"
          />
        </div>

        <div className="form-group">
          <label>Select Room Template (Optional)</label>
          <div className="room-templates-grid">
            {roomTemplates.length === 0 ? (
              <p style={{ gridColumn: '1 / -1', color: '#666', fontStyle: 'italic' }}>
                No room templates available.
              </p>
            ) : (
              roomTemplates.map(template => (
                <div 
                  key={template._id} 
                  className={`room-template-card ${formData.roomTemplate === template._id ? 'selected' : ''}`}
                  onClick={() => selectRoomTemplate(template)}
                >
                  <span className="template-icon">{template.icon}</span>
                  <span className="template-name">{template.name}</span>
                  <span className="template-budget">
                    ₹{(template.estimatedBudget?.min / 1000).toFixed(0)}k - ₹{(template.estimatedBudget?.max / 1000).toFixed(0)}k
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Estimated Budget (₹)</label>
          <input
            type="number"
            value={formData.totalBudget}
            onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: parseFloat(e.target.value) || 0 }))}
            min="0"
            step="1000"
            className="budget-input"
          />
        </div>

        <div className="form-group">
          <label>Notes / Requirements</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows="3"
            placeholder="Add any special requirements or notes..."
          />
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const totals = calculateTotals();

    // Show loading state if products haven't loaded yet
    if (allProducts.length === 0) {
      return (
        <div className="form-step product-selection-step">
          <div className="loading-products">
            <p>Loading products...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="form-step product-selection-step">
        <div className="product-selection-layout">
          {/* Left: Product Search & List */}
          <div className="products-panel">
            <div className="products-header">
              <h3>Add Products</h3>
              
              {/* Search Bar */}
              <div className="product-search-bar">
                <input
                  type="text"
                  placeholder="Search products by name, variant, company..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="product-search-input"
                />
              </div>

              {/* Category Filter */}
              <div className="category-filter">
                <button
                  className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </button>
                {Array.isArray(categories) && categories.map(cat => (
                  <button
                    key={cat._id}
                    className={`category-btn ${selectedCategory === cat._id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat._id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="products-grid-scroll">
              {filteredProducts.length === 0 ? (
                <div className="no-products-found">
                  <p>No products found</p>
                  <p className="hint">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <div
                      key={product._id}
                      className="product-card-mini"
                    >
                      {product.images?.[0] && (
                        <img 
                          src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150x150/667eea/ffffff?text=Product';
                          }}
                        />
                      )}
                      <div className="product-card-info">
                        <strong>{product.name}</strong>
                        <span className="variant">{product.variant}</span>
                        <span className="company">{product.company?.name}</span>
                        <span className="price">₹{product.price.toLocaleString()}</span>
                      </div>
                      <button 
                        className="add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addProductToCart(product);
                        }}
                        title="Add to cart"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected Products Cart */}
          <div className="cart-panel">
            <div className="cart-header">
              <h3>Selected Products ({formData.selectedProducts.length})</h3>
              
              {/* Budget Summary */}
              <div className="budget-summary-compact">
                <div className="summary-row">
                  <span>Budget:</span>
                  <strong>₹{formData.totalBudget.toLocaleString()}</strong>
                </div>
                <div className="summary-row">
                  <span>Selected:</span>
                  <strong>₹{totals.totalCost.toLocaleString()}</strong>
                </div>
                <div className={`summary-row ${totals.remainingBudget < 0 ? 'over-budget' : 'under-budget'}`}>
                  <span>Remaining:</span>
                  <strong>₹{totals.remainingBudget.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="cart-items-scroll">
              {formData.selectedProducts.length === 0 ? (
                <div className="empty-cart">
                  <p>No products added yet</p>
                  <p className="hint">Click on products to add them</p>
                </div>
              ) : (
                <div className="cart-items">
                  {formData.selectedProducts.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div className="cart-item-image">
                        {item.image && (
                          <img 
                            src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
                            alt={item.productName}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/60x60/667eea/ffffff?text=?';
                            }}
                          />
                        )}
                      </div>
                      <div className="cart-item-details">
                        <strong>{item.productName}</strong>
                        <span className="variant">{item.variant}</span>
                        <span className="company">{item.companyName}</span>
                        <div className="cart-item-controls">
                          <div className="quantity-control">
                            <label>Qty:</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateProductQuantity(index, e.target.value)}
                            />
                          </div>
                          <div className="discount-control">
                            <label>Disc:</label>
                            <input
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(e) => updateProductDiscount(index, e.target.value)}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="cart-item-price">
                          <span className="unit-price">₹{item.unitPrice.toLocaleString()} each</span>
                          <span className="total-price">₹{item.totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeProduct(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="cart-actions">
              <button 
                className="btn-save-plan"
                onClick={handleSaveBudgetPlan}
                disabled={formData.selectedProducts.length === 0 || savingAs === 'plan'}
              >
                {savingAs === 'plan' ? 'Saving...' : '💾 Save Budget Plan'}
              </button>
              <button 
                className="btn-convert-order"
                onClick={handleConvertToOrder}
                disabled={formData.selectedProducts.length === 0 || savingAs === 'order'}
              >
                {savingAs === 'order' ? 'Creating...' : '📦 Convert to Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay fullscreen">
      <div className="modal-content budget-plan-form-modal fullscreen">
        <div className="modal-header">
          <h2>Create Budget Plan / Order</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="step-indicator">
          {[1, 2].map(step => (
            <div key={step} className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Customer & Project'}
                {step === 2 && 'Products'}
              </div>
            </div>
          ))}
        </div>

        <div className="form-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
        </div>

        {currentStep === 1 && (
          <div className="modal-footer">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleNext} className="btn-primary">
              Next: Add Products
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="modal-footer">
            <button onClick={handlePrevious} className="btn-secondary">
              ← Previous
            </button>
            <span className="footer-hint">👉 Add products, then use the "Save" or "Convert to Order" buttons in the cart panel on the right →</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBudgetPlanForm;
