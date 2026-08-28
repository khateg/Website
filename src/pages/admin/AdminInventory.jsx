import { useEffect, useState } from 'react'
import { productService } from '../../services/productService'
import '../styles/pages.css'

function AdminInventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStockUpdate = async (productId, newStock) => {
    try {
      setUpdating(productId)
      await productService.updateProduct(productId, { stock: newStock })
      loadProducts()
    } catch (error) {
      console.error('Failed to update stock:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="admin-inventory">
      <h2>Inventory Management</h2>

      {loading ? (
        <p>Loading inventory...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Price</th>
              <th>Update Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>
                  <span className={product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-stock'}>
                    {product.stock}
                  </span>
                </td>
                <td>${product.price}</td>
                <td>
                  <div className="stock-update">
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => {
                        const newStock = parseInt(e.target.value)
                        setProducts(products.map(p =>
                          p.id === product.id ? { ...p, stock: newStock } : p
                        ))
                      }}
                      min="0"
                    />
                    <button
                      onClick={() => handleStockUpdate(product.id, product.stock)}
                      disabled={updating === product.id}
                      className="btn-success"
                    >
                      {updating === product.id ? 'Saving...' : 'Update'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminInventory
