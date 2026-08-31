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
              email: order.customerInfo?.email || order.customerEmail || 'Unknown',
              name: order.customerInfo?.name || 'Unknown',
              phone: order.customerInfo?.phone || 'N/A',
              totalOrders: 0,
              totalSpent: 0,
            }
          }
          customerMap[order.userId].totalOrders += 1
          if (order.status === 'delivered') {
            customerMap[order.userId].totalSpent += order.totalAmount || 0
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
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.userId}>
                <td>{customer.name}</td>
                <td><a href={`mailto:${customer.email}`}>{customer.email}</a></td>
                <td><a href={`tel:${customer.phone}`}>{customer.phone}</a></td>
                <td>{customer.totalOrders}</td>
                <td>{customer.totalSpent.toFixed(2)} LE</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminCustomers
