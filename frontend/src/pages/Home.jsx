import './Home.css';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchCategories();
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const userToken = localStorage.getItem('userToken');
    setIsLoggedIn(!!userToken);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories/active');
      if (response.data.success) {
        // Limit to 8 categories for home page
        setCategories(response.data.data.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <>
      {/* Hero section */}
      <section className="home">
        <h1>Welcome to the Home Page</h1>
        {!isLoggedIn && (
          <div className="home-login-prompt">
            <p>Please login to access all features and start shopping</p>
            <Link to="/login" className="home-login-btn">
              Login / Register
            </Link>
          </div>
        )}
      </section>

      {/* About Us section */}
      <section className="home-about">
        <div className="home-about__content">
          <h2>About Us</h2>
          <p>
            At Kohlar, we believe great products should be accessible to everyone.
            Founded with a passion for quality and a commitment to customer satisfaction,
            we have been delivering premium products and supplies to homes and businesses alike.
          </p>
          <p>
            Our team works tirelessly to source the finest materials, ensure reliable delivery,
            and provide support that goes beyond the sale. We don't just sell products —
            we build lasting relationships with every customer we serve.
          </p>
          <p>
            Whether you're a first-time buyer or a long-time partner, you can count on
            Kohlar for consistency, transparency, and excellence every single time.
          </p>
        </div>
      </section>

      {/* Why Choose Us section */}
      <section className="home-why">
        <div className="home-why__content">
          <h2>Why Choose Us</h2>
          <div className="home-why__grid">
            <div className="home-why__card">
              <div className="home-why__icon">✦</div>
              <h3>Premium Quality</h3>
              <p>Every product we offer goes through strict quality checks to ensure you receive nothing but the best.</p>
            </div>
            <div className="home-why__card">
              <div className="home-why__icon">⚡</div>
              <h3>Fast Delivery</h3>
              <p>We understand your time is valuable. Our logistics network ensures quick and reliable delivery to your doorstep.</p>
            </div>
            <div className="home-why__card">
              <div className="home-why__icon">🤝</div>
              <h3>Trusted by Thousands</h3>
              <p>With a growing base of satisfied customers, our reputation speaks for itself. Your trust is our greatest achievement.</p>
            </div>
            <div className="home-why__card">
              <div className="home-why__icon">💬</div>
              <h3>24/7 Support</h3>
              <p>Our dedicated support team is always ready to help you with any questions or concerns, any time of day.</p>
            </div>
            <div className="home-why__card">
              <div className="home-why__icon">💰</div>
              <h3>Best Prices</h3>
              <p>We offer competitive pricing without compromising on quality, so you always get the best value for your money.</p>
            </div>
            <div className="home-why__card">
              <div className="home-why__icon">♻️</div>
              <h3>Sustainable Practices</h3>
              <p>We are committed to eco-friendly operations and responsible sourcing to protect the planet for future generations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Product Range section */}
      <section className="home-products">
        <div className="home-products__content">
          <h2>Our Product Range</h2>
          <div className="home-products__grid">

            {categories.length === 0 ? (
              <div className="home-products__empty">
                <p>No categories available. Please add categories from the admin panel.</p>
              </div>
            ) : (
              categories.map(category => (
                <div key={category._id} className="home-products__item">
                  <div className="home-products__img" style={{ background: category.color }}>
                    <span>{category.icon}</span>
                  </div>
                  <div className="home-products__info">
                    <h3>{category.name}</h3>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
