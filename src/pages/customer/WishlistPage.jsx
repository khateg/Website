import { Link } from "react-router-dom";
import { FiHeart, FiTrash2 } from "react-icons/fi";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { getAvailableStock } from "../../utils/inventoryUtils";
import "../styles/pages.css";

function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();

  const handleAddToCart = async (product) => {
    addToCart(product);
    await removeFromWishlist(product.id);
  };

  return (
    <div className="wishlist-page">
      <div className="section-header-with-button">
        <div>
          <p className="eyebrow">Your saved products</p>
          <h1>Wishlist</h1>
        </div>
        <Link to="/" className="btn-back-to-all">
          Continue Shopping
        </Link>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-state wishlist-empty-state">
          <FiHeart size={42} aria-hidden="true" />
          <h2>Your wishlist is empty</h2>
          <p>Save products you love and find them here anytime.</p>
          <Link to="/" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map((product) => {
            const imageUrl = product.images?.[0] || product.imageUrl;
            const availableStock = getAvailableStock(product, cartItems);

            return (
              <article key={product.id} className="wishlist-card">
                <Link
                  to={`/product/${product.id}`}
                  className="wishlist-card-link"
                >
                  <div className="wishlist-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} />
                    ) : (
                      <span>No image</span>
                    )}
                  </div>
                  <div className="wishlist-card-content">
                    <p className="category">{product.category}</p>
                    <h2>{product.name}</h2>
                    <p className="price">{product.price} LE</p>
                  </div>
                </Link>
                <div className="wishlist-card-actions">
                  <button
                    type="button"
                    className="btn-add-to-cart"
                    onClick={() => handleAddToCart(product)}
                    disabled={availableStock === 0}
                  >
                    {availableStock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
                <button
                  type="button"
                  className="wishlist-remove-button"
                  onClick={() => removeFromWishlist(product.id)}
                  aria-label={`Remove ${product.name} from wishlist`}
                  title="Remove from wishlist"
                >
                  <FiTrash2 size={18} />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
