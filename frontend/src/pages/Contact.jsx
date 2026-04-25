import { useState } from 'react';
import axios from 'axios';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          message: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact">
      {/* Hero Section */}
      <section className="contact__hero">
        <div className="contact__hero-content">
          <h1>Contact Us</h1>
          <p>Your trusted partner for premium textile and engineering spare parts. We are here to support your requirements quickly and clearly.</p>
        </div>
      </section>

      {/* Direct Support Banner */}
      <section className="contact__banner">
        <div className="contact__container">
          <div className="contact__banner-content">
            <span className="contact__banner-badge">Direct Support</span>
            <div className="contact__banner-contacts">
              <div className="contact__banner-item">
                <p className="contact__banner-name">Sales Manager</p>
                <p className="contact__banner-phone">+91 98765 43210</p>
              </div>
              <div className="contact__banner-divider"></div>
              <div className="contact__banner-item">
                <p className="contact__banner-name">Support Team</p>
                <p className="contact__banner-phone">+91 87654 32109</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards Section */}
      <section className="contact__cards">
        <div className="contact__container">
          <div className="contact__cards-grid">
            {/* Call Us */}
            <div className="contact__card">
              <div className="contact__card-icon">☎️</div>
              <h3>Call Us</h3>
              <p className="contact__card-phone">+91 98765 43210</p>
              <p className="contact__card-phone">+91 87654 32109</p>
              <p className="contact__card-hours">Mon - Fri: 9:00 AM - 6:00 PM</p>
              <button className="contact__card-btn">Call Now →</button>
            </div>

            {/* Email Us */}
            <div className="contact__card">
              <div className="contact__card-icon">✉️</div>
              <h3>Email Us</h3>
              <p className="contact__card-email">info@company.com</p>
              <p className="contact__card-support">24 / 7 Email Support</p>
              <button className="contact__card-btn">Send Email →</button>
            </div>

            {/* Visit Us */}
            <div className="contact__card">
              <div className="contact__card-icon">📍</div>
              <h3>Visit Us</h3>
              <p className="contact__card-address">123 Business Park, Suite 500</p>
              <p className="contact__card-address">Mumbai, Maharashtra 400001</p>
              <p className="contact__card-support">India</p>
              <button className="contact__card-btn">Get Directions →</button>
            </div>

            {/* WhatsApp */}
            <div className="contact__card">
              <div className="contact__card-icon">💬</div>
              <h3>WhatsApp</h3>
              <p className="contact__card-support">Live Chat Support</p>
              <p className="contact__card-support">Instant Response Available</p>
              <p className="contact__card-support">Available 24/7</p>
              <button className="contact__card-btn">Start Chat →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Map and Info Section */}
      <section className="contact__map-section">
        <div className="contact__container">
          <div className="contact__map-grid">
            {/* Map */}
            <div className="contact__map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.5555555555556!2d72.5!3d23.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84c5c5c5c5c5%3A0x5555555555555555!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Info */}
            <div className="contact__info">
              <div className="contact__info-section">
                <h3>📍 Office Address</h3>
                <p className="contact__info-company">Premium Products & Supplies</p>
                <p>123 Business Park</p>
                <p>Suite 500, Tower A</p>
                <p>Bandra Kurla Complex</p>
                <p>Mumbai - 400001, Maharashtra, India</p>
              </div>

              <div className="contact__info-section">
                <h3>🕐 Business Hours</h3>
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
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact__form-section">
        <div className="contact__container">
          <div className="contact__form-wrapper">
            <h2>Send us a Message</h2>
            <p>Have a question? Fill out the form below and we'll get back to you as soon as possible.</p>

            {success && (
              <div className="contact__alert contact__alert--success">
                ✓ Thank you! Your inquiry has been submitted successfully. We'll get back to you soon.
              </div>
            )}

            {error && (
              <div className="contact__alert contact__alert--error">
                ✕ {error}
              </div>
            )}

            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="contact__form-row">
                <div className="contact__form-field">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className="contact__form-field">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="contact__form-row">
                <div className="contact__form-field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                  />
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
                  placeholder="Tell us about your inquiry..."
                />
              </div>

              <button type="submit" className="contact__submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="contact__cta">
        <div className="contact__container">
          <div className="contact__cta-content">
            <p className="contact__cta-label">READY TO ORDER?</p>
            <h2>Join 500+ Satisfied Customers</h2>
            <p>From startups to enterprises — we deliver premium products and exceptional service across India.</p>
            <div className="contact__cta-buttons">
              <button className="contact__cta-btn contact__cta-btn--primary">Browse Products</button>
              <button className="contact__cta-btn contact__cta-btn--secondary">Get a Quote</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
