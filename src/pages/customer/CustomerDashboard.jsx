import { useEffect, useState } from 'react'
import { auth, db } from '../../services/firebase'
import { ref, get, set } from 'firebase/database'
import { orderService } from '../../services/orderService'
import { formatDate, formatDateTime } from '../../utils/dateUtils'
import '../styles/pages.css'

function CustomerDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        loadUserProfile(currentUser.uid)
        loadOrders(currentUser.uid)
      } else {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const userRef = ref(db, `users/${userId}`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        const data = snapshot.val()
        setProfileData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || ''
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const loadOrders = async (userId) => {
    try {
      setLoading(true)
      const data = await orderService.getUserOrders(userId)
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSaveSuccess('')
    setIsSaving(true)

    try {
      const userRef = ref(db, `users/${user.uid}`)

      const userData = {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        email: user.email,
        updatedAt: new Date().toISOString()
      }

      // Try to get existing user
      const snapshot = await get(userRef)

      if (!snapshot.exists()) {
        // Create new user
        userData.createdAt = new Date().toISOString()
      }

      // Save/update user
      await set(userRef, userData)

      setSaveSuccess('Profile saved successfully!')
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setError(`Failed to save profile: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const getDisplayName = () => {
    if (profileData.name) return profileData.name
    return user.email.split('@')[0]
  }

  return (
    <div className="customer-dashboard">
      <div className="container">
        <h1>My Dashboard</h1>

        {user && (
          <div className="user-info">
            <div className="user-header">
              <div>
                <h2>Welcome, {getDisplayName()}!</h2>
                <p>Email: {user.email}</p>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing && (
              <form onSubmit={handleSaveProfile} className="profile-form">
                {saveError && <div className="error">{saveError}</div>}
                {saveSuccess && <div className="success">{saveSuccess}</div>}

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    placeholder="Enter your delivery address"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {!isEditing && (
              <div className="profile-display">
                <p><strong>Name:</strong> {profileData.name || 'Not provided'}</p>
                <p><strong>Phone:</strong> {profileData.phone || 'Not provided'}</p>
                <p><strong>Address:</strong> {profileData.address || 'Not provided'}</p>
              </div>
            )}
          </div>
        )}

        <div className="dashboard-section">
          <h2>My Orders</h2>

          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>You haven't placed any orders yet.</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.totalAmount} LE</td>
                    <td><span className={`status ${order.status}`}>{order.status}</span></td>
                    <td><button
                      className="btn-secondary"
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      style={{ padding: '0.5rem 0.8rem', fontSize: '0.9rem' }}
                    >
                      {selectedOrder?.id === order.id ? 'Hide' : 'View'} Details
                    </button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Order Details</h3>
                <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
              </div>
              <div className="modal-body">
                <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                <p><strong>Date:</strong> {formatDateTime(selectedOrder.createdAt)}</p>
                <p><strong>Status:</strong> <span className={`status ${selectedOrder.status}`}>{selectedOrder.status}</span></p>
                <p><strong>Total:</strong> {selectedOrder.totalAmount} LE</p>

                <h4>Items:</h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <ul>
                    {selectedOrder.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} x {item.quantity} = {(item.price * item.quantity).toFixed(2)} LE
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No items recorded</p>
                )}

                <h4>Delivery Address:</h4>
                <p>
                  {selectedOrder.customerInfo?.address}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerDashboard
