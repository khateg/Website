import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ProductProvider } from "./context/ProductContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

// Customer pages
import HomePage from "./pages/customer/HomePage";
import ProductDetailPage from "./pages/customer/ProductDetailPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import CheckoutProfilePage from "./pages/customer/CheckoutProfilePage";
import OrderSuccessPage from "./pages/customer/OrderSuccessPage";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import LoginPage from "./pages/customer/LoginPage";
import SignupPage from "./pages/customer/SignupPage";
import WishlistPage from "./pages/customer/WishlistPage";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCustomRequests from "./pages/admin/AdminCustomRequests";

// Layout
import CustomerLayout from "./components/layout/CustomerLayout";
import AdminLayout from "./components/layout/AdminLayout";

const ADMIN_EMAILS = [
  "khat.eg111@gmail.com",
  "omarttt50@gmail.com", // Test admin account
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("Current user email:", currentUser.email);
        console.log("Current user email length:", currentUser.email?.length);
        console.log("Admin emails:", ADMIN_EMAILS);

        const userEmail = currentUser.email?.toLowerCase().trim();
        const isAdminUser = ADMIN_EMAILS.some((email) => {
          const adminEmail = email.toLowerCase().trim();
          const match = userEmail === adminEmail;
          console.log(
            `Comparing "${userEmail}" (${userEmail?.length}) with "${adminEmail}" (${adminEmail.length}): ${match}`,
          );
          return match;
        });
        setIsAdmin(isAdminUser);
        console.log("Final is admin:", isAdminUser);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Redirect admin users after login
  useEffect(() => {
    if (
      user &&
      isAdmin &&
      (window.location.pathname === "/login" ||
        window.location.pathname === "/signup")
    ) {
      const timer = setTimeout(() => {
        console.log("Redirecting admin to /admin");
        window.location.href = "/admin";
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  isAdmin && user ? (
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/products" element={<AdminDashboard />} />
                        <Route path="/orders" element={<AdminDashboard />} />
                        <Route path="/customers" element={<AdminDashboard />} />
                        <Route path="/inventory" element={<AdminDashboard />} />
                        <Route
                          path="/custom-requests"
                          element={<AdminCustomRequests />}
                        />
                      </Routes>
                    </AdminLayout>
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />

              {/* Customer Routes */}
              <Route
                path="*"
                element={
                  <CustomerLayout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route
                        path="/product/:id"
                        element={<ProductDetailPage />}
                      />
                      <Route path="/cart" element={<CartPage />} />
                      <Route
                        path="/wishlist"
                        element={
                          user ? <WishlistPage /> : <Navigate to="/login" />
                        }
                      />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route
                        path="/checkout-profile"
                        element={<CheckoutProfilePage />}
                      />
                      <Route
                        path="/order-success/:orderId"
                        element={<OrderSuccessPage />}
                      />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route
                        path="/dashboard"
                        element={
                          user ? (
                            <CustomerDashboard />
                          ) : (
                            <Navigate to="/login" />
                          )
                        }
                      />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </CustomerLayout>
                }
              />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </Router>
  );
}

export default App;
