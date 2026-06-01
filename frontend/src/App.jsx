import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import StaffLogin from './pages/StaffLogin'
import StaffDashboard from './pages/StaffDashboard'
import About from './pages/About'
import Categories from './pages/Categories'
import CategoryProducts from './pages/CategoryProducts'
import ProductVariants from './pages/ProductVariants'
import Cart from './pages/Cart'
import './App.css'

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStaffRoute = location.pathname.startsWith('/staff');

  return (
    <CartProvider>
      {!isAdminRoute && !isStaffRoute && <Navbar />}
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/about"      element={<About />} />
        <Route path="/contact"    element={<Contact />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/categories/:categoryId" element={<CategoryProducts />} />
        <Route path="/categories/:categoryId/company/:companyName" element={<ProductVariants />} />
        <Route path="/products/:categoryId/:itemTypeId" element={<ProductVariants />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute type="admin">
            <Admin />
          </ProtectedRoute>
        } />
        
        {/* Staff Routes - Redirect to unified login */}
        <Route path="/staff/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/staff" element={
          <ProtectedRoute type="staff">
            <StaffDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      {!isAdminRoute && !isStaffRoute && <Footer />}
      {!isAdminRoute && !isStaffRoute && <ChatWidget />}
    </CartProvider>
  )
}

export default App
