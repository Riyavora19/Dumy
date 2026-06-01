// Centralized API configuration
export const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://dumy-2-mli2.onrender.com/api';

export const BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://dumy-2-mli2.onrender.com';

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

export default API_URL;
