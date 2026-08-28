import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { useCart } from '../../context/CartContext'
import '../styles/pages.css'

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>
  if (!product) return <div className="error">Product not found</div>

  return (
    <div className="product-detail-page">
      <div className="container">
        <button onClick={() => navigate('/')} className="back-btn">
          ← Back to Shop
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
            <h1>{product.name}</h1>
            <p className="category">{product.category}</p>
            <p className="description">{product.description}</p>

            <div className="product-meta">
              <div className="price">{product.price} LE</div>
              <div className={`stock LE{product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                {product.stock > 0 ? `LE{product.stock} in stock` : 'Out of stock'}
              </div>
            </div>

            {product.stock > 0 && (
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                </div>

                <button
                  className="btn-primary add-to-cart-btn"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
