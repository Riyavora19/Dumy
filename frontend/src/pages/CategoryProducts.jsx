import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './CategoryProducts.css';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [categoryId]);

  const fetchCategoryAndProducts = async () => {
    try {
      // Fetch category details
      const categoryResponse = await axios.get(`http://localhost:5000/api/categories/${categoryId}`);
      if (categoryResponse.data.success) {
        setCategory(categoryResponse.data.data);
      }

      // Fetch products in this category
      const productsResponse = await axios.get(`http://localhost:5000/api/products/category/${categoryId}`);
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
              image: product.images[0],
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
                <div className="category-products__image">
                  {company.image ? (
                    <img 
                      src={`http://localhost:5000${company.image}`}
                      alt={company.name}
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
