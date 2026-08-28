import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { auth } from './services/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { ProductProvider } from './context/ProductContext'
import { CartProvider } from './context/CartContext'

// Customer pages
import HomePage from './pages/customer/HomePage'
import ProductDetailPage from './pages/customer/ProductDetailPage'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import OrderSuccessPage from './pages/customer/OrderSuccessPage'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import LoginPage from './pages/customer/LoginPage'
import SignupPage from './pages/customer/SignupPage'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

// Layout
import CustomerLayout from './components/layout/CustomerLayout'
import AdminLayout from './components/layout/AdminLayout'

const ADMIN_EMAIL = 'khat.eg111@gmail.com'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        setIsAdmin(currentUser.email === ADMIN_EMAIL)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <Router>
      <ProductProvider>
        <CartProvider>
          <Routes>
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          isAdmin && user ? (
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
              </Routes>
            </AdminLayout>
          ) : (
            <AdminLogin />
          )
        } />

        {/* Customer Routes */}
        <Route path="*" element={
          <CustomerLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={user ? <CustomerDashboard /> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </CustomerLayout>
        } />
      </Routes>
        </CartProvider>
      </ProductProvider>
    </Router>
  )
}

export default App
