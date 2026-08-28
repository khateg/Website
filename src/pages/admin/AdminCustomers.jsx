import { useEffect, useState } from 'react'
import { orderService } from '../../services/orderService'
import '../styles/pages.css'

function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const orders = await orderService.getAllOrders()

      // Aggregate customer data from orders
      const customerMap = {}
      orders.forEach(order => {
        if (order.userId) {
          if (!customerMap[order.userId]) {
            customerMap[order.userId] = {
              userId: order.userId,
              email: order.customerEmail,
              totalOrders: 0,
              totalSpent: 0,
              lastOrder: null,
            }
          }
          customerMap[order.userId].totalOrders += 1
          customerMap[order.userId].totalSpent += order.total || 0
          if (!customerMap[order.userId].lastOrder ||
              new Date(order.createdAt?.toDate()) > new Date(customerMap[order.userId].lastOrder)) {
            customerMap[order.userId].lastOrder = order.createdAt?.toDate()
          }
        }
      })

      setCustomers(Object.values(customerMap))
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-customers">
      <h2>Customer Management</h2>

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p>No customers yet</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.userId}>
                <td>{customer.email}</td>
                <td>{customer.totalOrders}</td>
                <td>${customer.totalSpent.toFixed(2)}</td>
                <td>
                  {customer.lastOrder
                    ? new Date(customer.lastOrder).toLocaleDateString()
                    : 'N/A'
                  }
                </td>
                <td>
                  <button className="btn-secondary">View Orders</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminCustomers
