// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = `${API_BASE_URL}/api`;

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // If endpoint starts with /api, use base URL
  if (endpoint.startsWith('/api')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  // Otherwise, add /api prefix
  return `${API_URL}${endpoint}`;
};

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

export default {
  API_BASE_URL,
  API_URL,
  getApiUrl,
  getImageUrl
};
