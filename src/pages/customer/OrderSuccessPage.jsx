import { useParams, useNavigate } from 'react-router-dom'
import '../styles/pages.css'

function OrderSuccessPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="order-success-page">
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p>
          Thank you for your order. Your order has been received and will be
          processed shortly.
        </p>

        <div className="order-id">
          Order ID: {orderId}
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-dark)' }}>
          You will receive an SMS confirmation at your registered phone number.
          You can track your order from your dashboard.
        </p>

        <div className="success-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            View Orders
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
