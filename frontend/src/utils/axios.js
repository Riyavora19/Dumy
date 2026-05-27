import axios from 'axios';

// Get API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dumy-2-mli2.onrender.com';

// Debug log to verify environment variable
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 VITE_API_URL from env:', import.meta.env.VITE_API_URL);

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export both the instance and the base URL
export { API_BASE_URL };
export default axiosInstance;
