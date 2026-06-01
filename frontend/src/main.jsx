import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import './index.css'
import './styles/notifications.css'
import App from './App.jsx'
import { NotificationProvider } from './context/NotificationContext'

// Configure axios defaults with runtime URL detection
axios.defaults.baseURL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://dumy-2-mli2.onrender.com';

console.log('🔧 Axios baseURL set to:', axios.defaults.baseURL);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
)
