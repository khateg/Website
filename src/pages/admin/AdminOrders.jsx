import { useEffect, useState } from "react";
import { orderService } from "../../services/orderService";
import { ORDER_STATUS } from "../../utils/constants";
import { formatDate, formatDateTime } from "../../utils/dateUtils";
import "../styles/pages.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const order = orders.find((item) => item.id === orderId);
      const shouldSendShippedEmail =
        newStatus === "shipped" && order?.status !== "shipped";

      await orderService.updateOrderStatus(orderId, newStatus);

      if (shouldSendShippedEmail && order) {
        const emailResponse = await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...order,
            orderId,
            status: "shipped",
            notificationType: "shipped",
          }),
        });

        if (!emailResponse.ok) {
          const details = await emailResponse.text();
          console.error(
            "Order was marked shipped, but the shipment email failed:",
            details,
          );
        }
      }

      loadOrders();
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

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
              <th>Customer Name</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  {order.customerInfo?.name ||
                    order.customerName ||
                    order.customerEmail?.split("@")[0] ||
                    "N/A"}
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.totalAmount || order.total} LE</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className={`status-select ${order.status}`}
                  >
                    {Object.values(ORDER_STATUS).map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    onClick={() =>
                      setSelectedOrder(
                        selectedOrder?.id === order.id ? null : order,
                      )
                    }
                    className="btn-secondary"
                  >
                    {selectedOrder?.id === order.id ? "Hide" : "View"} Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button
                className="modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Order ID:</strong> {selectedOrder.id}
              </p>
              <p>
                <strong>Customer Name:</strong>{" "}
                {selectedOrder.customerInfo?.name ||
                  selectedOrder.customerName ||
                  selectedOrder.customerEmail?.split("@")[0] ||
                  "N/A"}
              </p>
              <p>
                <strong>Customer Email:</strong>{" "}
                <a
                  href={`mailto:${selectedOrder.customerInfo?.email || selectedOrder.customerEmail}`}
                >
                  {selectedOrder.customerInfo?.email ||
                    selectedOrder.customerEmail}
                </a>
              </p>
              {selectedOrder.customerInfo?.phone && (
                <p>
                  <strong>Phone Number:</strong>{" "}
                  <a href={`tel:${selectedOrder.customerInfo?.phone}`}>
                    {selectedOrder.customerInfo?.phone}
                  </a>
                </p>
              )}
              <p>
                <strong>Total:</strong>{" "}
                {selectedOrder.totalAmount || selectedOrder.total} LE
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status ${selectedOrder.status}`}>
                  {selectedOrder.status}
                </span>
              </p>
              <p>
                <strong>Date:</strong> {formatDateTime(selectedOrder.createdAt)}
              </p>

              <h4>Items:</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <ul>
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} x {item.quantity} ={" "}
                      {(item.price * item.quantity).toFixed(2)} LE
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No items recorded</p>
              )}

              <h4>Delivery Address:</h4>
              <p>{selectedOrder.customerInfo?.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
