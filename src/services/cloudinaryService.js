import CryptoJS from 'crypto-js'

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET

export const cloudinaryService = {
  async uploadImage(file) {
    if (!file) {
      throw new Error('No file provided')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', CLOUDINARY_API_KEY)

    const timestamp = Math.floor(Date.now() / 1000)
    formData.append('timestamp', timestamp)

    const signatureString = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`
    const signature = CryptoJS.SHA1(signatureString).toString()
    formData.append('signature', signature)

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error('Cloudinary error response:', data)
        throw new Error(data.error?.message || 'Upload failed')
      }

      return data.secure_url
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw error
    }
  },
}
