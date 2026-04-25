import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Prepare products data without price
    const productsData = cartItems.map(item => ({
      productId: item._id,
      name: item.name,
      company: item.company || '',
      quantity: item.quantity,
      image: item.images[0],
      sku: item.sku || ''
    }));

    try {
      const response = await axios.post('http://localhost:5000/api/inquiries', {
        ...formData,
        products: productsData
      });

      if (response.data.success) {
        alert('Inquiry sent successfully! We will contact you soon.');
        clearCart();
        setShowInquiryForm(false);
        navigate('/');
      }
    } catch (error) {
      console.error('Error sending inquiry:', error);
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="cart">
        <div className="cart__container">
          <div className="cart__empty">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <h2>Your Cart is Empty</h2>
            <p>Add products to your cart to send an inquiry</p>
            <button onClick={() => navigate('/categories')} className="cart__browse-btn">
              Browse Categories
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart">
      <div className="cart__container">
        <header className="cart__header">
          <h1>Your Cart</h1>
          <p className="cart__subtitle">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart</p>
        </header>

        <div className="cart__content">
          <div className="cart__items">
            {cartItems.map(item => (
              <div key={item._id} className="cart__item">
                <div className="cart__item-image">
                  <img src={`http://localhost:5000${item.images[0]}`} alt={item.name} />
                </div>
                <div className="cart__item-details">
                  <h3>{item.name}</h3>
                  {item.company && (
                    <p className="cart__item-company">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      {item.company}
                    </p>
                  )}
                  {item.sku && <p className="cart__item-sku">SKU: {item.sku}</p>}
                </div>
                <div className="cart__item-quantity">
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="cart__qty-btn"
                  >
                    −
                  </button>
                  <span className="cart__qty-value">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="cart__qty-btn"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item._id)}
                  className="cart__item-remove"
                  title="Remove from cart"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="cart__summary">
            <div className="cart__summary-card">
              <h2>Cart Summary</h2>
              <div className="cart__summary-row">
                <span>Total Items:</span>
                <strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</strong>
              </div>
              
              <button 
                onClick={() => setShowInquiryForm(true)}
                className="cart__inquiry-btn"
              >
                Send Inquiry
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </button>

              <button 
                onClick={clearCart}
                className="cart__clear-btn"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <div className="cart__modal-overlay" onClick={() => setShowInquiryForm(false)}>
          <div className="cart__modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart__modal-header">
              <h2>Send Inquiry</h2>
              <button onClick={() => setShowInquiryForm(false)}>×</button>
            </div>

            <form onSubmit={handleSubmitInquiry} className="cart__form">
              <div className="cart__form-field">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="cart__form-row">
                <div className="cart__form-field">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div className="cart__form-field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="cart__form-field">
                <label>Additional Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Any additional information or questions..."
                />
              </div>

              <div className="cart__form-info">
                <p>Your cart items will be included in the inquiry automatically.</p>
              </div>

              <div className="cart__form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowInquiryForm(false)}
                  className="cart__btn-cancel"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="cart__btn-submit"
                >
                  {submitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;
