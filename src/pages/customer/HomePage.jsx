import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProducts } from '../../context/ProductContext'
import { useCart } from '../../context/CartContext'
import { getAvailableStock } from '../../utils/inventoryUtils'
import '../styles/pages.css'

function ProductCardActions({ product, addToCart, cartItems }) {
  const [quantity, setQuantity] = useState(1)
  const availableStock = getAvailableStock(product, cartItems)

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setQuantity(1)
  }

  const handleIncrement = () => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="card-actions">
      <div className="quantity-control">
        <button onClick={handleDecrement} className="qty-btn" disabled={quantity === 1}>−</button>
        <span className="qty-value">{quantity}</span>
        <button onClick={handleIncrement} className="qty-btn" disabled={quantity === availableStock}>+</button>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={availableStock === 0}
        className="btn-add-to-cart"
      >
        Add to Cart
      </button>
    </div>
  )
}

function HomePage() {
  const { products, loading, error } = useProducts()
  const { addToCart, cartItems } = useCart()
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Khat</h1>
          <p>Premium Print-on-Demand Products</p>
        </div>
      </section>

      <section className="shop-section">
        <div className="container">
          <h2>Featured Products</h2>
          {loading && <div className="loading">Loading products...</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && (
            <>
              {products.length === 0 ? (
                <div className="empty-state">
                  <p>No products available yet.</p>
                  <p>Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-3">
                  {products.map(product => (
                    <div key={product.id} className="product-card">
                      <Link to={`/product/${product.id}`} className="card-link">
                        <div className="product-image-container">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                          ) : (
                            <div className="image-placeholder">📸</div>
                          )}
                        </div>
                        <div className="card-content">
                          <h3>{product.name}</h3>
                          <p className="category">{product.category}</p>
                          <p className="price">{product.price} LE</p>
                          {getAvailableStock(product, cartItems) === 0 ? (
                            <p className="stock out-stock">Out of Stock</p>
                          ) : getAvailableStock(product, cartItems) <= 5 ? (
                            <p className="stock low-stock">Only {getAvailableStock(product, cartItems)} left</p>
                          ) : null}
                        </div>
                      </Link>
                      <ProductCardActions product={product} addToCart={addToCart} cartItems={cartItems} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage
