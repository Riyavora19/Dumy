import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import './AdminCompanySettings.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://dumy-2-mli2.onrender.com/api';

function AdminCompanySettings() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    termsAndConditions: {
      paymentTerms: [''],
      validity: [''],
      delivery: [''],
      pricingAndTaxes: ['']
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);



  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/company-settings`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBankDetailChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTermsChange = (category, index, value) => {
    setSettings(prev => ({
      ...prev,
      termsAndConditions: {
        ...prev.termsAndConditions,
        [category]: prev.termsAndConditions[category].map((item, i) => 
          i === index ? value : item
        )
      }
    }));
  };

  const addTermItem = (category) => {
    setSettings(prev => ({
      ...prev,
      termsAndConditions: {
        ...prev.termsAndConditions,
        [category]: [...prev.termsAndConditions[category], '']
      }
    }));
  };

  const removeTermItem = (category, index) => {
    setSettings(prev => ({
      ...prev,
      termsAndConditions: {
        ...prev.termsAndConditions,
        [category]: prev.termsAndConditions[category].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/company-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      showNotification('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-section-loading">Loading settings...</div>;
  }

  return (
    <div className="admin-company-settings">
      <div className="admin-section-header">
        <h2>⚙️ Company Settings</h2>
        <button 
          className="btn-primary" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save Settings'}
        </button>
      </div>

      {/* Bank Details Section */}
      <div className="settings-section">
        <h3>🏦 Bank Details</h3>
        <div className="settings-grid">
          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              value={settings.bankName}
              onChange={(e) => handleBankDetailChange('bankName', e.target.value)}
              placeholder="Enter bank name"
            />
          </div>

          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              value={settings.accountNumber}
              onChange={(e) => handleBankDetailChange('accountNumber', e.target.value)}
              placeholder="Enter account number"
            />
          </div>

          <div className="form-group">
            <label>IFSC Code</label>
            <input
              type="text"
              value={settings.ifscCode}
              onChange={(e) => handleBankDetailChange('ifscCode', e.target.value)}
              placeholder="Enter IFSC code"
            />
          </div>

          <div className="form-group">
            <label>Branch Name</label>
            <input
              type="text"
              value={settings.branchName}
              onChange={(e) => handleBankDetailChange('branchName', e.target.value)}
              placeholder="Enter branch name"
            />
          </div>
        </div>
      </div>

      {/* Terms & Conditions Section */}
      <div className="settings-section">
        <h3>📋 Terms & Conditions</h3>

        {/* Payment Terms */}
        <div className="terms-category">
          <div className="terms-header">
            <h4>Payment Terms</h4>
            <button 
              className="btn-add-term"
              onClick={() => addTermItem('paymentTerms')}
            >
              + Add Item
            </button>
          </div>
          {settings.termsAndConditions.paymentTerms.map((term, index) => (
            <div key={index} className="term-item">
              <input
                type="text"
                value={term}
                onChange={(e) => handleTermsChange('paymentTerms', index, e.target.value)}
                placeholder="Enter payment term"
              />
              {settings.termsAndConditions.paymentTerms.length > 1 && (
                <button 
                  className="btn-remove-term"
                  onClick={() => removeTermItem('paymentTerms', index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Validity */}
        <div className="terms-category">
          <div className="terms-header">
            <h4>Validity</h4>
            <button 
              className="btn-add-term"
              onClick={() => addTermItem('validity')}
            >
              + Add Item
            </button>
          </div>
          {settings.termsAndConditions.validity.map((term, index) => (
            <div key={index} className="term-item">
              <input
                type="text"
                value={term}
                onChange={(e) => handleTermsChange('validity', index, e.target.value)}
                placeholder="Enter validity term"
              />
              {settings.termsAndConditions.validity.length > 1 && (
                <button 
                  className="btn-remove-term"
                  onClick={() => removeTermItem('validity', index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Delivery */}
        <div className="terms-category">
          <div className="terms-header">
            <h4>Delivery</h4>
            <button 
              className="btn-add-term"
              onClick={() => addTermItem('delivery')}
            >
              + Add Item
            </button>
          </div>
          {settings.termsAndConditions.delivery.map((term, index) => (
            <div key={index} className="term-item">
              <input
                type="text"
                value={term}
                onChange={(e) => handleTermsChange('delivery', index, e.target.value)}
                placeholder="Enter delivery term"
              />
              {settings.termsAndConditions.delivery.length > 1 && (
                <button 
                  className="btn-remove-term"
                  onClick={() => removeTermItem('delivery', index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Pricing & Taxes */}
        <div className="terms-category">
          <div className="terms-header">
            <h4>Pricing & Taxes</h4>
            <button 
              className="btn-add-term"
              onClick={() => addTermItem('pricingAndTaxes')}
            >
              + Add Item
            </button>
          </div>
          {settings.termsAndConditions.pricingAndTaxes.map((term, index) => (
            <div key={index} className="term-item">
              <input
                type="text"
                value={term}
                onChange={(e) => handleTermsChange('pricingAndTaxes', index, e.target.value)}
                placeholder="Enter pricing/tax term"
              />
              {settings.termsAndConditions.pricingAndTaxes.length > 1 && (
                <button 
                  className="btn-remove-term"
                  onClick={() => removeTermItem('pricingAndTaxes', index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button at Bottom */}
      <div className="settings-footer">
        <button 
          className="btn-primary btn-large" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save All Settings'}
        </button>
      </div>
    </div>
  );
}
export default AdminCompanySettings;

