import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import '../styles/pages.css'

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart()
  const [limitReached, setLimitReached] = useState(null)

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity > (item.stock || 999)) {
      setLimitReached(item.id)
      setTimeout(() => setLimitReached(null), 3000)
    } else {
      setLimitReached(null)
    }
    updateQuantity(item.id, newQuantity)
  }

  const handleRemove = (productId) => {
    removeFromCart(productId)
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.id}>
                    <td className="product-name">
                      <div>
                        {item.name}
                        {limitReached === item.id && (
                          <div className="stock-limit-warning">
                            ⚠️ Maximum stock available: {item.stock}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="product-price">{item.price.toFixed(2)} LE</td>
                    <td className="product-quantity">
                      <input
                        type="number"
                        min="1"
                        max={item.stock || 999}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item, parseInt(e.target.value))}
                      />
                    </td>
                    <td className="product-total">{(item.price * item.quantity).toFixed(2)} LE</td>
                    <td className="product-action">
                      <button
                        className="btn-remove"
                        onClick={() => handleRemove(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{getTotalPrice().toFixed(2)} LE</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>0.00 LE</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{getTotalPrice().toFixed(2)} LE</span>
              </div>
              <Link to="/checkout" className="btn-primary full-width">
                Proceed to Checkout
              </Link>
              <Link to="/" className="btn-secondary full-width" style={{ marginTop: '0.5rem' }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage
