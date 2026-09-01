import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../services/firebase'
import { signOut } from 'firebase/auth'
import '../styles/admin-layout.css'

function AdminLayout({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      setSidebarOpen(!mobile)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>KHAT Admin</h2>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/" className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link to="/admin/products" className="nav-item">
            <span className="nav-icon">📦</span>
            <span className="nav-text">Products</span>
          </Link>
          <Link to="/admin/orders" className="nav-item">
            <span className="nav-icon">📋</span>
            <span className="nav-text">Orders</span>
          </Link>
          <Link to="/admin/customers" className="nav-item">
            <span className="nav-icon">👥</span>
            <span className="nav-text">Customers</span>
          </Link>
          <Link to="/admin/inventory" className="nav-item">
            <span className="nav-icon">📈</span>
            <span className="nav-text">Inventory</span>
          </Link>
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="menu-toggle">
            ☰
          </button>
          <h1>Admin Dashboard</h1>
          {sidebarOpen && isMobile && (
            <div
              className="sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
