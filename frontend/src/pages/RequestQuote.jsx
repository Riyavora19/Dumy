import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import './RequestQuote.css';

const RequestQuote = () => {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    requestType: 'quote',
    category: '',
    title: '',
    description: '',
    budget: { min: '', max: '' },
    location: { address: '', city: '', state: '', pincode: '' },
    preferredDate: '',
    urgency: 'medium',
    source: 'website'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://dumy-2-mli2.onrender.com/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('budget.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        budget: { ...formData.budget, [field]: value }
      });
    } else if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        location: { ...formData.location, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Map form data to inquiry schema
      const inquiryData = {
        name: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone,
        message: `Request Type: ${formData.requestType}\n\nTitle: ${formData.title}\n\nDescription: ${formData.description}\n\nBudget: ₹${formData.budget.min || 'Not specified'} - ₹${formData.budget.max || 'Not specified'}\n\nUrgency: ${formData.urgency}\n\nPreferred Date: ${formData.preferredDate || 'Not specified'}\n\nLocation: ${formData.location.address ? `${formData.location.address}, ${formData.location.city}, ${formData.location.state} - ${formData.location.pincode}` : 'Not specified'}\n\nCategory: ${categories.find(c => c._id === formData.category)?.name || 'Not specified'}`,
        status: 'new'
      };

      console.log('Submitting inquiry:', inquiryData);

      // Save to inquiries
      const response = await axios.post('https://dumy-2-mli2.onrender.com/api/inquiries', inquiryData);
      
      if (response.data.success) {
        setSubmitted(true);
        // Reset form
        setFormData({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          requestType: 'quote',
          category: '',
          title: '',
          description: '',
          budget: { min: '', max: '' },
          location: { address: '', city: '', state: '', pincode: '' },
          preferredDate: '',
          urgency: 'medium',
          source: 'website'
        });
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      console.error('Error response:', error.response?.data);
      showNotification(error.response?.data?.message || 'Failed to submit request. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="request-quote-page">
        <div className="request-quote-success">
          <div className="success-icon">✓</div>
          <h1>Request Submitted Successfully!</h1>
          <p>Thank you for your request. We've received your information and will get back to you within 24 hours.</p>
          <p>Our team will review your requirements and contact you at <strong>{formData.clientEmail}</strong> or <strong>{formData.clientPhone}</strong>.</p>
          <div className="success-actions">
            <button onClick={() => setSubmitted(false)} className="btn-primary">
              Submit Another Request
            </button>
            <button onClick={() => window.location.href = '/'} className="btn-secondary">
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="request-quote-page">
      <div className="request-quote-container">
        <header className="request-quote-header">
          <h1>Request a Quote</h1>
          <p>Fill out the form below and our team will get back to you with a customized quote</p>
        </header>

        <form onSubmit={handleSubmit} className="request-quote-form">
          {/* Personal Information */}
          <section className="form-section">
            <h2>Your Information</h2>
            <div className="form-row">
              <div className="form-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="form-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-field">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  required
                  placeholder="+91-9876543210"
                />
              </div>
            </div>
          </section>

          {/* Request Details */}
          <section className="form-section">
            <h2>Request Details</h2>
            <div className="form-row">
              <div className="form-field">
                <label>Request Type *</label>
                <select name="requestType" value={formData.requestType} onChange={handleChange} required>
                  <option value="quote">💰 Get a Quote</option>
                  <option value="consultation">💬 Free Consultation</option>
                  <option value="installation">🔧 Installation Service</option>
                  <option value="repair">🛠️ Repair Service</option>
                  <option value="custom-order">✨ Custom Order</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>

              <div className="form-field">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Urgency</label>
                <select name="urgency" value={formData.urgency} onChange={handleChange}>
                  <option value="low">🟢 Not Urgent</option>
                  <option value="medium">🟡 Normal</option>
                  <option value="high">🟠 High Priority</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>Project Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Bathroom Renovation, Kitchen Installation"
              />
            </div>

            <div className="form-field">
              <label>Project Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Please describe your requirements in detail..."
              />
            </div>
          </section>

          {/* Budget */}
          <section className="form-section">
            <h2>Budget Range (Optional)</h2>
            <div className="form-row">
              <div className="form-field">
                <label>Minimum Budget (₹)</label>
                <input
                  type="number"
                  name="budget.min"
                  value={formData.budget.min}
                  onChange={handleChange}
                  placeholder="e.g., 50000"
                />
              </div>

              <div className="form-field">
                <label>Maximum Budget (₹)</label>
                <input
                  type="number"
                  name="budget.max"
                  value={formData.budget.max}
                  onChange={handleChange}
                  placeholder="e.g., 100000"
                />
              </div>

              <div className="form-field">
                <label>Preferred Date</label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="form-section">
            <h2>Project Location (Optional)</h2>
            <div className="form-field">
              <label>Address</label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>City</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                />
              </div>

              <div className="form-field">
                <label>State</label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                />
              </div>

              <div className="form-field">
                <label>Pincode</label>
                <input
                  type="text"
                  name="location.pincode"
                  value={formData.location.pincode}
                  onChange={handleChange}
                  placeholder="400001"
                />
              </div>
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default RequestQuote;
