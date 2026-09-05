import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase";
import { signOut } from "firebase/auth";
import { FiShoppingCart } from "react-icons/fi";
import { FiHeart } from "react-icons/fi";
import { MdShoppingCart } from "react-icons/md";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { BiSearch } from "react-icons/bi";
import { FiMail } from "react-icons/fi";
import { FiPhone } from "react-icons/fi";
import { FaInstagram, FaTiktok } from "react-icons/fa6";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import logo from "../../assets/logo.png";
import "../styles/layout.css";

function CustomerLayout({ children }) {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { cartItems, clearCart } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    clearCart();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <div className="customer-layout">
      <nav className="navbar">
        <div className="nav-container">
          <button
            type="button"
            className="mobile-search-toggle"
            onClick={() => setIsMobileSearchOpen((isOpen) => !isOpen)}
            aria-label="Search products"
            title="Search products"
          >
            <BiSearch size={22} />
          </button>

          <Link to="/" className="logo">
            <img src={logo} alt="Khat Logo" className="logo-img" />
          </Link>

          <form
            className={`search-form ${isMobileSearchOpen ? "is-open" : ""}`}
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <BiSearch size={20} />
            </button>
          </form>

          <ul className="nav-links">
            <li className="cart-options">
              <Link
                to="/cart"
                className="cart-link-feather"
                aria-label="Cart"
                title="Cart"
              >
                <div className="cart-icon-container">
                  <FiShoppingCart size={20} />
                  {cartItems.length > 0 && (
                    <span className="cart-badge">
                      {cartItems.reduce(
                        (total, item) => total + (item.quantity || 1),
                        0,
                      )}
                    </span>
                  )}
                </div>
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link
                    to="/wishlist"
                    className="wishlist-nav-link"
                    aria-label="Wishlist"
                    title="Wishlist"
                  >
                    <div className="cart-icon-container">
                      <FiHeart size={18} />
                      {wishlistItems.length > 0 && (
                        <span className="wishlist-badge">
                          {wishlistItems.length}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-left">
            <h4>Contact Us</h4>
            <a href="mailto:khat.eg111@gmail.com" className="footer-icon-link">
              <FiMail aria-hidden="true" />
              <span>khat.eg111@gmail.com</span>
            </a>
            {/* <a href="tel:+201001234567" className="footer-icon-link"><FiPhone aria-hidden="true" /><span>+201001234567</span></a> */}
          </div>
          <div className="footer-right">
            <h4>Follow Us</h4>
            <div className="footer-social-links">
              <a
                href="https://www.instagram.com/khat.eg1"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-icon-link"
                aria-label="Instagram"
                title="Instagram"
              >
                <FaInstagram aria-hidden="true" />
              </a>
              <a
                href="https://www.tiktok.com/@khat.eg1"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-icon-link"
                aria-label="TikTok"
                title="TikTok"
              >
                <FaTiktok aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-center">
          <p>&copy; 2026 Khat - Print on Demand Brand - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}

export default CustomerLayout;
