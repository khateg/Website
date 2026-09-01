import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth, db } from '../../services/firebase'
import { ref, get, set } from 'firebase/database'
import '../styles/pages.css'

function LoginPage() {
  console.log('LoginPage component mounted')
  console.log('Auth instance:', auth)
  console.log('DB instance:', db)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const isFromCheckout = location.state?.from === 'checkout'
  const returnTo = isFromCheckout ? '/checkout-profile' : '/'

  const handleGoogleSignIn = async () => {
    console.log('Starting Google sign in...')
    setError('')
    setLoading(true)

    try {
      console.log('Creating Google provider...')
      const provider = new GoogleAuthProvider()
      console.log('Showing sign-in popup...')
      const userCredential = await signInWithPopup(auth, provider)
      console.log('Sign-in successful! User:', userCredential.user.email)

      // Check if user profile exists, create if new
      const userRef = ref(db, `users/${userCredential.user.uid}`)

      try {
        const snapshot = await get(userRef)

        if (!snapshot.exists()) {
          const userData = {
            name: userCredential.user.displayName || '',
            email: userCredential.user.email || '',
            phone: '',
            address: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          await set(userRef, userData)
          console.log('User document created successfully')
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
      }

      navigate(returnTo, { replace: true })
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled')
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.')
      } else {
        setError(err.message || 'Failed to sign in with Google')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="login-container">
        <h1>Sign In</h1>
        <p className="subtitle">Sign in to your account</p>

        {error && <div className="error">{error}</div>}

        <button
          type="button"
          className="btn-google full-width"
          onClick={() => {
            console.log('Button clicked!')
            handleGoogleSignIn()
          }}
          disabled={loading}
        >
          {loading ? 'Signing In...' : '🔍 Sign In with Google'}
        </button>

        <div className="divider">or</div>

        <p className="text-center">
          Don't have an account?{' '}
          <Link
            to="/signup"
            state={{ from: isFromCheckout ? 'checkout' : undefined }}
            className="btn-link"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
