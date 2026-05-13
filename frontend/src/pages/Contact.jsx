import { useState } from 'react';
import axios from 'axios';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [hoveredMethod, setHoveredMethod] = useState(null);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('http://localhost:5000/api/inquiries', formData);
      
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setFormErrors({});
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const contactMethods = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      ),
      title: 'Call Us',
      details: ['+91 98765 43210', '+91 87654 32109'],
      hours: 'Mon - Fri: 9:00 AM - 6:00 PM',
      action: 'Call Now'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      ),
      title: 'Email Us',
      details: ['info@gtss.com', 'support@gtss.com'],
      hours: '24/7 Email Support',
      action: 'Send Email'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      title: 'Visit Us',
      details: ['123 Business Park', 'Mumbai, Maharashtra 400001'],
      hours: 'India',
      action: 'Get Directions'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
      title: 'WhatsApp',
      details: ['Live Chat Support', 'Instant Response'],
      hours: 'Available 24/7',
      action: 'Start Chat'
    }
  ];

  const faqs = [
    {
      question: 'What are your delivery timelines?',
      answer: 'We offer fast delivery across India. Standard delivery takes 3-5 business days, and express delivery is available for urgent orders.'
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes! We provide attractive discounts for bulk orders. Contact our sales team for customized quotes.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all products. Items must be in original condition with packaging.'
    },
    {
      question: 'Do you provide installation support?',
      answer: 'Yes, we provide professional installation guidance and technical support for all our products.'
    }
  ];

  return (
    <main className="contact">
      {/* Hero Section */}
      <section className="contact__hero">
        <div className="contact__hero-overlay"></div>
        <div className="contact__container">
          <div className="contact__hero-content">
            <span className="contact__hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Get in Touch
            </span>
            <h1>We're Here to Help</h1>
            <p>
              Have questions about our products or services? Our dedicated team is ready to assist you. 
              Reach out through any of our contact channels and we'll respond promptly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods Section */}
      <section className="contact__methods">
        <div className="contact__container">
          <div className="contact__methods-grid">
            {contactMethods.map((method, index) => (
              <div 
                key={index} 
                className="contact__method-card"
                onMouseEnter={() => setHoveredMethod(index)}
                onMouseLeave={() => setHoveredMethod(null)}
              >
                <div className="contact__method-icon">{method.icon}</div>
                <h3>{method.title}</h3>
                <div className="contact__method-details">
                  {method.details.map((detail, i) => (
                    <p key={i} className="contact__method-text">{detail}</p>
                  ))}
                </div>
                <p className="contact__method-hours">{method.hours}</p>
                <button 
                  className={`contact__method-btn ${hoveredMethod === index ? 'active' : ''}`}
                  onClick={() => {
                    if (method.title === 'Call Us') {
                      window.location.href = `tel:${method.details[0].replace(/\s/g, '')}`;
                    } else if (method.title === 'Email Us') {
                      window.location.href = `mailto:${method.details[0]}`;
                    } else if (method.title === 'WhatsApp') {
                      window.open(`https://wa.me/919876543210?text=Hello%20GTSS`, '_blank');
                    } else if (method.title === 'Visit Us') {
                      window.open('https://maps.google.com/?q=Mumbai+Maharashtra', '_blank');
                    }
                  }}
                >
                  {method.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="contact__main">
        <div className="contact__container">
          <div className="contact__main-grid">
            {/* Contact Form */}
            <div className="contact__form-wrapper">
              <div className="contact__form-header">
                <span className="section-badge">Send us a Message</span>
                <h2>Get in Touch With Us</h2>
                <p>Fill out the form below and our team will get back to you within 24 hours.</p>
              </div>

              {success && (
                <div className="contact__alert contact__alert--success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Thank you! Your inquiry has been submitted successfully. We'll get back to you soon.</span>
                </div>
              )}

              {error && (
                <div className="contact__alert contact__alert--error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form className="contact__form" onSubmit={handleSubmit}>
                <div className="contact__form-row">
                  <div className="contact__form-field">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className={formErrors.name ? 'error' : ''}
                    />
                    {formErrors.name && <span className="contact__form-error">{formErrors.name}</span>}
                  </div>

                  <div className="contact__form-field">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className={formErrors.email ? 'error' : ''}
                    />
                    {formErrors.email && <span className="contact__form-error">{formErrors.email}</span>}
                  </div>
                </div>

                <div className="contact__form-row">
                  <div className="contact__form-field">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="contact__form-field">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="How can we help?"
                      className={formErrors.subject ? 'error' : ''}
                    />
                    {formErrors.subject && <span className="contact__form-error">{formErrors.subject}</span>}
                  </div>
                </div>

                <div className="contact__form-field">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us about your inquiry, requirements, or feedback..."
                    className={formErrors.message ? 'error' : ''}
                  />
                  <div className="contact__form-char-count">
                    {formData.message.length} characters
                  </div>
                  {formErrors.message && <span className="contact__form-error">{formErrors.message}</span>}
                </div>

                <button type="submit" className="contact__submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="contact__submit-spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Info Section */}
            <div className="contact__info-wrapper">
              {/* Office Info */}
              <div className="contact__info-card">
                <div className="contact__info-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h3>Office Address</h3>
                <p className="contact__info-company">Gujarat Tube & Sanitary Stores</p>
                <p>123 Business Park</p>
                <p>Suite 500, Tower A</p>
                <p>Bandra Kurla Complex</p>
                <p>Mumbai - 400001, Maharashtra, India</p>
              </div>

              {/* Business Hours */}
              <div className="contact__info-card">
                <div className="contact__info-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h3>Business Hours</h3>
                <div className="contact__hours">
                  <div className="contact__hours-row">
                    <span>Monday - Friday</span>
                    <span className="contact__hours-time">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="contact__hours-row">
                    <span>Saturday</span>
                    <span className="contact__hours-time">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="contact__hours-row">
                    <span>Sunday</span>
                    <span className="contact__hours-closed">Closed</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="contact__info-card">
                <div className="contact__info-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <h3>Quick Links</h3>
                <ul className="contact__quick-links">
                  <li><a href="/categories">Browse Products</a></li>
                  <li><a href="/about">About Us</a></li>
                  <li><a href="/contact">Contact Support</a></li>
                  <li><a href="/cart">View Cart</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="contact__map-section">
        <div className="contact__container">
          <div className="contact__map-header">
            <span className="section-badge">Find Us</span>
            <h2>Our Location</h2>
          </div>
          <div className="contact__map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5555555555556!2d72.5!3d23.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84c5c5c5c5c5%3A0x5555555555555555!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="500"
              style={{ border: 0, borderRadius: '16px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact__faq">
        <div className="contact__container">
          <div className="contact__faq-header">
            <span className="section-badge">FAQ</span>
            <h2>Frequently Asked Questions</h2>
            <p>Find answers to common questions about our products and services</p>
          </div>
          <div className="contact__faq-grid">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`contact__faq-item ${expandedFaq === index ? 'expanded' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="contact__faq-header-row">
                  <h3>{faq.question}</h3>
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="contact__faq-icon"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                {expandedFaq === index && (
                  <p className="contact__faq-answer">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="contact__cta">
        <div className="contact__container">
          <div className="contact__cta-content">
            <span className="section-badge">Ready to Order?</span>
            <h2>Explore Our Premium Collection</h2>
            <p>
              Discover thousands of high-quality products from trusted brands. 
              Browse our catalog and find exactly what you need.
            </p>
            <div className="contact__cta-buttons">
              <a href="/categories" className="contact__cta-btn contact__cta-btn--primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Browse Products
              </a>
              <a href="/cart" className="contact__cta-btn contact__cta-btn--secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                View Cart
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
