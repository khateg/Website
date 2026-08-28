import { Link } from 'react-router-dom'
import { useProducts } from '../../context/ProductContext'
import '../styles/pages.css'

function HomePage() {
  const { products, loading, error } = useProducts()

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
                    <Link key={product.id} to={`/product/LE{product.id}`} className="product-card">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.name} />
                      )}
                      <div className="card-content">
                        <h3>{product.name}</h3>
                        <p className="category">{product.category}</p>
                        <p className="price">{product.price} LE</p>
                        <p className={`stock LE{product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                          {product.stock > 0 ? `In Stock (LE{product.stock})` : 'Out of Stock'}
                        </p>
                      </div>
                    </Link>
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
