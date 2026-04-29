import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductTable from './ProductTable';
import QuotationPDFGenerator from './QuotationPDFGenerator';
import './QuotationForm.css';

const QuotationForm = ({ onSave, onCancel, editingQuotation }) => {
  const [step, setStep] = useState('client'); // 'client' or 'build'
  const [clientData, setClientData] = useState({
    clientName: '',
    companyName: '',
    mobileNumber: '',
    email: '',
    address: '',
    gstNumber: ''
  });
  const [quotationItems, setQuotationItems] = useState([
    { id: 1, productId: '', productName: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [nextItemId, setNextItemId] = useState(2);
  const [gst, setGst] = useState(18);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingQuotation) {
      setClientData(editingQuotation.clientData);
      setQuotationItems(editingQuotation.items);
      setGst(editingQuotation.gst);
      setStep('build');
    }
    fetchProducts();
  }, [editingQuotation]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for mobile number - only digits
    if (name === 'mobileNumber') {
      const digitsOnly = value.replace(/\D/g, '');
      setClientData({
        ...clientData,
        [name]: digitsOnly
      });
      return;
    }
    
    setClientData({
      ...clientData,
      [name]: value
    });
  };

  const handleBuildQuotation = () => {
    if (!clientData.clientName || !clientData.mobileNumber || !clientData.email) {
      alert('Please fill in all required fields (Client Name, Mobile, Email)');
      return;
    }
    setStep('build');
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = quotationItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item };
        
        // Validation for quantity - only positive integers
        if (field === 'quantity') {
          const numValue = parseInt(value) || 0;
          updatedItem[field] = numValue > 0 ? numValue : 1;
        }
        // Validation for rate - only positive numbers with decimals
        else if (field === 'rate') {
          const numValue = parseFloat(value) || 0;
          updatedItem[field] = numValue >= 0 ? numValue : 0;
        }
        // Product selection
        else if (field === 'productId' && value) {
          const product = products.find(p => p._id === value);
          if (product) {
            updatedItem.productId = value;
            updatedItem.productName = `${product.name}${product.variant ? ` - ${product.variant}` : ''}`;
            updatedItem.rate = product.price || 0;
          }
        }
        // Product name manual entry
        else if (field === 'productName') {
          updatedItem[field] = value;
        }
        
        // Auto-calculate amount
        updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        
        return updatedItem;
      }
      return item;
    });
    setQuotationItems(updatedItems);
  };

  const handleAddRow = () => {
    setQuotationItems([
      ...quotationItems,
      { id: nextItemId, productId: '', productName: '', quantity: 1, rate: 0, amount: 0 }
    ]);
    setNextItemId(nextItemId + 1);
  };

  const handleRemoveRow = (id) => {
    if (quotationItems.length > 1) {
      setQuotationItems(quotationItems.filter(item => item.id !== id));
    }
  };

  const calculateTotals = () => {
    const subtotal = quotationItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const gstAmount = (subtotal * gst) / 100;
    const total = subtotal + gstAmount;
    return { subtotal, gstAmount, total };
  };

  const handleSave = (generatePDF = false) => {
    // Validate items
    const hasEmptyItems = quotationItems.some(item => !item.productName || item.quantity <= 0 || item.rate <= 0);
    if (hasEmptyItems) {
      alert('Please fill in all product details');
      return;
    }

    const { subtotal, gstAmount, total } = calculateTotals();
    
    const quotationData = {
      id: editingQuotation?.id || `QT-${Date.now()}`,
      quotationNumber: editingQuotation?.quotationNumber || `QT-${Date.now()}`,
      quotationDate: editingQuotation?.quotationDate || new Date().toISOString().split('T')[0],
      clientData,
      items: quotationItems,
      gst,
      subtotal,
      gstAmount,
      total,
      createdAt: editingQuotation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(quotationData);

    if (generatePDF) {
      setTimeout(() => {
        QuotationPDFGenerator(quotationData);
      }, 500);
    }
  };

  const { subtotal, gstAmount, total } = calculateTotals();

  if (step === 'client') {
    return (
      <div className="quotation-form">
        <div className="quotation-form__header">
          <h2>Client Details</h2>
          <button onClick={onCancel} className="quotation-form__close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="quotation-form__body">
          <div className="quotation-form__row">
            <div className="quotation-form__field">
              <label>Client Name <span className="required">*</span></label>
              <input
                type="text"
                name="clientName"
                value={clientData.clientName}
                onChange={handleClientChange}
                placeholder="Enter client name"
                required
              />
            </div>
            <div className="quotation-form__field">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={clientData.companyName}
                onChange={handleClientChange}
                placeholder="Enter company name (optional)"
              />
            </div>
          </div>

          <div className="quotation-form__row">
            <div className="quotation-form__field">
              <label>Mobile Number <span className="required">*</span></label>
              <input
                type="tel"
                name="mobileNumber"
                value={clientData.mobileNumber}
                onChange={handleClientChange}
                placeholder="Enter mobile number"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength="15"
                required
              />
            </div>
            <div className="quotation-form__field">
              <label>Email <span className="required">*</span></label>
              <input
                type="email"
                name="email"
                value={clientData.email}
                onChange={handleClientChange}
                placeholder="Enter email address"
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                required
              />
            </div>
          </div>

          <div className="quotation-form__field">
            <label>Address</label>
            <textarea
              name="address"
              value={clientData.address}
              onChange={handleClientChange}
              placeholder="Enter full address (optional)"
              rows="3"
            />
          </div>

          <div className="quotation-form__field">
            <label>GST Number</label>
            <input
              type="text"
              name="gstNumber"
              value={clientData.gstNumber}
              onChange={handleClientChange}
              placeholder="Enter GST number (optional)"
            />
          </div>
        </div>

        <div className="quotation-form__footer">
          <button onClick={onCancel} className="quotation-form__btn quotation-form__btn--secondary">
            Cancel
          </button>
          <button onClick={handleBuildQuotation} className="quotation-form__btn quotation-form__btn--primary">
            Build Quotation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quotation-form">
      <div className="quotation-form__header">
        <div>
          <h2>Build Quotation</h2>
          <p className="quotation-form__client-info">
            Client: <strong>{clientData.clientName}</strong>
            {clientData.companyName && ` (${clientData.companyName})`}
            <button onClick={() => setStep('client')} className="quotation-form__edit-client">
              Edit Client Details
            </button>
          </p>
        </div>
        <button onClick={onCancel} className="quotation-form__close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="quotation-form__body">
        <ProductTable
          items={quotationItems}
          products={products}
          loading={loading}
          onItemChange={handleItemChange}
          onRemoveRow={handleRemoveRow}
          onAddRow={handleAddRow}
        />

        <div className="quotation-form__summary">
          <div className="quotation-form__gst">
            <label>GST (%)</label>
            <input
              type="number"
              value={gst}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  setGst(value);
                } else if (e.target.value === '') {
                  setGst(0);
                }
              }}
              min="0"
              max="100"
              step="0.01"
              inputMode="decimal"
            />
          </div>

          <div className="quotation-form__totals">
            <div className="quotation-form__total-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="quotation-form__total-row">
              <span>GST ({gst}%):</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="quotation-form__total-row quotation-form__total-row--grand">
              <span>Total Amount:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="quotation-form__footer">
        <button onClick={onCancel} className="quotation-form__btn quotation-form__btn--secondary">
          Cancel
        </button>
        <button onClick={() => handleSave(false)} className="quotation-form__btn quotation-form__btn--secondary">
          Save Quotation
        </button>
        <button onClick={() => handleSave(true)} className="quotation-form__btn quotation-form__btn--primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Save & Generate PDF
        </button>
      </div>
    </div>
  );
};

export default QuotationForm;
