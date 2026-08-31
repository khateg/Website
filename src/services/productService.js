import { db } from './firebase'
import { ref, get, set, update, remove, child } from 'firebase/database'

const PRODUCTS_PATH = 'products'

export const productService = {
  // Get all products
  async getAllProducts() {
    try {
      const productsRef = ref(db, PRODUCTS_PATH)
      const snapshot = await get(productsRef)

      if (!snapshot.exists()) {
        return []
      }

      const productsData = snapshot.val()
      return Object.keys(productsData).map(id => ({
        id,
        ...productsData[id]
      }))
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  // Get single product
  async getProduct(productId) {
    try {
      const productRef = ref(db, `${PRODUCTS_PATH}/${productId}`)
      const snapshot = await get(productRef)

      if (!snapshot.exists()) {
        return null
      }

      return {
        id: productId,
        ...snapshot.val()
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  },

  // Add new product
  async addProduct(productData) {
    try {
      const newId = Math.random().toString(36).substr(2, 9)
      const productRef = ref(db, `${PRODUCTS_PATH}/${newId}`)

      await set(productRef, {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      return newId
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  },

  // Update product
  async updateProduct(productId, productData) {
    try {
      const productRef = ref(db, `${PRODUCTS_PATH}/${productId}`)

      await update(productRef, {
        ...productData,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  // Delete product
  async deleteProduct(productId) {
    try {
      const productRef = ref(db, `${PRODUCTS_PATH}/${productId}`)
      await remove(productRef)
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  },

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const products = await this.getAllProducts()
      return products.filter(product => product.category === category)
    } catch (error) {
      console.error('Error fetching products by category:', error)
      throw error
    }
  },

  // Update product stock
  async updateProductStock(productId, newStock) {
    try {
      const productRef = ref(db, `${PRODUCTS_PATH}/${productId}`)
      await update(productRef, {
        stock: newStock,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating stock:', error)
      throw error
    }
  },
}
