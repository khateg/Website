import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../context/ProductContext'
import { getAvailableStock } from '../../utils/inventoryUtils'
import '../styles/pages.css'

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, cartItems } = useCart()
  const { refreshProducts } = useProducts()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const availableStock = product ? getAvailableStock(product, cartItems) : 0

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const data = await productService.getProduct(id)
      if (!data) {
        setError('Product not found')
      } else {
        setProduct(data)
      }
    } catch (err) {
      setError('Failed to load product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setQuantity(1)
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>
  if (!product) return <div className="error">Product not found</div>

  return (
    <div className="product-detail-page">
      <button onClick={() => navigate('/')} className="back-btn">
        ← Back to Home
      </button>

      <div className="product-detail">
        <div className="product-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="placeholder">No image</div>
          )}
        </div>

        <div className="product-info">
          <div className="product-info-content">
            <h1>{product.name}</h1>
            <p className="category">{product.category}</p>
            <p className="description">{product.description}</p>
          </div>

          <div className="product-meta">
            <div className="price-section">
              {product.oldPrice && (
                <div className="old-price">
                  <s>{product.oldPrice} LE</s>
                </div>
              )}
              <div className="price">{product.price} LE</div>
            </div>
            {availableStock === 0 ? (
              <div className="stock out-stock">Out of Stock</div>
            ) : availableStock <= 5 ? (
              <div className="stock low-stock">Only {availableStock} left</div>
            ) : null}
          </div>
        </div>
      </div>

      {availableStock > 0 && (
        <div className="purchase-section">
          <div className="card-actions">
            <div className="quantity-control">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="qty-btn"
                disabled={quantity === 1}
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                className="qty-btn"
                disabled={quantity === availableStock}
              >
                +
              </button>
            </div>
            <button
              className="btn-add-to-cart"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetailPage
