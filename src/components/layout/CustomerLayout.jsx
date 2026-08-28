import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../services/firebase'
import { signOut } from 'firebase/auth'
import { FiShoppingCart } from 'react-icons/fi'
import { MdShoppingCart } from 'react-icons/md'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import logo from '../../assets/logo.png'
import '../styles/layout.css'

function CustomerLayout({ children }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })
    return unsubscribe
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  return (
    <div className="customer-layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">
            <img src={logo} alt="Khat Logo" className="logo-img" />
            <span className="logo-text">KHAT</span>
          </Link>

          <ul className="nav-links">
            <li className="cart-options">
              <Link to="/cart" className="cart-link-feather">
                <FiShoppingCart size={20} /> Cart
              </Link>
            </li>
            {user ? (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
              </>
            ) : (
              <li><Link to="/login">Login</Link></li>
            )}
          </ul>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-left">
            <h4>Contact Us</h4>
            <a href="mailto:khat.eg111@gmail.com">khat.eg111@gmail.com</a>
            <a href="tel:+201001234567">+201001234567</a>
          </div>
          <div className="footer-right">
            <h4>Follow Us</h4>
            <a href="https://instagram.com/khat" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://tiktok.com/@khat" target="_blank" rel="noopener noreferrer">TikTok</a>
          </div>
        </div>
        <div className="footer-center">
          <p>&copy; 2026 Khat - Print on Demand Brand - All rights reserved</p>
        </div>
      </footer>
    </div>
  )
}

export default CustomerLayout
