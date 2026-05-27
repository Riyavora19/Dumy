import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    checkUserAuth();
  }, []);

  const checkUserAuth = () => {
    const userToken = localStorage.getItem('userToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (userToken && userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (error) {
        console.error('Error parsing user info:', error);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/categories/active');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page or handle search
      console.log('Search:', searchQuery);
    }
  };

  const handleSearchInput = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/search/${query}`);
        if (response.data.success) {
          setSearchResults(response.data.data);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleProductClick = (productId, categoryId) => {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate(`/categories/${categoryId}`);
  };

  return (
    <header className="header">
      <div className="header__main">

        {/* LEFT: Logo + brand */}
        <div className="header__brand">
          <div className="header__logo-icon">
            <img src="/gtss-logo.png" alt="GTSS Logo" />
          </div>
          <div className="header__brand-text">
            <span className="header__company-name">Gujarat Tube & Sanitary Stores</span>
            <span className="header__subtitle">TILES | CP FITTING | SANITARY | BATHTUB</span>
            <div className="header__contact">
              <span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16.92z"/>
                </svg>
                92272 06063
              </span>
              <span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                gtts47@gmail.com
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: Nav links */}
        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          
          <div 
            className="header__nav-dropdown"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <NavLink to="/categories" onClick={() => setMenuOpen(false)}>
              Categories
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </NavLink>
            {categoriesOpen && categories.length > 0 && (
              <div className="header__dropdown-menu">
                {categories.filter(cat => cat && cat._id && cat.name).map(category => (
                  <Link 
                    key={category._id} 
                    to={`/categories/${category._id}`}
                    onClick={() => {
                      setCategoriesOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    <span className="header__dropdown-icon" style={{ background: category.color }}>
                      {category.icon}
                    </span>
                    {typeof category.name === 'object' ? String(category.name) : category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/catalogus" onClick={() => setMenuOpen(false)}>Catalogus</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>About Us</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
        </nav>

        {/* RIGHT: Search + Cart + Profile/Login + Hamburger */}
        <div className="header__right">
          <form className="header__search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchInput}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            {showSearchResults && searchResults.length > 0 && (
              <div className="header__search-results">
                {searchResults.map(product => (
                  <div 
                    key={product._id} 
                    className="header__search-result-item"
                    onClick={() => handleProductClick(product._id, product.category._id)}
                  >
                    <div className="header__search-result-image">
                      <img 
                        src={`http://localhost:5000${product.images[0]}`} 
                        alt={product.name}
                      />
                    </div>
                    <div className="header__search-result-info">
                      <h4>{product.name}</h4>
                      {product.category && (
                        <p className="header__search-result-category">
                          {product.category.name}
                        </p>
                      )}
                      {(product.company || product.companyName) && (
                        <p className="header__search-result-company">
                          {typeof product.company === 'object' && product.company?.name 
                            ? product.company.name 
                            : product.companyName || product.company}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showSearchResults && searchQuery && searchResults.length === 0 && (
              <div className="header__search-empty">
                <p>No products found</p>
              </div>
            )}
          </form>

          <Link to="/cart" className="header__cart" aria-label="Cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span>Cart</span>
            {getCartCount() > 0 && (
              <span className="header__cart-badge">{getCartCount()}</span>
            )}
          </Link>

          <button
            className={`header__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
