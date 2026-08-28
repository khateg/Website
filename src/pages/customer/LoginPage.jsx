import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to signup which handles both signup and signin
    navigate('/signup', { replace: true })
  }, [navigate])

  return null
}

export default LoginPage
