import './Home.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    customers: 0
  });

  useEffect(() => {
    fetchCategories();
    checkLoginStatus();
    fetchStats();
  }, []);

  const checkLoginStatus = () => {
    const userToken = localStorage.getItem('userToken');
    setIsLoggedIn(!!userToken);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories/active');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch products count
      const productsRes = await axios.get('http://localhost:5000/api/products');
      if (productsRes.data.success) {
        setStats(prev => ({ ...prev, products: productsRes.data.data.length }));
      }
      
      // Fetch categories count
      const categoriesRes = await axios.get('http://localhost:5000/api/categories/active');
      if (categoriesRes.data.success) {
        setStats(prev => ({ ...prev, categories: categoriesRes.data.data.length }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
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
              <Link to="/budget-planner" className="hero__btn hero__btn--secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Plan Your Budget
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
    </>
  );
};

export default Home;
