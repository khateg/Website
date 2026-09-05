import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref, remove, set } from "firebase/database";
import { auth, db } from "../services/firebase";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let unsubscribeWishlist = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      unsubscribeWishlist();
      setUser(currentUser);
      setWishlistItems([]);

      if (!currentUser) return;

      const wishlistRef = ref(db, `users/${currentUser.uid}/wishlist`);
      unsubscribeWishlist = onValue(
        wishlistRef,
        (snapshot) => {
          const wishlist = snapshot.val() || {};
          setWishlistItems(Object.values(wishlist));
        },
        (error) => {
          console.error("Failed to load wishlist:", error);
          setWishlistItems([]);
        },
      );
    });

    return () => {
      unsubscribeWishlist();
      unsubscribeAuth();
    };
  }, []);

  const isInWishlist = (productId) =>
    wishlistItems.some((item) => item.id === productId);

  const addToWishlist = async (product) => {
    if (!auth.currentUser) return false;

    await set(
      ref(db, `users/${auth.currentUser.uid}/wishlist/${product.id}`),
      product,
    );
    return true;
  };

  const removeFromWishlist = async (productId) => {
    if (!auth.currentUser) return false;

    await remove(
      ref(db, `users/${auth.currentUser.uid}/wishlist/${productId}`),
    );
    return true;
  };

  const toggleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      return removeFromWishlist(product.id);
    }
    return addToWishlist(product);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        user,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
