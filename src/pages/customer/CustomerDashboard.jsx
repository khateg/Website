import { useEffect, useState } from 'react'
import { auth } from '../../services/firebase'
import { orderService } from '../../services/orderService'
import '../styles/pages.css'

function CustomerDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const currentUser = auth.currentUser
    if (currentUser) {
      setUser(currentUser)
      loadOrders(currentUser.uid)
    }
  }, [])

  const loadOrders = async (userId) => {
    try {
      setLoading(true)
      const data = await orderService.getUserOrders(userId)
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="customer-dashboard">
      <div className="container">
        <h1>My Dashboard</h1>

        {user && (
          <div className="user-info">
            <h2>Welcome, {user.email}!</h2>
            <p>Email: {user.email}</p>
          </div>
        )}

        <div className="dashboard-section">
          <h2>My Orders</h2>

          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>You haven't placed any orders yet.</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{new Date(order.createdAt?.toDate()).toLocaleDateString()}</td>
                    <td>${order.total}</td>
                    <td><span className={`status ${order.status}`}>{order.status}</span></td>
                    <td><button className="btn-secondary">View Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
