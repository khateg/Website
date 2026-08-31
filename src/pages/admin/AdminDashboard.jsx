import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import { productService } from '../../services/productService'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminCustomers from './AdminCustomers'
import AdminInventory from './AdminInventory'
import '../styles/pages.css'

function AdminDashboard() {
  const location = useLocation()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const orders = await orderService.getAllOrders()
      const products = await productService.getAllProducts()

      const totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

      const uniqueCustomers = new Set(orders.map(o => o.userId)).size

      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: uniqueCustomers,
        totalRevenue,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const isProductsPage = location.pathname.includes('/products')
  const isOrdersPage = location.pathname.includes('/orders')
  const isCustomersPage = location.pathname.includes('/customers')
  const isInventoryPage = location.pathname.includes('/inventory')
  const isDashboard = !isProductsPage && !isOrdersPage && !isCustomersPage && !isInventoryPage

  if (loading && isDashboard) return <div className="loading">Loading dashboard...</div>

  if (isProductsPage) return <AdminProducts />
  if (isOrdersPage) return <AdminOrders />
  if (isCustomersPage) return <AdminCustomers />
  if (isInventoryPage) return <AdminInventory />

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Overview</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{stats.totalOrders}</div>
          <Link to="/admin/orders" className="stat-link">View Orders →</Link>
        </div>

        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-value">{stats.totalProducts}</div>
          <Link to="/admin/products" className="stat-link">Manage Products →</Link>
        </div>

        <div className="stat-card">
          <h3>Total Customers</h3>
          <div className="stat-value">{stats.totalCustomers}</div>
          <Link to="/admin/customers" className="stat-link">View Customers →</Link>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">{stats.totalRevenue.toFixed(2)} LE</div>
          <p className="stat-note">From completed orders</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
