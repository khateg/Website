import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";

function WishlistButton({ product }) {
  const { isInWishlist, toggleWishlist, user } = useWishlist();
  const [saving, setSaving] = useState(false);
  const saved = isInWishlist(product.id);

  if (!user) return null;

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      setSaving(true);
      await toggleWishlist(product);
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      className={`wishlist-button ${saved ? "saved" : ""}`}
      onClick={handleClick}
      disabled={saving}
      aria-label={
        saved
          ? `Remove ${product.name} from wishlist`
          : `Add ${product.name} to wishlist`
      }
      title={saved ? "Remove from wishlist" : "Add to wishlist"}
    >
      <FiHeart size={21} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}

export default WishlistButton;
