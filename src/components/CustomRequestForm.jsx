import { useState, useEffect } from 'react'
import { auth, db } from '../services/firebase'
import { ref, get } from 'firebase/database'
import { customRequestService } from '../services/customRequestService'
import { cloudinaryService } from '../services/cloudinaryService'
import './styles/customForm.css'

function CustomRequestForm() {
  const [formData, setFormData] = useState({
    description: '',
    textToAdd: '',
    colors: '',
    customerName: '',
    customerPhone: '',
  })
  const [uploadedImage, setUploadedImage] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadUserProfile = async () => {
      if (auth.currentUser) {
        try {
          const userRef = ref(db, `users/${auth.currentUser.uid}`)
          const snapshot = await get(userRef)

          if (snapshot.exists()) {
            const data = snapshot.val()
            setFormData(prev => ({
              ...prev,
              customerName: data.name || '',
              customerPhone: data.phone || '',
            }))
          }
        } catch (error) {
          console.error('Failed to load user profile:', error)
        }
      }
    }

    loadUserProfile()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setErrorMessage('')
      const imageUrl = await cloudinaryService.uploadImage(file)
      setUploadedImage(imageUrl)
    } catch (error) {
      setErrorMessage('Failed to upload image. Please try again.')
      console.error(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.customerName || !formData.customerPhone) {
      setErrorMessage('Please fill in all required fields (Name, Phone)')
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')

      const customRequest = {
        ...formData,
        customerEmail: auth.currentUser?.email || '',
        image: uploadedImage || null,
        submittedAt: new Date().toISOString(),
      }

      await customRequestService.submitCustomRequest(customRequest)

      setSuccessMessage('Your custom request has been sent to admin successfully! We will review it and contact you soon.')

      setTimeout(() => {
        setFormData({
          description: '',
          textToAdd: '',
          colors: '',
          customerName: '',
          customerPhone: '',
        })
        setUploadedImage(null)
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      setErrorMessage('Failed to submit your request. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="custom-form-container">
      <div className="custom-form-card">
        <h3>Custom Order Request</h3>
        <p className="form-description">Tell us about your custom product needs</p>

        {successMessage && <div className="success-alert">{successMessage}</div>}
        {errorMessage && <div className="error-alert">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customerName">Your Name *</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerPhone">Your Phone *</label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what you'd like to create..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="textToAdd">Text to Add (Optional)</label>
            <input
              type="text"
              id="textToAdd"
              name="textToAdd"
              value={formData.textToAdd}
              onChange={handleInputChange}
              placeholder="Any text you want on your product?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="colors">Colors (Optional)</label>
            <input
              type="text"
              id="colors"
              name="colors"
              value={formData.colors}
              onChange={handleInputChange}
              placeholder="e.g., Blue, Gold, Black"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload Image (Optional)</label>
            <div className="image-upload-wrapper">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isLoading}
              />
              {uploadedImage && (
                <div className="image-preview-custom">
                  <img src={uploadedImage} alt="Uploaded preview" />
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="remove-image-btn"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit-custom"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Custom Request'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CustomRequestForm
