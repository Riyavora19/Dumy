import './Home.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { enhancePresets, getImageUrl } from '../utils/imageEnhancer';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    customers: 0
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Static company logos from public folder
  const companyLogos = [
    { name: 'Artize', logo: '/company-logos/Artize.png' },
    { name: 'Duravit', logo: '/company-logos/Duravit.png' },
    { name: 'Jaguar', logo: '/company-logos/Jaguar.png' },
    { name: 'Johnson', logo: '/company-logos/Johnson.png' },
    { name: 'Kajaria', logo: '/company-logos/Kajaria.png' },
    { name: 'Kohler', logo: '/company-logos/Kohler.png' },
    { name: 'Milagro', logo: '/company-logos/Milagro.png' },
    { name: 'Parryware', logo: '/company-logos/Parryware.png' },
    { name: 'Qutone', logo: '/company-logos/Qutone.png' },
    { name: 'Simero', logo: '/company-logos/Simero.png' },
    { name: 'Simpolo', logo: '/company-logos/Simpolo.png' },
    { name: 'TrueBlock', logo: '/company-logos/TrueBlock.png' },
    { name: 'Woven', logo: '/company-logos/Woven.png' }
  ];

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
    checkLoginStatus();
    fetchStats();
  }, []);

  const checkLoginStatus = () => {
    const userToken = localStorage.getItem('userToken');
    setIsLoggedIn(!!userToken);
  };

  const fetchCategories = async () => {
    try {
      // Determine API base URL
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : 'https://dumy-2-mli2.onrender.com/api';

      const response = await axios.get(`${API_URL}/categories/active`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      // Determine API base URL
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : 'https://dumy-2-mli2.onrender.com/api';

      const response = await axios.get(`${API_URL}/products?isFeatured=true&isActive=true`);
      if (response.data.success) {
        // Get products marked as Featured, limit to 6
        setFeaturedProducts(response.data.data.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Determine API base URL
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : 'https://dumy-2-mli2.onrender.com/api';

      // Fetch products count
      const productsRes = await axios.get(`${API_URL}/products`);
      if (productsRes.data.success) {
        setStats(prev => ({ ...prev, products: productsRes.data.data.length }));
      }
      
      // Fetch categories count
      const categoriesRes = await axios.get(`${API_URL}/categories/active`);
      if (categoriesRes.data.success) {
        setStats(prev => ({ ...prev, categories: categoriesRes.data.data.length }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeProductModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__container">
          <div className="hero__content">
            <span className="hero__badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Premium Quality Since 2020
            </span>
            <h1 className="hero__title">
              Transform Your Space with
              <span className="hero__title-gradient"> Premium Products</span>
            </h1>
            <p className="hero__subtitle">
              Discover our curated collection of high-quality products for your home and business.
              From kitchen essentials to bathroom fixtures, we have everything you need.
            </p>
            <div className="hero__actions">
              <Link to="/categories" className="hero__btn hero__btn--primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Browse Categories
              </Link>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <strong>{stats.products}+</strong>
                <span>Products</span>
              </div>
              <div className="hero__stat">
                <strong>{stats.categories}+</strong>
                <span>Categories</span>
              </div>
              <div className="hero__stat">
                <strong>4.8★</strong>
                <span>Rating</span>
              </div>
              <div className="hero__stat">
                <strong>10K+</strong>
                <span>Customers</span>
              </div>
            </div>
          </div>
          <div className="hero__image">
            <div className="hero__image-card hero__image-card--1">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="hero__image-card hero__image-card--2">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <div className="hero__image-card hero__image-card--3">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="home-categories">
        <div className="home-categories__container">
          <div className="home-categories__header">
            <div>
              <h2>Explore Our Categories</h2>
              <p>Find exactly what you're looking for</p>
            </div>
            <Link to="/categories" className="home-categories__view-all">
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="home-categories__empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <p>No categories available</p>
            </div>
          ) : (
            <div className="home-categories__grid">
              {categories.slice(0, 8).map(category => (
                <Link 
                  key={category._id} 
                  to={`/categories/${category._id}`}
                  className="home-categories__card"
                >
                  <div className="home-categories__icon" style={{ background: category.color }}>
                    <span>{category.icon}</span>
                  </div>
                  <h3>{category.name}</h3>
                  <p>Explore products</p>
                  <svg className="home-categories__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="home-featured">
        <div className="home-featured__container">
          <div className="home-featured__header">
            <div>
              <span className="section-badge">Popular Choices</span>
              <h2>Featured Products</h2>
              <p>Handpicked products loved by our customers</p>
            </div>
          </div>

          {featuredProducts.length > 0 && (
            <div className="home-featured__grid">
              {featuredProducts.map(product => (
                <div key={product._id} className="home-featured__card">
                  <div 
                    className="home-featured__image"
                    onClick={() => openProductModal(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={enhancePresets.card(getImageUrl(product.images[0]))} 
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="home-featured__placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                      </div>
                    )}
                    {product.discountPercentage > 0 && (
                      <span className="home-featured__badge">-{product.discountPercentage}%</span>
                    )}
                  </div>
                  <div className="home-featured__content">
                    <h3 
                      onClick={() => openProductModal(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.name}
                    </h3>
                    <p className="home-featured__company">
                      {typeof product.company === 'object' ? product.company?.name : product.company}
                    </p>
                    <div className="home-featured__price">
                      <span className="price-current">₹{product.price.toLocaleString()}</span>
                    </div>
                    <div className="home-featured__actions">
                      <button 
                        className="home-featured__details-btn"
                        onClick={() => openProductModal(product)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="m21 21-4.35-4.35"/>
                        </svg>
                        View Details
                      </button>
                      <button 
                        className={`home-featured__cart-btn ${isInCart(product._id) ? 'in-cart' : ''}`}
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="15" y1="9" x2="9" y2="15"/>
                              <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                            Out of Stock
                          </>
                        ) : isInCart(product._id) ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            In Cart
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="9" cy="21" r="1"/>
                              <circle cx="20" cy="21" r="1"/>
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brands Section - Marquee */}
      <section className="home-brands">
        <div className="home-brands__container">
          <div className="home-brands__header">
            <span className="section-badge">Trusted Partners</span>
            <h2>Our Premium Brands</h2>
            <p>We partner with the best brands in the industry</p>
          </div>
          <div className="home-brands__marquee">
            <div className="home-brands__marquee-content">
              {/* First set of logos */}
              {companyLogos.map((company, index) => (
                <div key={index} className="home-brands__card">
                  <img 
                    src={company.logo} 
                    alt={company.name}
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {companyLogos.map((company, index) => (
                <div key={`duplicate-${index}`} className="home-brands__card">
                  <img 
                    src={company.logo} 
                    alt={company.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="home-testimonials">
        <div className="home-testimonials__container">
          <div className="home-testimonials__header">
            <span className="section-badge">Customer Reviews</span>
            <h2>What Our Customers Say</h2>
            <p>Real experiences from real customers</p>
          </div>
          <div className="home-testimonials__grid">
            <div className="home-testimonials__card">
              <div className="home-testimonials__rating">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="home-testimonials__text">
                "Excellent quality products and amazing customer service. The delivery was prompt and the products exceeded my expectations!"
              </p>
              <div className="home-testimonials__author">
                <div className="home-testimonials__avatar">R</div>
                <div>
                  <strong>Rajesh Kumar</strong>
                  <span>Verified Buyer</span>
                </div>
              </div>
            </div>
            <div className="home-testimonials__card">
              <div className="home-testimonials__rating">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="home-testimonials__text">
                "Best place to buy bathroom and kitchen products. Wide variety and competitive prices. Highly recommended!"
              </p>
              <div className="home-testimonials__author">
                <div className="home-testimonials__avatar">P</div>
                <div>
                  <strong>Priya Patel</strong>
                  <span>Verified Buyer</span>
                </div>
              </div>
            </div>
            <div className="home-testimonials__card">
              <div className="home-testimonials__rating">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <p className="home-testimonials__text">
                "Professional service and genuine products. They helped me choose the right products for my home renovation project."
              </p>
              <div className="home-testimonials__author">
                <div className="home-testimonials__avatar">A</div>
                <div>
                  <strong>Amit Shah</strong>
                  <span>Verified Buyer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us section */}
      <section className="home-features">
        <div className="home-features__container">
          <div className="home-features__header">
            <h2>Why Choose Us</h2>
            <p>We're committed to providing the best experience</p>
          </div>
          <div className="home-features__grid">
            <div className="home-features__card">
              <div className="home-features__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3>Premium Quality</h3>
              <p>Every product goes through strict quality checks to ensure excellence</p>
            </div>
            <div className="home-features__card">
              <div className="home-features__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable delivery to your doorstep across the country</p>
            </div>
            <div className="home-features__card">
              <div className="home-features__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3>Trusted by Thousands</h3>
              <p>Join our growing community of satisfied customers nationwide</p>
            </div>
            <div className="home-features__card">
              <div className="home-features__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3>24/7 Support</h3>
              <p>Our dedicated team is always ready to help you anytime</p>
            </div>
            <div className="home-features__card">
              <div className="home-features__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h3>Best Prices</h3>
              <p>Competitive pricing without compromising on quality</p>
            </div>
            <div className="home-features__card">
              <div className="home-features__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Secure Shopping</h3>
              <p>Your data and transactions are protected with industry-standard security</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-cta">
        <div className="home-cta__container">
          <div className="home-cta__content">
            <h2>Ready to Get Started?</h2>
            <p>Explore our products and find the perfect solutions for your needs</p>
            <div className="home-cta__actions">
              <Link to="/categories" className="home-cta__btn home-cta__btn--primary">
                Browse Products
              </Link>
              <Link to="/contact" className="home-cta__btn home-cta__btn--secondary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="product-modal-overlay" onClick={closeProductModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="product-modal__close" onClick={closeProductModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="product-modal__content">
              <div className="product-modal__image-section">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img 
                    src={enhancePresets.detail(getImageUrl(selectedProduct.images[0]))} 
                    alt={selectedProduct.name}
                  />
                ) : (
                  <div className="product-modal__placeholder">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className="product-modal__info-section">
                <div className="product-modal__header">
                  <h2>{selectedProduct.name}</h2>
                  <p className="product-modal__company">
                    {typeof selectedProduct.company === 'object' ? selectedProduct.company?.name : selectedProduct.company}
                  </p>
                </div>

                <div className="product-modal__price">
                  <span className="product-modal__price-current">₹{selectedProduct.price.toLocaleString()}</span>
                </div>

                {selectedProduct.description && (
                  <div className="product-modal__description">
                    <h3>Description</h3>
                    <p>{selectedProduct.description}</p>
                  </div>
                )}

                {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                  <div className="product-modal__specifications">
                    <h3>Specifications</h3>
                    <div className="product-modal__specs-grid">
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <div key={key} className="product-modal__spec-item">
                          <span className="product-modal__spec-label">{key}:</span>
                          <span className="product-modal__spec-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="product-modal__stock">
                  {selectedProduct.stock > 0 ? (
                    <span className="product-modal__stock-badge product-modal__stock-badge--in">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      In Stock
                    </span>
                  ) : (
                    <span className="product-modal__stock-badge product-modal__stock-badge--out">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="product-modal__actions">
                  <button 
                    className={`product-modal__cart-btn ${isInCart(selectedProduct._id) ? 'in-cart' : ''}`}
                    onClick={() => {
                      addToCart(selectedProduct);
                      closeProductModal();
                    }}
                    disabled={selectedProduct.stock === 0}
                  >
                    {selectedProduct.stock === 0 ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        Out of Stock
                      </>
                    ) : isInCart(selectedProduct._id) ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        In Cart
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="21" r="1"/>
                          <circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
