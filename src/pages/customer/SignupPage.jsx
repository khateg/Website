import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { RecaptchaVerifier, signInWithPhoneNumber, signInAnonymously } from 'firebase/auth'
import { auth, db } from '../../services/firebase'
import { doc, setDoc } from 'firebase/firestore'
import '../styles/pages.css'

function SignupPage() {
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [otp, setOtp] = useState('')

  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo || '/checkout'

  useEffect(() => {
    setupRecaptcha()
  }, [])

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      })
    }
  }

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formattedPhone = phone.startsWith('+') ? phone : '+20' + phone.slice(-10)

      if (isSigningIn) {
        // Signing in existing user
        const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier)
        setConfirmationResult(result)
        setStep('otp')
      } else {
        // New user signup
        await signInAnonymously(auth)
        const result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier)
        setConfirmationResult(result)
        setStep('otp')
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userCredential = await confirmationResult.confirm(otp)

      // Save user profile to Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid)
      await setDoc(userDocRef, {
        phone,
        name,
        email,
        address,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true })

      // Update Firebase Auth profile
      await userCredential.user.updateProfile({
        displayName: name
      }).catch(() => {})

      navigate(returnTo, { replace: true })
    } catch (err) {
      setError('Invalid OTP. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <div className="signup-page">
        <div className="login-container">
          <h1>Verify OTP</h1>
          <p className="subtitle">Enter the code sent to {phone}</p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleOtpSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="otp">OTP Code</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit OTP"
                maxLength="6"
              />
            </div>

            {!isSigningIn && (
              <>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="Enter your delivery address"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn-primary full-width"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <button
            type="button"
            className="btn-link"
            onClick={() => {
              setStep('form')
              setOtp('')
              setError('')
            }}
            disabled={loading}
          >
            Back
          </button>

          <div id="recaptcha-container"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="signup-page">
      <div className="login-container">
        <h1>{isSigningIn ? 'Sign In' : 'Create Account'}</h1>
        <p className="subtitle">Enter your phone number to {isSigningIn ? 'sign in' : 'get started'}</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handlePhoneSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="Enter your phone number"
            />
          </div>

          {!isSigningIn && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Enter your delivery address"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary full-width"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : isSigningIn ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {!isSigningIn ? (
          <p className="text-center">
            Already have an account?{' '}
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setIsSigningIn(true)
                setName('')
                setEmail('')
                setAddress('')
                setError('')
              }}
            >
              Sign In
            </button>
          </p>
        ) : (
          <p className="text-center">
            New customer?{' '}
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setIsSigningIn(false)
                setError('')
              }}
            >
              Create Account
            </button>
          </p>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  )
}

export default SignupPage
