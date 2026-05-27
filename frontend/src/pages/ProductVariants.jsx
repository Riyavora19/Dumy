import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import ProductReviews from '../components/ProductReviews';
import './ProductVariants.css';

const ProductVariants = () => {
  const { categoryId, itemTypeId, companyName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productName = searchParams.get('product');
  const companyFilter = searchParams.get('company') || companyName;
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price-asc');
  const [priceRange, setPriceRange] = useState([0, 10000000]); // 1 crore max
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedWarranty, setSelectedWarranty] = useState('all');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart, isInCart, getCartItemQuantity } = useCart();

  // Fetch data only when category, product name, or company changes
  useEffect(() => {
    fetchData();
  }, [categoryId, productName, companyName]);

  // Apply filters and sorting whenever filter values change
  useEffect(() => {
    applyFilters();
  }, [sortBy, priceRange, selectedColor, selectedCompany, selectedMaterial, selectedSize, selectedWarranty, showInStockOnly, searchQuery, allProducts]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch category
      const categoryResponse = await axios.get(`https://dumy-2-mli2.onrender.com/api/categories/${categoryId}`);
      if (categoryResponse.data.success) {
        setCategory(categoryResponse.data.data);
      }

      let fetchedProducts = [];

      // If companyName is in the route, fetch all products from that company in this category
      if (companyName) {
        const productsResponse = await axios.get(
          `https://dumy-2-mli2.onrender.com/api/products/category/${categoryId}`
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
      // If itemTypeId is provided, fetch products by item type
      else if (itemTypeId) {
        const productsResponse = await axios.get(
          `https://dumy-2-mli2.onrender.com/api/products/by-item-type/${itemTypeId}`
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
      // Otherwise, fetch products by name and category (if productName is in query params)
      else if (productName) {
        const productsResponse = await axios.get(
          `https://dumy-2-mli2.onrender.com/api/products/variants/${categoryId}/${encodeURIComponent(productName)}`
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
      
      // Calculate max price from fetched products
      if (fetchedProducts.length > 0) {
        const maxProductPrice = Math.max(...fetchedProducts.map(p => p.price || 0));
        const roundedMax = Math.ceil(maxProductPrice / 100000) * 100000; // Round up to nearest lakh
        setMaxPrice(roundedMax);
        setPriceRange([0, roundedMax]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    console.log('Applying filters:', {
      searchQuery,
      selectedColor,
      selectedCompany,
      selectedMaterial,
      selectedSize,
      selectedWarranty,
      showInStockOnly,
      totalProducts: allProducts.length
    });

    // Filter by search query
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.variant?.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filter by color
    if (selectedColor !== 'all') {
      filtered = filtered.filter(p => {
        const productColor = p.specifications?.color || p.color;
        return productColor && productColor.toLowerCase() === selectedColor.toLowerCase();
      });
    }

    // Filter by company
    if (selectedCompany !== 'all') {
      filtered = filtered.filter(p => {
        const productCompany = typeof p.company === 'object' && p.company?.name 
          ? p.company.name 
          : p.companyName || p.company;
        return productCompany === selectedCompany;
      });
    }

    // Filter by material
    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(p => {
        const productMaterial = p.specifications?.material || p.material;
        return productMaterial && productMaterial.toLowerCase() === selectedMaterial.toLowerCase();
      });
    }

    // Filter by size
    if (selectedSize !== 'all') {
      filtered = filtered.filter(p => {
        const productSize = p.specifications?.size || p.size;
        return productSize && productSize.toLowerCase() === selectedSize.toLowerCase();
      });
    }

    // Filter by warranty
    if (selectedWarranty !== 'all') {
      filtered = filtered.filter(p => {
        const productWarranty = p.specifications?.warranty || p.warranty;
        return productWarranty && productWarranty.toLowerCase() === selectedWarranty.toLowerCase();
      });
    }

    // Filter by stock status
    if (showInStockOnly) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    console.log('Filtered products:', filtered.length);
    setProducts(filtered);
  };

  // Get unique values from all products for filters
  const colors = [...new Set(allProducts.map(p => p.specifications?.color || p.color).filter(Boolean))];
  const companies = [...new Set(allProducts.map(p => {
    const company = typeof p.company === 'object' && p.company?.name 
      ? p.company.name 
      : p.companyName || p.company;
    return company;
  }).filter(Boolean))];
  const materials = [...new Set(allProducts.map(p => p.specifications?.material || p.material).filter(Boolean))];
  const sizes = [...new Set(allProducts.map(p => p.specifications?.size || p.size).filter(Boolean))];
  const warranties = [...new Set(allProducts.map(p => p.specifications?.warranty || p.warranty).filter(Boolean))];

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
          <span>{companyName || productName || 'Products'}</span>
        </div>

        {/* Header */}
        <header className="product-variants__header">
          {category && (
            <div className="product-variants__category-info">
              <div className="product-variants__category-icon" style={{ background: category.color }}>
                <span>{category.icon}</span>
              </div>
              <div>
                <h1>{companyName ? `${companyName} Products` : (productName || 'Products')}</h1>
                <p>{products.length} variants available</p>
              </div>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="product-variants__header-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="product-variants__header-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="product-variants__header-search-clear"
                title="Clear search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
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
                      left: `${(priceRange[0] / maxPrice) * 100}%`,
                      right: `${100 - (priceRange[1] / maxPrice) * 100}%`
                    }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
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
                  max={maxPrice}
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

            {/* Stock Status Filter */}
            <div className="product-variants__filter-section">
              <label className="product-variants__checkbox-label">
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  className="product-variants__checkbox"
                />
                <span>Show In Stock Only</span>
              </label>
            </div>

            {/* Company Filter - Always show */}
            <div className="product-variants__filter-section">
              <h3>Brand</h3>
              <div className="product-variants__custom-dropdown">
                <button
                  className="product-variants__dropdown-btn"
                  onClick={() => setOpenDropdown(openDropdown === 'company' ? null : 'company')}
                >
                  <span>{selectedCompany === 'all' ? 'All Brands' : selectedCompany}</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: openDropdown === 'company' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openDropdown === 'company' && (
                  <div className="product-variants__dropdown-menu">
                    <button
                      className={`product-variants__dropdown-item ${selectedCompany === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCompany('all');
                        setOpenDropdown(null);
                      }}
                    >
                      All Brands
                    </button>
                    {companies.length > 0 ? (
                      companies.map(company => (
                        <button
                          key={company}
                          className={`product-variants__dropdown-item ${selectedCompany === company ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedCompany(company);
                            setOpenDropdown(null);
                          }}
                        >
                          {company}
                        </button>
                      ))
                    ) : (
                      <div className="product-variants__dropdown-item" style={{ opacity: 0.5, cursor: 'default' }}>
                        No brands available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Color Filter - Always show */}
            <div className="product-variants__filter-section">
              <h3>Color</h3>
              <div className="product-variants__custom-dropdown">
                <button
                  className="product-variants__dropdown-btn"
                  onClick={() => setOpenDropdown(openDropdown === 'color' ? null : 'color')}
                >
                  <span>{selectedColor === 'all' ? 'All Colors' : selectedColor}</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: openDropdown === 'color' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openDropdown === 'color' && (
                  <div className="product-variants__dropdown-menu">
                    <button
                      className={`product-variants__dropdown-item ${selectedColor === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedColor('all');
                        setOpenDropdown(null);
                      }}
                    >
                      All Colors
                    </button>
                    {colors.length > 0 ? (
                      colors.map(color => (
                        <button
                          key={color}
                          className={`product-variants__dropdown-item ${selectedColor === color ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedColor(color);
                            setOpenDropdown(null);
                          }}
                        >
                          {color}
                        </button>
                      ))
                    ) : (
                      <div className="product-variants__dropdown-item" style={{ opacity: 0.5, cursor: 'default' }}>
                        No colors available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Material Filter - Always show */}
            <div className="product-variants__filter-section">
              <h3>Material</h3>
              <div className="product-variants__custom-dropdown">
                <button
                  className="product-variants__dropdown-btn"
                  onClick={() => setOpenDropdown(openDropdown === 'material' ? null : 'material')}
                >
                  <span>{selectedMaterial === 'all' ? 'All Materials' : selectedMaterial}</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: openDropdown === 'material' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openDropdown === 'material' && (
                  <div className="product-variants__dropdown-menu">
                    <button
                      className={`product-variants__dropdown-item ${selectedMaterial === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedMaterial('all');
                        setOpenDropdown(null);
                      }}
                    >
                      All Materials
                    </button>
                    {materials.length > 0 ? (
                      materials.map(material => (
                        <button
                          key={material}
                          className={`product-variants__dropdown-item ${selectedMaterial === material ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedMaterial(material);
                            setOpenDropdown(null);
                          }}
                        >
                          {material}
                        </button>
                      ))
                    ) : (
                      <div className="product-variants__dropdown-item" style={{ opacity: 0.5, cursor: 'default' }}>
                        No materials available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Size Filter - Always show */}
            <div className="product-variants__filter-section">
              <h3>Size</h3>
              <div className="product-variants__custom-dropdown">
                <button
                  className="product-variants__dropdown-btn"
                  onClick={() => setOpenDropdown(openDropdown === 'size' ? null : 'size')}
                >
                  <span>{selectedSize === 'all' ? 'All Sizes' : selectedSize}</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: openDropdown === 'size' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openDropdown === 'size' && (
                  <div className="product-variants__dropdown-menu">
                    <button
                      className={`product-variants__dropdown-item ${selectedSize === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedSize('all');
                        setOpenDropdown(null);
                      }}
                    >
                      All Sizes
                    </button>
                    {sizes.length > 0 ? (
                      sizes.map(size => (
                        <button
                          key={size}
                          className={`product-variants__dropdown-item ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedSize(size);
                            setOpenDropdown(null);
                          }}
                        >
                          {size}
                        </button>
                      ))
                    ) : (
                      <div className="product-variants__dropdown-item" style={{ opacity: 0.5, cursor: 'default' }}>
                        No sizes available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Warranty Filter - Always show */}
            <div className="product-variants__filter-section">
              <h3>Warranty</h3>
              <div className="product-variants__custom-dropdown">
                <button
                  className="product-variants__dropdown-btn"
                  onClick={() => setOpenDropdown(openDropdown === 'warranty' ? null : 'warranty')}
                >
                  <span>{selectedWarranty === 'all' ? 'All Warranties' : selectedWarranty}</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ transform: openDropdown === 'warranty' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openDropdown === 'warranty' && (
                  <div className="product-variants__dropdown-menu">
                    <button
                      className={`product-variants__dropdown-item ${selectedWarranty === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedWarranty('all');
                        setOpenDropdown(null);
                      }}
                    >
                      All Warranties
                    </button>
                    {warranties.length > 0 ? (
                      warranties.map(warranty => (
                        <button
                          key={warranty}
                          className={`product-variants__dropdown-item ${selectedWarranty === warranty ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedWarranty(warranty);
                            setOpenDropdown(null);
                          }}
                        >
                          {warranty}
                        </button>
                      ))
                    ) : (
                      <div className="product-variants__dropdown-item" style={{ opacity: 0.5, cursor: 'default' }}>
                        No warranties available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
                      {product.images && product.images.length > 0 ? (
                        <>
                          <img 
                            src={`${product.images[0].startsWith('http') ? product.images[0] : 'https://dumy-2-mli2.onrender.com' + product.images[0]}`} 
                            alt={product.name}
                          />
                          {product.images.length > 1 && (
                            <span className="product-variants__image-count">
                              +{product.images.length - 1}
                            </span>
                          )}
                        </>
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          background: '#f5f5f5',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}></div>
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
                        {product.discountPercentage > 0 && (
                          <span className="product-variants__discount-badge">-{product.discountPercentage}%</span>
                        )}
                      </div>
                      {product.stock > 0 ? (
                        <span className="product-variants__stock in-stock">In Stock</span>
                      ) : (
                        <span className="product-variants__stock out-of-stock">Out of Stock</span>
                      )}
                      <div className="product-variants__card-actions">
                        {!isInCart(product._id) ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <button 
                              className="product-variants__btn product-variants__btn--details"
                              onClick={() => openModal(product)}
                            >
                              View Details
                            </button>
                            <button 
                              className="product-variants__btn product-variants__btn--in-cart"
                              onClick={() => navigate('/cart')}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              In Cart ({getCartItemQuantity(product._id)})
                            </button>
                          </>
                        )}
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
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <img 
                      src={`${selectedProduct.images[currentImageIndex].startsWith('http') ? selectedProduct.images[currentImageIndex] : 'https://dumy-2-mli2.onrender.com' + selectedProduct.images[currentImageIndex]}`}
                      alt={selectedProduct.name}
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: '#f5f5f5',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}></div>
                  )}
                </div>
                
                {selectedProduct.images && selectedProduct.images.length > 1 && (
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
                          <img src={`${img.startsWith('http') ? img : 'https://dumy-2-mli2.onrender.com' + img}`} alt="" />
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

            {/* Product Reviews Section */}
            <div className="product-variants__modal-reviews">
              <ProductReviews productId={selectedProduct._id} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductVariants;
