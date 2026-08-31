export const getAvailableStock = (product, cartItems) => {
  if (!product || product.stock === undefined) return 0

  const cartItemForProduct = cartItems.find(item => item.id === product.id)
  const quantityInCart = cartItemForProduct ? cartItemForProduct.quantity : 0

  return Math.max(0, product.stock - quantityInCart)
}
