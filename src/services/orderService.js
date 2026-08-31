import { db } from './firebase'
import { ref, get, set, update, push, child } from 'firebase/database'

const ORDERS_PATH = 'orders'

export const orderService = {
  // Get all orders (admin)
  async getAllOrders() {
    try {
      const ordersRef = ref(db, ORDERS_PATH)
      const snapshot = await get(ordersRef)

      if (!snapshot.exists()) {
        return []
      }

      const ordersData = snapshot.val()
      return Object.keys(ordersData)
        .map(id => ({
          id,
          ...ordersData[id]
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } catch (error) {
      console.error('Error fetching all orders:', error)
      throw error
    }
  },

  // Get user's orders
  async getUserOrders(userId) {
    try {
      const ordersRef = ref(db, ORDERS_PATH)
      const snapshot = await get(ordersRef)

      if (!snapshot.exists()) {
        return []
      }

      const ordersData = snapshot.val()
      return Object.keys(ordersData)
        .filter(id => ordersData[id].userId === userId)
        .map(id => ({
          id,
          ...ordersData[id]
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } catch (error) {
      console.error('Error fetching user orders:', error)
      throw error
    }
  },

  // Get single order
  async getOrder(orderId) {
    try {
      const orderRef = ref(db, `${ORDERS_PATH}/${orderId}`)
      const snapshot = await get(orderRef)

      if (!snapshot.exists()) {
        return null
      }

      return {
        id: orderId,
        ...snapshot.val()
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  },

  // Create order
  async createOrder(orderData) {
    try {
      const ordersRef = ref(db, ORDERS_PATH)
      const newOrderRef = push(ordersRef)
      const orderId = newOrderRef.key

      await set(newOrderRef, {
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      return orderId
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const orderRef = ref(db, `${ORDERS_PATH}/${orderId}`)

      await update(orderRef, {
        status,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  },

  // Update order
  async updateOrder(orderId, orderData) {
    try {
      const orderRef = ref(db, `${ORDERS_PATH}/${orderId}`)

      await update(orderRef, {
        ...orderData,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  },
}
