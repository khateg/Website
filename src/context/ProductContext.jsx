import { createContext, useState, useContext, useEffect, useRef } from 'react'
import { productService } from '../services/productService'

const ProductContext = createContext()

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadProducts()
      hasLoadedRef.current = true
    }
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getAllProducts()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const refreshProducts = async () => {
    await loadProducts()
  }

  return (
    <ProductContext.Provider value={{ products, loading, error, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider')
  }
  return context
}
