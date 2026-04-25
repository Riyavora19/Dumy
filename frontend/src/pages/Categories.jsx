import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories/active');
      console.log('Categories API Response:', response.data);
      if (response.data.success) {
        console.log('Categories data:', response.data.data);
        // Validate that we're getting categories, not companies
        const validCategories = response.data.data.filter(item => {
          // Check if it's a category (has icon, color) and not a company (has isPartner, rating)
          const isCategory = !item.hasOwnProperty('isPartner') && !item.hasOwnProperty('rating');
          if (!isCategory) {
            console.error('Invalid item detected (looks like a company):', item);
          }
          // Also check if name is actually a string
          if (typeof item.name !== 'string') {
            console.error('Category name is not a string:', item.name, typeof item.name);
          }
          return isCategory && typeof item.name === 'string';
        });
        console.log('Valid categories:', validCategories);
        setCategories(validCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="categories">
      <div className="categories__container">
        <header className="categories__header">
          <h1>Our Categories</h1>
          <p>Browse through our wide range of product categories</p>
        </header>

        {loading ? (
          <div className="categories__loading">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="categories__empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <h2>No Categories Available</h2>
            <p>Categories will appear here once they are added by the admin.</p>
          </div>
        ) : (
          <div className="categories__grid">
            {categories.filter(cat => cat && cat._id && cat.name && typeof cat.name === 'string').map(category => (
              <div key={category._id} className="categories__card">
                <div className="categories__card-icon" style={{ background: category.color || '#d6e4f0' }}>
                  <span>{category.icon || '📦'}</span>
                </div>
                <div className="categories__card-content">
                  <h3>{String(category.name)}</h3>
                  {category.description && typeof category.description === 'string' && <p>{category.description}</p>}
                </div>
                <Link to={`/categories/${category._id}`} className="categories__card-btn">
                  View Products
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
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

export default Categories;
