import { db } from './firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore'

const PRODUCTS_COLLECTION = 'products'

export const productService = {
  // Get all products
  async getAllProducts() {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  },

  // Get single product
  async getProduct(productId) {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  },

  // Add new product
  async addProduct(productData) {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  },

  // Update product
  async updateProduct(productId, productData) {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId)
    await updateDoc(docRef, {
      ...productData,
      updatedAt: new Date(),
    })
  },

  // Delete product
  async deleteProduct(productId) {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId)
    await deleteDoc(docRef)
  },

  // Get products by category
  async getProductsByCategory(category) {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('category', '==', category)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  },
}
