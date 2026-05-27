import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Categories.css';

// Smart icon fallback based on category name - Returns SVG icons with light colors
const getCategoryIcon = (category) => {
  const name = (category.name || '').toLowerCase();
  
  // Faucet - Luxury basin mixer (light/white)
  if (name.includes('faucet') || name.includes('tap') || name.includes('mixer')) {
    return (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 35 L20 45 C20 48 22 50 25 50 L39 50 C42 50 44 48 44 45 L44 35" strokeWidth="2.5" opacity="0.9"/>
        <ellipse cx="32" cy="35" rx="12" ry="3" fill="white" opacity="0.3"/>
        <path d="M32 35 Q32 25, 42 20 L48 20" strokeWidth="2.5" opacity="0.9"/>
        <circle cx="50" cy="20" r="3" fill="white" opacity="0.9"/>
        <path d="M32 35 L32 15" strokeWidth="2" opacity="0.9"/>
        <circle cx="32" cy="12" r="4" fill="white" opacity="0.9"/>
        <path d="M28 12 L36 12" strokeWidth="2.5" stroke="rgba(0,0,0,0.2)"/>
        <rect x="26" y="33" width="12" height="4" rx="1" fill="white" opacity="0.4"/>
      </svg>
    );
  }
  
  // Accessories - Bathroom accessories set (light/white)
  if (name.includes('accessory') || name.includes('accessories')) {
    return (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="white">
        <rect x="10" y="15" width="20" height="3" rx="1.5" opacity="0.8"/>
        <circle cx="10" cy="16.5" r="2" fill="rgba(0,0,0,0.15)"/>
        <circle cx="30" cy="16.5" r="2" fill="rgba(0,0,0,0.15)"/>
        <rect x="38" y="12" width="8" height="12" rx="2" opacity="0.8"/>
        <rect x="40" y="10" width="4" height="3" rx="1" opacity="0.8"/>
        <circle cx="42" cy="18" r="1" fill="rgba(0,0,0,0.2)"/>
        <rect x="52" y="14" width="6" height="8" rx="1" opacity="0.8"/>
        <rect x="53.5" y="12" width="1" height="3" opacity="0.8"/>
        <rect x="56.5" y="12" width="1" height="3" opacity="0.8"/>
        <circle cx="20" cy="38" r="8" opacity="0.8" fill="none" stroke="white" strokeWidth="2"/>
        <circle cx="20" cy="38" r="5" opacity="0.4"/>
        <rect x="12" y="37" width="4" height="2" rx="1" opacity="0.8"/>
        <circle cx="45" cy="38" r="4" opacity="0.8"/>
        <path d="M45 38 L45 45" stroke="white" strokeWidth="2" opacity="0.8" fill="none"/>
        <circle cx="45" cy="47" r="2" opacity="0.8"/>
      </svg>
    );
  }
  
  // Tiles - Floor tile pattern (light/white)
  if (name.includes('tile') || name.includes('floor') || name.includes('wall')) {
    return (
      <svg width="80" height="80" viewBox="0 0 64 64" fill="white">
        <rect x="6" y="6" width="13" height="13" rx="1" opacity="0.8"/>
        <rect x="22" y="6" width="13" height="13" rx="1" opacity="0.6"/>
        <rect x="38" y="6" width="13" height="13" rx="1" opacity="0.8"/>
        <rect x="6" y="22" width="13" height="13" rx="1" opacity="0.6"/>
        <rect x="22" y="22" width="13" height="13" rx="1" opacity="0.8"/>
        <rect x="38" y="22" width="13" height="13" rx="1" opacity="0.6"/>
        <rect x="6" y="38" width="13" height="13" rx="1" opacity="0.8"/>
        <rect x="22" y="38" width="13" height="13" rx="1" opacity="0.6"/>
        <rect x="38" y="38" width="13" height="13" rx="1" opacity="0.8"/>
        <circle cx="12.5" cy="12.5" r="2" fill="rgba(0,0,0,0.15)"/>
        <circle cx="28.5" cy="12.5" r="2" fill="rgba(0,0,0,0.15)"/>
        <circle cx="44.5" cy="12.5" r="2" fill="rgba(0,0,0,0.15)"/>
        <circle cx="12.5" cy="28.5" r="2" fill="rgba(0,0,0,0.15)"/>
        <circle cx="28.5" cy="28.5" r="2" fill="rgba(0,0,0,0.15)"/>
        <circle cx="44.5" cy="28.5" r="2" fill="rgba(0,0,0,0.15)"/>
        <circle cx="12.5" cy="44.5" r="2" fill="rgba(0,0,0,0.15)"/>
        <circle cx="28.5" cy="44.5" r="2" fill="rgba(0,0,0,0.15)"/>
        <circle cx="44.5" cy="44.5" r="2" fill="rgba(0,0,0,0.15)"/>
        <line x1="19.5" y1="6" x2="19.5" y2="51" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
        <line x1="35.5" y1="6" x2="35.5" y2="51" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
        <line x1="6" y1="19.5" x2="51" y2="19.5" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
        <line x1="6" y1="35.5" x2="51" y2="35.5" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
      </svg>
    );
  }
  
  // Fallback emoji for other categories
  if (category.icon && category.icon !== '📦') return category.icon;
  if (name.includes('toilet') || name.includes('wc')) return '🚽';
  if (name.includes('shower') || name.includes('bath')) return '🚿';
  if (name.includes('basin') || name.includes('sink')) return '🪣';
  if (name.includes('mirror')) return '🪞';
  if (name.includes('kitchen')) return '🍳';
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
      const response = await axios.get('https://dumy-2-mli2.onrender.com/api/categories/active');
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
