import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { productService } from '../../services/productService'
import '../styles/pages.css'

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    category: '',
    stock: '',
    imageUrl: '',
  })

  useEffect(() => {
    console.log('AdminProducts mounted')
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      console.log('Loading products...')
      const data = await productService.getAllProducts()
      console.log('Products loaded:', data)
      setProducts(data)
      setError(null)
    } catch (err) {
      console.error('Failed to load products:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await productService.updateProduct(editingId, formData)
      } else {
        await productService.addProduct(formData)
      }
      loadProducts()
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await productService.deleteProduct(id)
        loadProducts()
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      oldPrice: '',
      category: '',
      stock: '',
      imageUrl: '',
    })
    setEditingId(null)
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice || '',
      category: product.category,
      stock: product.stock,
      imageUrl: product.imageUrl,
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  return (
    <div className="admin-products">
      <div className="section-header">
        <h2>Product Management</h2>
        <button
          className="btn-primary"
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                <option value="Notebooks">Notebooks</option>
                <option value="Wall Arts">Wall Arts</option>
                <option value="Stickers">Stickers</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label>Old Price (Optional)</label>
              <input
                type="number"
                step="0.01"
                value={formData.oldPrice}
                onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value ? parseFloat(e.target.value) : '' })}
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-group full-width">
              <label>Image URL (Cloudinary)</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://res.cloudinary.com/..."
              />
            </div>
          </div>

          <button type="submit" className="btn-success">
            {editingId ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products yet. Click "+ Add Product" to create one.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price (LE)</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <button
                    onClick={() => handleEdit(product)}
                    className="btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminProducts
