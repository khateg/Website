import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../services/firebase'
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'
import { useCart } from '../../context/CartContext'
import '../styles/pages.css'

function CheckoutPage() {
  const navigate = useNavigate()
  const { cartItems, getTotalPrice, clearCart } = useCart()

  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        // Not signed in, redirect to signup
        navigate('/signup', { state: { returnTo: '/checkout' }, replace: true })
        return
      }

      setUser(currentUser)

      // Fetch user profile from Firestore
      try {
        const userDocRef = doc(db, 'users', currentUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || ''
          })
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
      }
    })

    return unsubscribe
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty')
      setLoading(false)
      return
    }

    try {
      // Create order
      const orderData = {
        userId: user.uid,
        customerInfo: formData,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        totalAmount: getTotalPrice(),
        status: 'pending',
        paymentMethod: 'COD',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save order to Firestore
      const ordersRef = collection(db, 'orders')
      const docRef = await addDoc(ordersRef, orderData)

      // Clear cart
      clearCart()

      // Redirect to success page
      navigate(`/order-success/${docRef.id}`, { replace: true })
    } catch (err) {
      setError('Failed to place order. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-content">
          <div className="checkout-form">
            <h1>Order Summary</h1>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Delivery Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your delivery address"
                />
              </div>

              <button
                type="submit"
                className="btn-primary full-width"
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order (COD)'}
              </button>
            </form>
          </div>

          <div className="checkout-summary">
            <h2>Cart Summary</h2>
            <div className="order-items">
              {cartItems.map(item => (
                <div key={item.id} className="order-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="order-total">
              <strong>Total: ${getTotalPrice().toFixed(2)}</strong>
            </div>
            <p className="payment-method">Payment Method: Cash on Delivery</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
