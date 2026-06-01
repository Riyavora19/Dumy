import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './CategoryProducts.css';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // SVG icons for categories - Custom designs based on product types
  const getCategoryIcon = (categoryName, icon) => {
    const iconMap = {
      'Faucet': (
        <svg width="80" height="80" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Luxury basin mixer - elegant curved spout */}
          <path d="M20 35 L20 45 C20 48 22 50 25 50 L39 50 C42 50 44 48 44 45 L44 35" strokeWidth="2.5"/>
          <ellipse cx="32" cy="35" rx="12" ry="3" fill="currentColor" opacity="0.2"/>
          {/* Spout */}
          <path d="M32 35 Q32 25, 42 20 L48 20" strokeWidth="2.5"/>
          <circle cx="50" cy="20" r="3" fill="currentColor"/>
          {/* Handle */}
          <path d="M32 35 L32 15" strokeWidth="2"/>
          <circle cx="32" cy="12" r="4" fill="currentColor"/>
          <path d="M28 12 L36 12" strokeWidth="2" stroke="white"/>
          {/* Base detail */}
          <rect x="26" y="33" width="12" height="4" rx="1" fill="currentColor" opacity="0.3"/>
        </svg>
      ),
      'Accessories': (
        <svg width="80" height="80" viewBox="0 0 64 64" fill="currentColor">
          {/* Bathroom accessories set - towel bar, soap dispenser, holder */}
          {/* Towel bar */}
          <rect x="10" y="15" width="20" height="3" rx="1.5" opacity="0.9"/>
          <circle cx="10" cy="16.5" r="2" fill="white" opacity="0.5"/>
          <circle cx="30" cy="16.5" r="2" fill="white" opacity="0.5"/>
          {/* Soap dispenser */}
          <rect x="38" y="12" width="8" height="12" rx="2" opacity="0.9"/>
          <rect x="40" y="10" width="4" height="3" rx="1" opacity="0.9"/>
          <circle cx="42" cy="18" r="1" fill="white"/>
          {/* Toothbrush holder */}
          <rect x="52" y="14" width="6" height="8" rx="1" opacity="0.9"/>
          <rect x="53.5" y="12" width="1" height="3" opacity="0.9"/>
          <rect x="56.5" y="12" width="1" height="3" opacity="0.9"/>
          {/* Toilet paper holder */}
          <circle cx="20" cy="38" r="8" opacity="0.9" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="20" cy="38" r="5" opacity="0.5"/>
          <rect x="12" y="37" width="4" height="2" rx="1" opacity="0.9"/>
          {/* Robe hook */}
          <circle cx="45" cy="38" r="4" opacity="0.9"/>
          <path d="M45 38 L45 45" stroke="currentColor" strokeWidth="2" opacity="0.9" fill="none"/>
          <circle cx="45" cy="47" r="2" opacity="0.9"/>
        </svg>
      ),
      'Tiles': (
        <svg width="80" height="80" viewBox="0 0 64 64" fill="currentColor">
          {/* Floor tile pattern - decorative tiles with patterns */}
          {/* Main tiles */}
          <rect x="6" y="6" width="13" height="13" rx="1" opacity="0.9"/>
          <rect x="22" y="6" width="13" height="13" rx="1" opacity="0.7"/>
          <rect x="38" y="6" width="13" height="13" rx="1" opacity="0.9"/>
          <rect x="6" y="22" width="13" height="13" rx="1" opacity="0.7"/>
          <rect x="22" y="22" width="13" height="13" rx="1" opacity="0.9"/>
          <rect x="38" y="22" width="13" height="13" rx="1" opacity="0.7"/>
          <rect x="6" y="38" width="13" height="13" rx="1" opacity="0.9"/>
          <rect x="22" y="38" width="13" height="13" rx="1" opacity="0.7"/>
          <rect x="38" y="38" width="13" height="13" rx="1" opacity="0.9"/>
          {/* Decorative patterns on tiles */}
          <circle cx="12.5" cy="12.5" r="2" fill="white" opacity="0.4"/>
          <circle cx="28.5" cy="12.5" r="2" fill="white" opacity="0.4"/>
          <circle cx="44.5" cy="12.5" r="2" fill="white" opacity="0.4"/>
          <circle cx="12.5" cy="28.5" r="2" fill="white" opacity="0.4"/>
          <circle cx="28.5" cy="28.5" r="2" fill="white" opacity="0.4"/>
          <circle cx="44.5" cy="28.5" r="2" fill="white" opacity="0.4"/>
          <circle cx="12.5" cy="44.5" r="2" fill="white" opacity="0.4"/>
          <circle cx="28.5" cy="44.5" r="2" fill="white" opacity="0.4"/>
          <circle cx="44.5" cy="44.5" r="2" fill="white" opacity="0.4"/>
          {/* Grout lines */}
          <line x1="19.5" y1="6" x2="19.5" y2="51" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="35.5" y1="6" x2="35.5" y2="51" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="6" y1="19.5" x2="51" y2="19.5" stroke="white" strokeWidth="1" opacity="0.3"/>
          <line x1="6" y1="35.5" x2="51" y2="35.5" stroke="white" strokeWidth="1" opacity="0.3"/>
        </svg>
      )
    };

    return iconMap[categoryName] || <span style={{ fontSize: '64px' }}>{icon || '📦'}</span>;
  };

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [categoryId]);

  const fetchCategoryAndProducts = async () => {
    try {
      // Determine API base URL
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : 'https://dumy-2-mli2.onrender.com/api';

      // Fetch category details
      const categoryResponse = await axios.get(`${API_URL}/categories/${categoryId}`);
      if (categoryResponse.data.success) {
        setCategory(categoryResponse.data.data);
      }

      // Fetch products in this category
      const productsResponse = await axios.get(`${API_URL}/products/category/${categoryId}`);
      if (productsResponse.data.success) {
        const allProducts = productsResponse.data.data;
        
        // Group products by company
        const companiesMap = new Map();
        
        for (const product of allProducts) {
          const companyName = (typeof product.company === 'object' && product.company?.name) 
            ? product.company.name 
            : (product.companyName || product.company || 'Unknown');
          
          if (!companiesMap.has(companyName)) {
            companiesMap.set(companyName, {
              name: companyName,
              products: [],
              productName: product.name // Store first product name for the link
            });
          }
          
          companiesMap.get(companyName).products.push(product);
        }
        
        // Convert map to array and add variant count
        const companiesArray = Array.from(companiesMap.values()).map(company => ({
          ...company,
          variantCount: company.products.length,
          minPrice: Math.min(...company.products.map(p => p.price)),
          maxPrice: Math.max(...company.products.map(p => p.price))
        }));
        
        setProducts(companiesArray);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="category-products">
        <div className="category-products__loading">Loading products...</div>
      </main>
    );
  }

  return (
    <main className="category-products">
      <div className="category-products__container">
        {/* Breadcrumb */}
        <div className="category-products__breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/categories">Categories</Link>
          <span>/</span>
          <span>{category?.name}</span>
        </div>

        {/* Header */}
        <header className="category-products__header">
          {category && (
            <div className="category-products__category-info">
              <div className="category-products__category-icon" style={{ background: category.color }}>
                <span>{category.icon}</span>
              </div>
              <div>
                <h1>{category.name}</h1>
                {category.description && <p>{category.description}</p>}
              </div>
            </div>
          )}
          <div className="category-products__count">
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </div>
        </header>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="category-products__empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <h2>No Products Available</h2>
            <p>Products in this category will appear here once they are added.</p>
          </div>
        ) : (
          <div className="category-products__grid">
            {products.map((company, index) => (
              <div key={index} className="category-products__card">
                <div className="category-products__image category-products__icon-display">
                  <div className="category-products__icon-wrapper" style={{ background: category?.color || '#3b82f6' }}>
                    {getCategoryIcon(category?.name, category?.icon)}
                  </div>
                </div>
                <div className="category-products__content">
                  <h3>{company.name}</h3>
                  <p className="category-products__company">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    {category?.name} Products
                  </p>
                  <p className="category-products__description">
                    Premium {category?.name?.toLowerCase()} collection with {company.variantCount} variants
                  </p>
                  <div className="category-products__footer">
                    <span className="category-products__variants">
                      {company.variantCount} {company.variantCount === 1 ? 'Variant' : 'Variants'}
                    </span>
                    <span className="category-products__price-range">
                      ₹{company.minPrice.toLocaleString()} - ₹{company.maxPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Link 
                  to={`/categories/${categoryId}/company/${encodeURIComponent(company.name)}`}
                  className="category-products__btn"
                >
                  View Variants
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default CategoryProducts;
