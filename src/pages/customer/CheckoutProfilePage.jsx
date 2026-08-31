import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../services/firebase'
import { ref, get, set } from 'firebase/database'
import '../styles/pages.css'

function CheckoutProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/signup', { state: { from: 'checkout' }, replace: true })
        return
      }

      setUser(currentUser)

      try {
        const userRef = ref(db, `users/${currentUser.uid}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          const userData = snapshot.val()
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || ''
          })
        } else {
          setFormData({
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            phone: '',
            address: ''
          })
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      setError('Please fill in all fields (Name, Phone, Address)')
      return
    }

    setSaving(true)
    setError('')

    try {
      const userRef = ref(db, `users/${user.uid}`)
      await set(userRef, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        updatedAt: new Date().toISOString()
      })

      setSuccess('Profile saved successfully! Redirecting to checkout...')
      setTimeout(() => {
        navigate('/checkout', { replace: true })
      }, 1000)
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading your profile...</div>
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Complete Your Profile</h1>
        <p style={{ textAlign: 'center', color: 'var(--color-gray-dark)', marginBottom: '2rem' }}>
          Please complete your details before proceeding to checkout
        </p>

        <div className="checkout-content" style={{ gridTemplateColumns: '1fr' }}>
          <div className="checkout-form">
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                placeholder="Your email"
              />
              <small style={{ color: 'var(--color-gray-dark)' }}>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
              />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your full address"
                rows="4"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary full-width"
              style={{ marginTop: '1.5rem' }}
            >
              {saving ? 'Saving...' : 'Continue to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutProfilePage
