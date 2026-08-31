import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../styles/pages.css'

function OrderSuccessPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span>Order ID: {orderId}</span>
            <button
              onClick={handleCopyOrderId}
              className="btn-copy"
              title="Copy Order ID"
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all var(--transition-normal)',
              }}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
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
