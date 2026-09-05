import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { ref, get, set, push, update } from "firebase/database";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductContext";
import "../styles/pages.css";

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { refreshProducts } = useProducts();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        // Not signed in, redirect to signup
        navigate("/signup", { state: { from: "checkout" }, replace: true });
        return;
      }

      setUser(currentUser);

      // Fetch user profile from Realtime Database
      try {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      setLoading(false);
      return;
    }

    try {
      // Verify stock availability before creating order
      for (const cartItem of cartItems) {
        const productRef = ref(db, `products/${cartItem.id}`);
        const snapshot = await get(productRef);
        if (!snapshot.exists()) {
          setError(`Product ${cartItem.name} no longer exists`);
          setLoading(false);
          return;
        }
        const currentStock = snapshot.val().stock || 0;
        if (currentStock < cartItem.quantity) {
          setError(
            `Only ${currentStock} of ${cartItem.name} available. Please update your cart.`,
          );
          setLoading(false);
          return;
        }
      }

      // Create order
      const orderData = {
        userId: user.uid,
        customerInfo: formData,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
        })),
        totalAmount: getTotalPrice(),
        status: "pending",
        paymentMethod: "COD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Update stock for each product
      for (const cartItem of cartItems) {
        const productRef = ref(db, `products/${cartItem.id}`);
        const snapshot = await get(productRef);
        const currentStock = snapshot.val().stock || 0;
        const newStock = currentStock - cartItem.quantity;
        await update(productRef, { stock: newStock });
      }

      // Save order to Realtime Database
      const ordersRef = ref(db, "orders");
      const newOrderRef = push(ordersRef);
      const orderId = newOrderRef.key;

      await set(newOrderRef, orderData);

      try {
        const emailResponse = await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...orderData, orderId }),
        });

        if (!emailResponse.ok) {
          console.error(
            "Order was created, but confirmation emails could not be sent",
          );
        }
      } catch (emailError) {
        console.error(
          "Order was created, but confirmation emails could not be sent:",
          emailError,
        );
      }

      // Clear cart
      clearCart();

      // Refresh products to show updated stock
      await refreshProducts();

      // Redirect to success page
      navigate(`/order-success/${orderId}`, { replace: true });
    } catch (err) {
      setError("Failed to place order. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-content">
          <div className="checkout-form">
            <h1>Profile Details</h1>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Delivery Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your delivery address"
                />
              </div>

              <button
                type="submit"
                className="btn-primary full-width"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order (COD)"}
              </button>
            </form>
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(2)} LE</span>
                </div>
              ))}
            </div>
            <div className="order-item">
              <span>Subtotal:</span>
              <span>{getTotalPrice().toFixed(2)} LE</span>
            </div>
            <div className="order-item">
              <span>Shipping:</span>
              <span>0.00 LE</span>
            </div>
            <div className="order-total">
              <strong>Total: {getTotalPrice().toFixed(2)} LE</strong>
            </div>
            <p className="payment-method">Payment Method: Cash on Delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
