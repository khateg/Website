import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../services/firebase'
import { signOut } from 'firebase/auth'
import '../styles/admin-layout.css'

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>KHAT Admin</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/" className="nav-item">
            <span>📊 Dashboard</span>
          </Link>
          <Link to="/admin/products" className="nav-item">
            <span>📦 Products</span>
          </Link>
          <Link to="/admin/orders" className="nav-item">
            <span>📋 Orders</span>
          </Link>
          <Link to="/admin/customers" className="nav-item">
            <span>👥 Customers</span>
          </Link>
          <Link to="/admin/inventory" className="nav-item">
            <span>📈 Inventory</span>
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
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
