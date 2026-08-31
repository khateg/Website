import { createContext, useState, useContext, useEffect } from 'react'

const CartContext = createContext()
const CART_STORAGE_KEY = 'khat_cart'

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (err) {
      console.error('Failed to load cart from storage:', err)
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch (err) {
      console.error('Failed to save cart to storage:', err)
    }
  }, [cartItems])

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevItems, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
          const maxQuantity = item.stock || 999
          const validQuantity = Math.min(quantity, maxQuantity)
          return { ...item, quantity: validQuantity }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
