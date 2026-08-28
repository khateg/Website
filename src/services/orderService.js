import { db } from './firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'

const ORDERS_COLLECTION = 'orders'

export const orderService = {
  // Get all orders (admin)
  async getAllOrders() {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  },

  // Get user's orders
  async getUserOrders(userId) {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  },

  // Get single order
  async getOrder(orderId) {
    const docRef = doc(db, ORDERS_COLLECTION, orderId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  },

  // Create order
  async createOrder(orderData) {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      status: 'pending', // pending, processing, shipped, delivered, cancelled
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    const docRef = doc(db, ORDERS_COLLECTION, orderId)
    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    })
  },

  // Update order
  async updateOrder(orderId, orderData) {
    const docRef = doc(db, ORDERS_COLLECTION, orderId)
    await updateDoc(docRef, {
      ...orderData,
      updatedAt: new Date(),
    })
  },
}
