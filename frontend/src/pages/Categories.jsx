import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Categories.css';

// Smart icon fallback based on category name
const getCategoryIcon = (category) => {
  if (category.icon && category.icon !== '📦') return category.icon;

  const name = (category.name || '').toLowerCase();
  if (name.includes('toilet') || name.includes('wc') || name.includes('commode') || name.includes('vitreous')) return '🚽';
  if (name.includes('shower') || name.includes('bath')) return '🚿';
  if (name.includes('basin') || name.includes('sink') || name.includes('wash')) return '🪣';
  if (name.includes('faucet') || name.includes('tap') || name.includes('mixer')) return '🚰';
  if (name.includes('mirror') || name.includes('cabinet')) return '🪞';
  if (name.includes('tile') || name.includes('floor') || name.includes('wall')) return '🔲';
  if (name.includes('kitchen')) return '🍳';
  if (name.includes('urinal')) return '🚻';
  if (name.includes('acrylic') || name.includes('tub')) return '🛁';
  if (name.includes('accessory') || name.includes('accessories')) return '🔧';
  if (name.includes('light') || name.includes('led')) return '💡';
  if (name.includes('door') || name.includes('window')) return '🚪';
  return '📦';
};

// Smart color fallback based on category name
const getCategoryColor = (category) => {
  if (category.color && category.color !== '#d6e4f0') return category.color;

  const name = (category.name || '').toLowerCase();
  if (name.includes('toilet') || name.includes('wc') || name.includes('vitreous')) return '#e0f2fe';
  if (name.includes('shower') || name.includes('bath')) return '#dbeafe';
  if (name.includes('basin') || name.includes('sink')) return '#e0f7fa';
  if (name.includes('faucet') || name.includes('tap') || name.includes('mixer')) return '#e8f5e9';
  if (name.includes('mirror') || name.includes('cabinet')) return '#f3e8ff';
  if (name.includes('tile') || name.includes('floor')) return '#fff3e0';
  if (name.includes('kitchen')) return '#fce4ec';
  if (name.includes('urinal')) return '#e8eaf6';
  if (name.includes('acrylic') || name.includes('tub')) return '#e0f2f1';
  return '#f0f4f8';
};

// Proper case: "KITCHEN SINK" → "Kitchen Sink"
const toProperCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories/active');
      if (response.data.success) {
        const validCategories = response.data.data.filter(item =>
          !item.hasOwnProperty('isPartner') &&
          !item.hasOwnProperty('rating') &&
          typeof item.name === 'string'
        );
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
            {categories
              .filter(cat => cat && cat._id && cat.name && typeof cat.name === 'string')
              .map(category => (
                <div key={category._id} className="categories__card">
                  <div
                    className="categories__card-icon"
                    style={{ background: getCategoryColor(category) }}
                  >
                    <span>{getCategoryIcon(category)}</span>
                  </div>
                  <div className="categories__card-content">
                    <h3>{toProperCase(category.name)}</h3>
                    {category.description && typeof category.description === 'string' && (
                      <p>{category.description}</p>
                    )}
                  </div>
                  <Link to={`/categories/${category._id}`} className="categories__card-btn">
                    View Products
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
