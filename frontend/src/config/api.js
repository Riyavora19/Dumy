// Centralized API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_URL = API_BASE_URL;
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  VERIFY: `${API_BASE_URL}/api/auth/verify`,
  
  // Users
  USER_LOGIN: `${API_BASE_URL}/api/users/login`,
  USER_REGISTER: `${API_BASE_URL}/api/users/register`,
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
  USER_CHANGE_PASSWORD: `${API_BASE_URL}/api/users/change-password`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/users/forgot-password`,
  RESET_PASSWORD: (token) => `${API_BASE_URL}/api/users/reset-password/${token}`,
  
  // Categories
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  CATEGORIES_ACTIVE: `${API_BASE_URL}/api/categories/active`,
  CATEGORY_BY_ID: (id) => `${API_BASE_URL}/api/categories/${id}`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCTS_BY_CATEGORY: (categoryId) => `${API_BASE_URL}/api/products/category/${categoryId}`,
  PRODUCTS_VARIANTS: (categoryId, productName) => `${API_BASE_URL}/api/products/variants/${categoryId}/${encodeURIComponent(productName)}`,
  PRODUCTS_SEARCH: (query) => `${API_BASE_URL}/api/products/search/${query}`,
  
  // Inquiries
  INQUIRIES: `${API_BASE_URL}/api/inquiries`,
  
  // Reviews
  REVIEWS_BY_PRODUCT: (productId) => `${API_BASE_URL}/api/reviews/product/${productId}`,
  REVIEWS: `${API_BASE_URL}/api/reviews`,
  REVIEW_HELPFUL: (reviewId) => `${API_BASE_URL}/api/reviews/${reviewId}/helpful`,
  
  // Contacts
  CONTACTS: `${API_BASE_URL}/api/contacts`,
  CONTACT_BY_ID: (id) => `${API_BASE_URL}/api/contacts/${id}`,
  CONTACT_STATS: (id) => `${API_BASE_URL}/api/contacts/${id}/stats`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDERS_BY_CUSTOMER: (id) => `${API_BASE_URL}/api/orders/customer/${id}`,
  
  // Budget Plans
  BUDGET_PLANS: `${API_BASE_URL}/api/budget-plans`,
  
  // Company Settings
  COMPANY_SETTINGS: `${API_BASE_URL}/api/company-settings`,
  
  // Room Templates
  ROOM_TEMPLATES: `${API_BASE_URL}/api/room-templates`,
  
  // Item Types
  ITEM_TYPES: `${API_BASE_URL}/api/item-types`,
  
  // Clients
  CLIENTS: `${API_BASE_URL}/api/clients`,
  
  // Companies
  COMPANIES: `${API_BASE_URL}/api/companies`,
  
  // Live Requests
  LIVE_REQUESTS: `${API_BASE_URL}/api/live-requests`,
};

// Helper function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

export default API_URL;
