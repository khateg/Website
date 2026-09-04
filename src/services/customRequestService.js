import { db } from './firebase'
import { ref, get, set, update, remove, child } from 'firebase/database'

const CUSTOM_REQUESTS_PATH = 'customRequests'

export const customRequestService = {
  async submitCustomRequest(customData) {
    try {
      const newId = Math.random().toString(36).substr(2, 9)
      const customRef = ref(db, `${CUSTOM_REQUESTS_PATH}/${newId}`)

      await set(customRef, {
        ...customData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })

      return newId
    } catch (error) {
      console.error('Error submitting custom request:', error)
      throw error
    }
  },

  async getAllCustomRequests() {
    try {
      const customRef = ref(db, CUSTOM_REQUESTS_PATH)
      const snapshot = await get(customRef)

      if (!snapshot.exists()) {
        return []
      }

      const customData = snapshot.val()
      return Object.keys(customData).map(id => ({
        id,
        ...customData[id]
      }))
    } catch (error) {
      console.error('Error fetching custom requests:', error)
      throw error
    }
  },

  async updateCustomRequestStatus(requestId, status) {
    try {
      const customRef = ref(db, `${CUSTOM_REQUESTS_PATH}/${requestId}`)
      await update(customRef, {
        status: status,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating custom request:', error)
      throw error
    }
  },

  async deleteCustomRequest(requestId) {
    try {
      const customRef = ref(db, `${CUSTOM_REQUESTS_PATH}/${requestId}`)
      await remove(customRef)
    } catch (error) {
      console.error('Error deleting custom request:', error)
      throw error
    }
  },

  async getCustomRequestsByEmail(email) {
    try {
      const customRef = ref(db, CUSTOM_REQUESTS_PATH)
      const snapshot = await get(customRef)

      if (!snapshot.exists()) {
        return []
      }

      const customData = snapshot.val()
      const allRequests = Object.keys(customData).map(id => ({
        id,
        ...customData[id]
      }))

      return allRequests.filter(request => request.customerEmail === email)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } catch (error) {
      console.error('Error fetching custom requests by email:', error)
      throw error
    }
  },

  async updateCustomRequestPrice(requestId, price) {
    try {
      const customRef = ref(db, `${CUSTOM_REQUESTS_PATH}/${requestId}`)
      await update(customRef, {
        price: price,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating custom request price:', error)
      throw error
    }
  },
}
