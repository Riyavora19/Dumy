import axios from 'axios';

// Runtime API URL detection
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://dumy-2-mli2.onrender.com/api';

// Debug log to verify URL
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 Hostname:', window.location.hostname);

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
