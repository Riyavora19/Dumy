import { useState, useEffect } from 'react';
import './AdminOrderForm.css';

const AdminOrderForm = ({ onClose, onSuccess, budgetPlan = null }) => {
  const [currentStep, setCurrentStep] = useState(budgetPlan ? 1 : 1); // Skip to step 1 if from budget plan
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    // Step 1: Customer Details
    customer: budgetPlan?.userId || null,
    customerName: budgetPlan?.userName || '',
    customerEmail: budgetPlan?.userEmail || '',
    customerPhone: budgetPlan?.userPhone || '',
    isNewCustomer: !budgetPlan?.userId,
    
    // Step 2: Referral Information
    hasReferrer: false,
    referrer: null,
    referrerName: '',
    relationshipType: '',
    relationshipContext: '',
    howTheyMet: '',
    
    // Step 3: Products (pre-filled from budget plan)
    selectedProducts: budgetPlan ? budgetPlan.selectedProducts.map(item => ({
      product: item.product?._id || item.product || null,
      productName: item.productName || '',
      sku: item.product?.sku || '',
      company: item.company || null,
      companyName: item.companyName || '',
      category: item.product?.category || null,
      categoryName: item.product?.categoryName || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      discount: 0,
      tax: 0,
      totalPrice: item.totalPrice || 0,
      image: item.product?.images?.[0] || ''
    })) : [],
    
    // Step 4: Addresses
    shippingAddress: {
      name: budgetPlan?.userName || '',
      phone: budgetPlan?.userPhone || '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      landmark: ''
    },
    billingAddress: {
      name: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    sameAsShipping: true,
    billToName: '',
    billToContact: null,
    
    // Step 5: Payment & Final
    paymentMethod: 'pending',
    discount: 0,
    discountType: 'none',
    shippingCharges: 0,
    notes: budgetPlan?.notes || '',
    internalNotes: '',
    budgetPlanId: budgetPlan?._id || null
  });

  useEffect(() => {
    fetchProducts();
    loadRelationshipTypes();
  }, []);

  const loadRelationshipTypes = () => {
    setRelationshipTypes([
      { value: 'friend', label: 'Friend' },
      { value: 'family', label: 'Family Member' },
      { value: 'colleague', label: 'Colleague/Coworker' },
      { value: 'manager', label: 'Boss/Manager' },
      { value: 'employee', label: 'Employee/Team Member' },
      { value: 'business-partner', label: 'Business Partner' },
      { value: 'architect', label: 'Architect/Designer' },
      { value: 'contractor', label: 'Contractor/Builder' },
      { value: 'vendor', label: 'Previous Vendor/Supplier' },
      { value: 'client', label: 'Client' },
      { value: 'neighbor', label: 'Neighbor' },
      { value: 'acquaintance', label: 'Acquaintance' },
      { value: 'other', label: 'Other' }
    ]);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      console.log('Products API response:', data); // Debug log
      setProducts(data.data || data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
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
      isNewCustomer: false,
      shippingAddress: {
        ...prev.shippingAddress,
        name: contact.name,
        phone: contact.phone || '',
        street: contact.address?.street || '',
        city: contact.address?.city || '',
        state: contact.address?.state || '',
        pincode: contact.address?.pincode || '',
        country: contact.address?.country || 'India'
      }
    }));
    setSearchResults([]);
  };

  const handleReferrerSearch = (e) => {
    const query = e.target.value;
    setFormData(prev => ({ ...prev, referrerName: query }));
    searchContacts(query);
  };

  const selectReferrer = (contact) => {
    setFormData(prev => ({
      ...prev,
      referrer: contact._id,
      referrerName: contact.name
    }));
    setSearchResults([]);
  };

  const addProduct = (product) => {
    const existingProduct = formData.selectedProducts.find(p => p.product === product._id);
    
    if (existingProduct) {
      return;
    }

    const newProduct = {
      product: product._id,
      productName: product.name,
      sku: product.sku,
      company: product.company?._id,
      companyName: product.company?.name,
      category: product.category?._id,
      categoryName: product.category?.name,
      quantity: 1,
      unitPrice: product.price || 0,
      discount: 0,
      tax: 0,
      totalPrice: product.price || 0,
      image: product.images?.[0]
    };

    setFormData(prev => ({
      ...prev,
      selectedProducts: [...prev.selectedProducts, newProduct]
    }));
  };

  const updateProductQuantity = (index, quantity) => {
    const updatedProducts = [...formData.selectedProducts];
    updatedProducts[index].quantity = parseInt(quantity) || 1;
    updatedProducts[index].totalPrice = updatedProducts[index].unitPrice * updatedProducts[index].quantity;
    setFormData(prev => ({ ...prev, selectedProducts: updatedProducts }));
  };

  const removeProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
    
    let discountAmount = 0;
    if (formData.discountType === 'percentage') {
      discountAmount = (subtotal * formData.discount) / 100;
    } else if (formData.discountType === 'flat') {
      discountAmount = formData.discount;
    }
    
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * 18) / 100; // 18% GST
    const total = taxableAmount + taxAmount + parseFloat(formData.shippingCharges || 0);
    
    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleNext = async () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!formData.customerName || !formData.customerPhone) {
        return;
      }
      
      // If new customer, create contact
      if (formData.isNewCustomer) {
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
    if (currentStep === 2 && formData.hasReferrer) {
      if (!formData.referrerName || !formData.relationshipType) {
        return;
      }
      
      // If referrer is not selected from dropdown (new referrer), create them
      if (!formData.referrer && formData.referrerName) {
        try {
          const response = await fetch('http://localhost:5000/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.referrerName,
              contactType: 'individual',
              status: 'active',
              isReferrer: true
            })
          });
          
          if (response.ok) {
            const newReferrer = await response.json();
            setFormData(prev => ({ ...prev, referrer: newReferrer._id }));
            
            // Create relationship with the new referrer
            await fetch('http://localhost:5000/api/relationships', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contactA: formData.customer,
                contactB: newReferrer._id,
                relationshipTypeAtoB: 'referred-by',
                relationshipTypeBtoA: formData.relationshipType,
                context: formData.relationshipContext,
                howTheyMet: formData.howTheyMet,
                isReferralRelationship: true,
                isPrimaryReferral: true,
                createdBy: 'admin'
              })
            });
          }
        } catch (error) {
          console.error('Error creating referrer:', error);
          return;
        }
      } else if (formData.referrer) {
        // Referrer already exists, just create relationship
        try {
          await fetch('http://localhost:5000/api/relationships', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contactA: formData.customer,
              contactB: formData.referrer,
              relationshipTypeAtoB: 'referred-by',
              relationshipTypeBtoA: formData.relationshipType,
              context: formData.relationshipContext,
              howTheyMet: formData.howTheyMet,
              isReferralRelationship: true,
              isPrimaryReferral: true,
              createdBy: 'admin'
            })
          });
        } catch (error) {
          console.error('Error creating relationship:', error);
        }
      }
    }
    
    if (!budgetPlan && currentStep === 3 && formData.selectedProducts.length === 0) {
      return;
    }
    
    if (currentStep === (budgetPlan ? 3 : 4)) {
      if (!formData.shippingAddress.street || !formData.shippingAddress.city) {
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const totals = calculateTotals();
      
      const orderData = {
        customer: formData.customer,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        referrer: formData.hasReferrer ? formData.referrer : null,
        referrerName: formData.hasReferrer ? formData.referrerName : null,
        relationshipType: formData.relationshipType,
        relationshipContext: formData.relationshipContext,
        products: formData.selectedProducts,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
        sameAsShipping: formData.sameAsShipping,
        billToName: formData.billToName || formData.customerName,
        subtotal: totals.subtotal,
        discount: formData.discount,
        discountType: formData.discountType,
        tax: totals.taxAmount,
        taxRate: 18,
        shippingCharges: formData.shippingCharges,
        total: totals.total,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        notes: formData.notes,
        internalNotes: formData.internalNotes,
        source: 'admin',
        // Don't send createdBy - let the backend middleware handle it from token
        budgetPlan: formData.budgetPlanId // Link to budget plan
      };

      console.log('Submitting order data:', orderData);

      // Get token from localStorage (admin or staff)
      const token = localStorage.getItem('adminToken') || localStorage.getItem('staffToken');
      
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log('Order response:', result);

      if (response.ok) {
        // If order was created from budget plan, update budget plan status
        if (formData.budgetPlanId) {
          try {
            await fetch(`http://localhost:5000/api/budget-plans/${formData.budgetPlanId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'completed' })
            });
          } catch (error) {
            console.error('Error updating budget plan status:', error);
          }
        }
        
        onSuccess && onSuccess(result);
        onClose && onClose();
      } else {
        console.error('Order creation failed:', result);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const renderStep1 = () => (
    <div className="form-step">
      <h3>Step 1: Customer Details</h3>
      
      <div className="form-group">
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
                {contact.referralCode && <span className="referral-code">{contact.referralCode}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.customerEmail}
          onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
        />
      </div>

      <div className="form-group">
        <label>Phone *</label>
        <input
          type="tel"
          value={formData.customerPhone}
          onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h3>Step 2: Referral Information</h3>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.hasReferrer}
            onChange={(e) => setFormData(prev => ({ ...prev, hasReferrer: e.target.checked }))}
          />
          Was this customer referred by someone?
        </label>
      </div>

      {formData.hasReferrer && (
        <>
          <div className="form-group">
            <label>Who referred this customer? *</label>
            <input
              type="text"
              value={formData.referrerName}
              onChange={handleReferrerSearch}
              placeholder="Search referrer name"
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(contact => (
                  <div key={contact._id} className="search-result-item" onClick={() => selectReferrer(contact)}>
                    <strong>{contact.name}</strong>
                    <span>{contact.contactType}</span>
                    {contact.isReferrer && <span className="badge-success">Referrer</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>What is the customer's relationship with the referrer? *</label>
            <select
              value={formData.relationshipType}
              onChange={(e) => setFormData(prev => ({ ...prev, relationshipType: e.target.value }))}
            >
              <option value="">Select relationship type</option>
              {relationshipTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>How do they know each other?</label>
            <textarea
              value={formData.howTheyMet}
              onChange={(e) => setFormData(prev => ({ ...prev, howTheyMet: e.target.value }))}
              placeholder="e.g., They worked together on a project, They are childhood friends, etc."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>In what context did the referrer recommend us?</label>
            <textarea
              value={formData.relationshipContext}
              onChange={(e) => setFormData(prev => ({ ...prev, relationshipContext: e.target.value }))}
              placeholder="e.g., Referrer had a good experience, Referrer is working on customer's project, etc."
              rows="2"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h3>Step 3: Select Products</h3>
      
      <div className="products-section">
        <div className="product-list">
          <h4>Available Products</h4>
          <div className="product-grid">
            {products.map(product => (
              <div key={product._id} className="product-card" onClick={() => addProduct(product)}>
                {product.images?.[0] && (
                  <img src={`http://localhost:5000${product.images[0]}`} alt={product.name} />
                )}
                <div className="product-info">
                  <strong>{product.name}</strong>
                  <span>{product.company?.name}</span>
                  <span className="price">₹{product.price?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="selected-products">
          <h4>Selected Products ({formData.selectedProducts.length})</h4>
          {formData.selectedProducts.length === 0 ? (
            <p className="no-products">No products selected</p>
          ) : (
            <div className="selected-products-list">
              {formData.selectedProducts.map((item, index) => (
                <div key={index} className="selected-product-item">
                  <div className="product-details">
                    <strong>{item.productName}</strong>
                    <span>{item.companyName}</span>
                  </div>
                  <div className="product-quantity">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateProductQuantity(index, e.target.value)}
                    />
                  </div>
                  <div className="product-price">
                    ₹{item.totalPrice.toLocaleString()}
                  </div>
                  <button onClick={() => removeProduct(index)} className="btn-remove">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h3>Step 4: Shipping & Billing Address</h3>
      
      <div className="address-section">
        <h4>Shipping Address</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Recipient Name</label>
            <input
              type="text"
              value={formData.shippingAddress.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                shippingAddress: { ...prev.shippingAddress, name: e.target.value }
              }))}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.shippingAddress.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                shippingAddress: { ...prev.shippingAddress, phone: e.target.value }
              }))}
            />
          </div>

          <div className="form-group full-width">
            <label>Street Address *</label>
            <input
              type="text"
              value={formData.shippingAddress.street}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                shippingAddress: { ...prev.shippingAddress, street: e.target.value }
              }))}
            />
          </div>

          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              value={formData.shippingAddress.city}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                shippingAddress: { ...prev.shippingAddress, city: e.target.value }
              }))}
            />
          </div>

          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              value={formData.shippingAddress.state}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                shippingAddress: { ...prev.shippingAddress, state: e.target.value }
              }))}
            />
          </div>

          <div className="form-group">
            <label>Pincode *</label>
            <input
              type="text"
              value={formData.shippingAddress.pincode}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                shippingAddress: { ...prev.shippingAddress, pincode: e.target.value }
              }))}
            />
          </div>

          <div className="form-group">
            <label>Landmark</label>
            <input
              type="text"
              value={formData.shippingAddress.landmark}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                shippingAddress: { ...prev.shippingAddress, landmark: e.target.value }
              }))}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.sameAsShipping}
            onChange={(e) => setFormData(prev => ({ ...prev, sameAsShipping: e.target.checked }))}
          />
          Billing address same as shipping address
        </label>
      </div>

      {!formData.sameAsShipping && (
        <div className="address-section">
          <h4>Billing Address</h4>
          <div className="form-grid">
            {/* Similar fields as shipping address */}
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Bill To (Who is paying?)</label>
        <input
          type="text"
          value={formData.billToName}
          onChange={(e) => setFormData(prev => ({ ...prev, billToName: e.target.value }))}
          placeholder="Leave empty if same as customer"
        />
      </div>
    </div>
  );

  const renderStep5 = () => {
    const totals = calculateTotals();
    
    return (
      <div className="form-step step-5-review">
        <div className="review-container">
          {/* Left Column - Customer & Products */}
          <div className="review-left-column">
            {/* Customer Information Card */}
            <div className="review-card customer-card">
              <div className="card-header">
                <div className="header-icon">👤</div>
                <h4>Customer Information</h4>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{formData.customerName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{formData.customerPhone}</span>
                </div>
                {formData.customerEmail && (
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{formData.customerEmail}</span>
                  </div>
                )}
                {formData.hasReferrer && (
                  <>
                    <div className="info-row referral-info">
                      <span className="info-label">Referred by</span>
                      <span className="info-value">{formData.referrerName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Relationship</span>
                      <span className="info-value">{formData.relationshipType}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Products Card */}
            <div className="review-card products-card">
              <div className="card-header">
                <div className="header-icon">📦</div>
                <h4>Products ({formData.selectedProducts.length})</h4>
              </div>
              <div className="card-content">
                <div className="products-list">
                  {formData.selectedProducts.map((item, index) => (
                    <div key={index} className="product-item">
                      <div className="product-details">
                        <span className="product-name">{item.productName}</span>
                        <span className="product-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="product-price">₹{item.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & Payment */}
          <div className="review-right-column">
            {/* Pricing Card */}
            <div className="review-card pricing-card">
              <div className="card-header">
                <div className="header-icon">💰</div>
                <h4>Pricing Details</h4>
              </div>
              <div className="card-content">
                <div className="pricing-controls">
                  <div className="form-group compact">
                    <label>Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                    >
                      <option value="none">No Discount</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  {formData.discountType !== 'none' && (
                    <div className="form-group compact">
                      <label>Discount {formData.discountType === 'percentage' ? '(%)' : '(₹)'}</label>
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  )}

                  <div className="form-group compact">
                    <label>Shipping Charges (₹)</label>
                    <input
                      type="number"
                      value={formData.shippingCharges}
                      onChange={(e) => setFormData(prev => ({ ...prev, shippingCharges: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="price-summary">
                  <div className="price-line">
                    <span>Subtotal</span>
                    <span>₹{totals.subtotal.toLocaleString()}</span>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="price-line discount-line">
                      <span>Discount</span>
                      <span>-₹{totals.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="price-line">
                    <span>Tax (18% GST)</span>
                    <span>₹{totals.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="price-line">
                    <span>Shipping</span>
                    <span>₹{formData.shippingCharges.toLocaleString()}</span>
                  </div>
                  <div className="price-line total-line">
                    <span>Total Amount</span>
                    <span>₹{totals.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Notes Card */}
            <div className="review-card payment-card">
              <div className="card-header">
                <div className="header-icon">💳</div>
                <h4>Payment & Notes</h4>
              </div>
              <div className="card-content">
                <div className="form-group compact">
                  <label>Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="payment-select"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="cash">💵 Cash</option>
                    <option value="card">💳 Card</option>
                    <option value="upi">📱 UPI</option>
                    <option value="bank-transfer">🏦 Bank Transfer</option>
                    <option value="cheque">📝 Cheque</option>
                    <option value="credit">🔖 Credit</option>
                  </select>
                </div>

                <div className="form-group compact">
                  <label>Customer Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                    placeholder="Add notes for the customer..."
                  />
                </div>

                <div className="form-group compact">
                  <label>Internal Notes <span className="label-hint">(Not visible to customer)</span></label>
                  <textarea
                    value={formData.internalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
                    rows="3"
                    placeholder="Add internal notes..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose && onClose();
    }
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose && onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content order-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{budgetPlan ? 'Convert Budget Plan to Order' : 'Create New Order'}</h2>
          <button className="modal-close" onClick={handleCloseClick} type="button">×</button>
        </div>

        <div className="step-indicator">
          {budgetPlan ? (
            // Skip product selection step if from budget plan
            [1, 2, 3, 4].map((step, index) => (
              <div key={step} className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                <div className="step-number">{step}</div>
                <div className="step-label">
                  {step === 1 && 'Customer'}
                  {step === 2 && 'Referral'}
                  {step === 3 && 'Address'}
                  {step === 4 && 'Review'}
                </div>
              </div>
            ))
          ) : (
            [1, 2, 3, 4, 5].map(step => (
              <div key={step} className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                <div className="step-number">{step}</div>
                <div className="step-label">
                  {step === 1 && 'Customer'}
                  {step === 2 && 'Referral'}
                  {step === 3 && 'Products'}
                  {step === 4 && 'Address'}
                  {step === 5 && 'Review'}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="form-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {!budgetPlan && currentStep === 3 && renderStep3()}
          {currentStep === (budgetPlan ? 3 : 4) && renderStep4()}
          {currentStep === (budgetPlan ? 4 : 5) && renderStep5()}
        </div>

        <div className="modal-footer">
          {currentStep > 1 && (
            <button onClick={handlePrevious} className="btn-secondary">
              Previous
            </button>
          )}
          {currentStep < (budgetPlan ? 4 : 5) ? (
            <button onClick={handleNext} className="btn-primary">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary">
              Create Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderForm;
