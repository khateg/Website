import { useEffect, useState } from 'react'
import { orderService } from '../../services/orderService'
import { ORDER_STATUS } from '../../utils/constants'
import '../styles/pages.css'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await orderService.getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      loadOrders()
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  return (
    <div className="admin-orders">
      <h2>Order Management</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Email</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerEmail}</td>
                <td>{new Date(order.createdAt?.toDate()).toLocaleDateString()}</td>
                <td>${order.total?.toFixed(2)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`status-select ${order.status}`}
                  >
                    {Object.values(ORDER_STATUS).map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="btn-secondary"
                  >
                    {selectedOrder?.id === order.id ? 'Hide' : 'View'} Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <div className="order-details">
          <h3>Order Details</h3>
          <div className="details-content">
            <p><strong>Order ID:</strong> {selectedOrder.id}</p>
            <p><strong>Customer Email:</strong> {selectedOrder.customerEmail}</p>
            <p><strong>Total:</strong> ${selectedOrder.total?.toFixed(2)}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Date:</strong> {new Date(selectedOrder.createdAt?.toDate()).toLocaleString()}</p>

            <h4>Items:</h4>
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <ul>
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items recorded</p>
            )}

            <h4>Delivery Address:</h4>
            <p>
              {selectedOrder.shippingAddress?.street}<br />
              {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}<br />
              {selectedOrder.shippingAddress?.country}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders
