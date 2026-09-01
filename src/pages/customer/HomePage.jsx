import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProducts } from '../../context/ProductContext'
import { useCart } from '../../context/CartContext'
import { getAvailableStock } from '../../utils/inventoryUtils'
import '../styles/pages.css'

function ImageCarousel({ images, imageUrl, productName }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Handle both old imageUrl and new images array
  const displayImages = images && images.length > 0 ? images : (imageUrl ? [imageUrl] : [null])
  const hasMultipleImages = displayImages.length > 1

  useEffect(() => {
    if (!hasMultipleImages) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [displayImages.length, hasMultipleImages])

  return (
    <div className="image-carousel">
      {displayImages[currentIndex] ? (
        <img src={displayImages[currentIndex]} alt={productName} />
      ) : (
        <div className="image-placeholder">📸</div>
      )}
      {hasMultipleImages && (
        <div className="image-counter">
          {currentIndex + 1}/{displayImages.length}
        </div>
      )}
    </div>
  )
}

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
  const searchParams = new URLSearchParams(window.location.search)
  const searchQuery = searchParams.get('search') || ''

  const filteredProducts = searchQuery
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products

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
          <div className="section-header-with-button">
            <h2>{searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Products'}</h2>
            {searchQuery && (
              <Link to="/" className="btn-back-to-all">
                Return to All Products
              </Link>
            )}
          </div>
          {loading && <div className="loading">Loading products...</div>}
          {error && <div className="error">{error}</div>}
          {!loading && !error && (
            <>
              {filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <p>{searchQuery ? 'No products found matching your search.' : 'No products available yet.'}</p>
                  <p>Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-3">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <Link to={`/product/${product.id}`} className="card-link">
                        <div className="product-image-container">
                          <ImageCarousel
                            images={product.images}
                            imageUrl={product.imageUrl}
                            productName={product.name}
                          />
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
