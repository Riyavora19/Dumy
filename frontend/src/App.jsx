import { Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
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
import BudgetPlanner from './pages/BudgetPlanner'
import MyBudgetPlans from './pages/MyBudgetPlans'
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
        <Route path="/budget-planner" element={<BudgetPlanner />} />
        <Route path="/my-budget-plans" element={<MyBudgetPlans />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute type="admin">
            <Admin />
          </ProtectedRoute>
        } />
        
        {/* Staff Routes */}
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff" element={
          <ProtectedRoute type="staff">
            <StaffDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      {!isAdminRoute && !isStaffRoute && <Footer />}
    </CartProvider>
  )
}

export default App
