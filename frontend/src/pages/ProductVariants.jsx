import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import './ProductVariants.css';

const ProductVariants = () => {
  const { categoryId, productName, companyName } = useParams();
  const [searchParams] = useSearchParams();
  const companyFilter = searchParams.get('company') || companyName;
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [sortBy, setSortBy] = useState('price-asc');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  // Fetch data only when category or product name changes
  useEffect(() => {
    fetchData();
  }, [categoryId, productName]);

  // Apply filters and sorting whenever filter values change
  useEffect(() => {
    applyFilters();
  }, [sortBy, priceRange, selectedColor, allProducts]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch category
      const categoryResponse = await axios.get(`http://localhost:5000/api/categories/${categoryId}`);
      if (categoryResponse.data.success) {
        setCategory(categoryResponse.data.data);
      }

      let fetchedProducts = [];

      // If companyName is in the route, fetch all products from that company in this category
      if (companyName) {
        const productsResponse = await axios.get(
          `http://localhost:5000/api/products/category/${categoryId}`
        );
        
        if (productsResponse.data.success) {
          // Filter by company
          fetchedProducts = productsResponse.data.data.filter(p => {
            const productCompany = typeof p.company === 'object' && p.company?.name 
              ? p.company.name 
              : p.companyName || p.company;
            return productCompany === companyName;
          });
        }
      } 
      // Otherwise, fetch products by name and category
      else if (productName) {
        const productsResponse = await axios.get(
          `http://localhost:5000/api/products/variants/${categoryId}/${encodeURIComponent(productName)}`
        );
        
        if (productsResponse.data.success) {
          fetchedProducts = productsResponse.data.data;
          
          // Filter by company if specified in query params
          if (companyFilter) {
            fetchedProducts = fetchedProducts.filter(p => {
              const productCompany = typeof p.company === 'object' && p.company?.name 
                ? p.company.name 
                : p.companyName || p.company;
              return productCompany === companyFilter;
            });
          }
        }
      }
      
      setAllProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    // Filter by price range
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filter by color
    if (selectedColor !== 'all') {
      filtered = filtered.filter(p => p.specifications?.color?.toLowerCase() === selectedColor.toLowerCase());
    }

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setProducts(filtered);
  };

  // Get unique colors from all products
  const colors = [...new Set(allProducts.map(p => p.specifications?.color).filter(Boolean))];

  const nextImage = () => {
    if (selectedProduct && currentImageIndex < selectedProduct.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  if (loading) {
    return (
      <main className="product-variants">
        <div className="product-variants__loading">Loading variants...</div>
      </main>
    );
  }

  return (
    <main className="product-variants">
      <div className="product-variants__container">
        {/* Breadcrumb */}
        <div className="product-variants__breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/categories">Categories</Link>
          <span>/</span>
          <Link to={`/categories/${categoryId}`}>{category?.name}</Link>
          <span>/</span>
          <span>{productName}</span>
        </div>

        {/* Header */}
        <header className="product-variants__header">
          {category && (
            <div className="product-variants__category-info">
              <div className="product-variants__category-icon" style={{ background: category.color }}>
                <span>{category.icon}</span>
              </div>
              <div>
                <h1>{companyFilter ? `${companyFilter} ${productName}` : productName}</h1>
                <p>{products.length} variants available</p>
              </div>
            </div>
          )}
        </header>

        <div className="product-variants__content">
          {/* Sidebar Filters */}
          <aside className="product-variants__sidebar">
            <div className="product-variants__filter-section">
              <h3>Sort By</h3>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="product-variants__select"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <div className="product-variants__filter-section">
              <h3>Price Range</h3>
              <div className="product-variants__range-container">
                <div className="product-variants__range-track">
                  <div 
                    className="product-variants__range-fill"
                    style={{
                      left: `${(priceRange[0] / 100000) * 100}%`,
                      right: `${100 - (priceRange[1] / 100000) * 100}%`
                    }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val <= priceRange[1]) {
                      setPriceRange([val, priceRange[1]]);
                    }
                  }}
                  className="product-variants__range-input product-variants__range-input--min"
                />
                <input
                  type="range"
                  min="0"
                  max="100000"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= priceRange[0]) {
                      setPriceRange([priceRange[0], val]);
                    }
                  }}
                  className="product-variants__range-input product-variants__range-input--max"
                />
              </div>
              <p className="product-variants__price-display">
                ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
              </p>
            </div>

            {colors.length > 0 && (
              <div className="product-variants__filter-section">
                <h3>Color</h3>
                <div className="product-variants__color-filter">
                  <button
                    className={`product-variants__color-btn ${selectedColor === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedColor('all')}
                  >
                    All Colors
                  </button>
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`product-variants__color-btn ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Products Grid */}
          <div className="product-variants__main">
            {products.length === 0 ? (
              <div className="product-variants__empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <h2>No Variants Found</h2>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="product-variants__grid">
                {products.map(product => (
                  <div key={product._id} className="product-variants__card">
                    <div className="product-variants__image">
                      <img 
                        src={`http://localhost:5000${product.images[0]}`} 
                        alt={product.name}
                      />
                      {product.images.length > 1 && (
                        <span className="product-variants__image-count">
                          +{product.images.length - 1}
                        </span>
                      )}
                      <div className="product-variants__share-dropdown">
                        <button className="product-variants__share-btn">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3"/>
                            <circle cx="6" cy="12" r="3"/>
                            <circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                          </svg>
                        </button>
                        <div className="product-variants__share-menu">
                          <a 
                            href={`https://wa.me/?text=Check out this product: ${product.name} - ${window.location.href}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="product-variants__share-item"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            WhatsApp
                          </a>
                          <a 
                            href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="product-variants__share-item"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                          </a>
                          <a 
                            href={`https://www.instagram.com/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="product-variants__share-item"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            Instagram
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="product-variants__content-card">
                      <div className="product-variants__title-row">
                        <h3>{product.name}</h3>
                        {product.discount && (
                          <span className="product-variants__discount-badge">-{product.discount}%</span>
                        )}
                      </div>
                      {product.stock > 0 ? (
                        <span className="product-variants__stock in-stock">In Stock</span>
                      ) : (
                        <span className="product-variants__stock out-of-stock">Out of Stock</span>
                      )}
                      <div className="product-variants__card-actions">
                        <button 
                          className="product-variants__btn product-variants__btn--details"
                          onClick={() => openModal(product)}
                        >
                          View Details
                        </button>
                        <button 
                          className="product-variants__btn product-variants__btn--cart"
                          onClick={() => {
                            addToCart(product);
                            alert('Added to cart!');
                          }}
                          disabled={product.stock === 0}
                        >
                          Add to Cart
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showModal && selectedProduct && (
        <div className="product-variants__modal-overlay" onClick={closeModal}>
          <div className="product-variants__modal" onClick={(e) => e.stopPropagation()}>
            <button className="product-variants__modal-close" onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            <div className="product-variants__modal-content">
              <div className="product-variants__modal-image-container">
                <div className="product-variants__modal-image">
                  <img 
                    src={`http://localhost:5000${selectedProduct.images[currentImageIndex]}`} 
                    alt={selectedProduct.name}
                  />
                </div>
                
                {selectedProduct.images.length > 1 && (
                  <>
                    <button 
                      className="product-variants__modal-nav product-variants__modal-nav--prev"
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                    </button>
                    <button 
                      className="product-variants__modal-nav product-variants__modal-nav--next"
                      onClick={nextImage}
                      disabled={currentImageIndex === selectedProduct.images.length - 1}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                    <div className="product-variants__modal-image-counter">
                      {currentImageIndex + 1} / {selectedProduct.images.length}
                    </div>
                    <div className="product-variants__modal-thumbnails">
                      {selectedProduct.images.map((img, index) => (
                        <button
                          key={index}
                          className={`product-variants__modal-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img src={`http://localhost:5000${img}`} alt="" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="product-variants__modal-details">
                <h2>{selectedProduct.name}</h2>
                {selectedProduct.variant && (
                  <p className="product-variants__modal-variant">{selectedProduct.variant}</p>
                )}
                
                <div className="product-variants__modal-specs">
                  {(selectedProduct.company || selectedProduct.companyName) && (
                    <div className="product-variants__modal-spec">
                      <span className="label">Company:</span>
                      <span className="value">
                        {typeof selectedProduct.company === 'object' && selectedProduct.company?.name 
                          ? selectedProduct.company.name 
                          : selectedProduct.companyName || selectedProduct.company}
                      </span>
                    </div>
                  )}
                  {selectedProduct.specifications?.color && (
                    <div className="product-variants__modal-spec">
                      <span className="label">Color:</span>
                      <span className="value">{selectedProduct.specifications.color}</span>
                    </div>
                  )}
                  {selectedProduct.specifications?.size && (
                    <div className="product-variants__modal-spec">
                      <span className="label">Size:</span>
                      <span className="value">{selectedProduct.specifications.size}</span>
                    </div>
                  )}
                  {selectedProduct.specifications?.material && (
                    <div className="product-variants__modal-spec">
                      <span className="label">Material:</span>
                      <span className="value">{selectedProduct.specifications.material}</span>
                    </div>
                  )}
                  {selectedProduct.specifications?.warranty && (
                    <div className="product-variants__modal-spec">
                      <span className="label">Warranty:</span>
                      <span className="value">{selectedProduct.specifications.warranty}</span>
                    </div>
                  )}
                </div>

                <div className="product-variants__modal-price">
                  <span className="current">₹{selectedProduct.price.toLocaleString()}</span>
                  {selectedProduct.originalPrice && (
                    <span className="original">₹{selectedProduct.originalPrice.toLocaleString()}</span>
                  )}
                  {selectedProduct.discount && (
                    <span className="discount">{selectedProduct.discount}% OFF</span>
                  )}
                </div>

                <div className="product-variants__modal-stock">
                  {selectedProduct.stock > 0 ? (
                    <span className="in-stock">✓ In Stock</span>
                  ) : (
                    <span className="out-of-stock">✗ Out of Stock</span>
                  )}
                </div>

                {selectedProduct.description && (
                  <p className="product-variants__modal-description">{selectedProduct.description}</p>
                )}

                <button 
                  className="product-variants__modal-add-btn"
                  onClick={() => {
                    addToCart(selectedProduct);
                    closeModal();
                    alert('Added to cart!');
                  }}
                  disabled={selectedProduct.stock === 0}
                >
                  Add to Cart
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductVariants;
