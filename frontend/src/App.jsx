import { Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import UserLogin from './pages/UserLogin'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import UserProfile from './pages/UserProfile'
import Categories from './pages/Categories'
import CategoryProducts from './pages/CategoryProducts'
import ProductVariants from './pages/ProductVariants'
import Cart from './pages/Cart'
import About from './pages/About'
import BudgetPlanner from './pages/BudgetPlanner'
import BudgetBuilder from './pages/BudgetBuilder'
import MyBudgetPlans from './pages/MyBudgetPlans'
import RequestQuote from './pages/RequestQuote'
import './App.css'

// Placeholder pages
const Catalogus  = () => <main className="page"><h1>Catalogus</h1></main>

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/forgot-password'].includes(location.pathname) || 
                      location.pathname.startsWith('/reset-password');

  return (
    <CartProvider>
      {!isAdminRoute && !isAuthRoute && <Navbar />}
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/login"      element={<UserLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/about"      element={<About />} />
        
        {/* Protected Routes - Require Login */}
        <Route path="/profile"    element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/categories/:categoryId" element={<ProtectedRoute><CategoryProducts /></ProtectedRoute>} />
        <Route path="/categories/:categoryId/company/:companyName" element={<ProtectedRoute><ProductVariants /></ProtectedRoute>} />
        <Route path="/categories/:categoryId/:productName" element={<ProtectedRoute><ProductVariants /></ProtectedRoute>} />
        <Route path="/catalogus"  element={<ProtectedRoute><Catalogus /></ProtectedRoute>} />
        <Route path="/contact"    element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        <Route path="/cart"       element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/budget-planner" element={<ProtectedRoute><BudgetPlanner /></ProtectedRoute>} />
        <Route path="/budget-planner/:templateId" element={<ProtectedRoute><BudgetBuilder /></ProtectedRoute>} />
        <Route path="/my-budget-plans" element={<ProtectedRoute><MyBudgetPlans /></ProtectedRoute>} />
        <Route path="/request-quote" element={<ProtectedRoute><RequestQuote /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin"      element={<Admin />} />
      </Routes>
      {!isAdminRoute && !isAuthRoute && <Footer />}
    </CartProvider>
  )
}

export default App
