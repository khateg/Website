import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { ref, set } from "firebase/database";
import { FcGoogle } from "react-icons/fc";
import InAppBrowserNotice from "../../components/InAppBrowserNotice";
import "../styles/pages.css";

function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isFromCheckout = location.state?.from === "checkout";
  const returnTo = isFromCheckout ? "/checkout-profile" : "/";

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Create profile with Google info
      const userRef = ref(db, `users/${userCredential.user.uid}`);
      await set(userRef, {
        name: userCredential.user.displayName || "",
        email: userCredential.user.email || "",
        phone: "",
        address: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      navigate(returnTo, { replace: true });
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "Failed to sign up with Google");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="login-container">
        <h1>Create Account</h1>
        <p className="subtitle">Sign up to start shopping</p>

        <InAppBrowserNotice />

        {error && <div className="error">{error}</div>}

        <button
          type="button"
          className="btn-google full-width"
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          <FcGoogle size={20} />
          {loading ? "Signing Up..." : "Sign Up with Google"}
        </button>

        <div className="divider">or</div>

        <p className="text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ from: isFromCheckout ? "checkout" : undefined }}
            className="btn-link"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
