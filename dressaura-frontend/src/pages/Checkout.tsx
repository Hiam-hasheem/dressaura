import "./Checkout.css";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const product = location.state as any;

  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "apple" | "paypal" | "cash"
  >("card");

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const showNotice = (message: string) => {
    setNotice(message);

    setTimeout(() => {
      setNotice("");
    }, 3000);
  };
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleConfirmPurchase = async () => {
    if (!user?.id || !product?.id) {
      showNotice("Missing user or product information");
      return;
    }

    if (paymentMethod === "card" && (!cardNumber || !expiry || !cvc)) {
      showNotice("Please enter full card details");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:8000/orders/?user_id=${user.id}&dress_id=${product.id}&payment_method=${paymentMethod}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to place order");
      }

      const data = await res.json();

      if (data.error) {
        showNotice(data.error);
        return;
      }

      if (paymentMethod === "card") {
        showNotice("Card payment simulated successfully");
      } else if (paymentMethod === "apple") {
        showNotice("Apple Pay simulated successfully");
      } else if (paymentMethod === "paypal") {
        showNotice("PayPal payment simulated successfully");
      } else {
        showNotice("Cash order placed successfully");
      }

      navigate("/orders/ordered/in-progress");
    } catch (err) {
      console.error("❌ Order failed:", err);
      showNotice("Could not place order");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!product) {
    return (
      <div className="checkout-page">
        <h1 className="checkout-title">Checkout</h1>
        <p>You must select a dress before checkout.</p>
        <Link to="/browse" className="confirm-btn">
          Go to Browse
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {notice && <div className="product-notice">{notice}</div>}
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-card">
        <div className="checkout-summary">
          <h3>{product.brand} Dress</h3>
          <p>Size: {product.size}</p>
          <p className="price">€{product.price}</p>
        </div>

        <div className="payment-section">
          <h4>Select Payment Method</h4>

          <label>
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
            />
            Credit / Debit Card
          </label>

          <label>
            <input
              type="radio"
              name="payment"
              value="apple"
              checked={paymentMethod === "apple"}
              onChange={() => setPaymentMethod("apple")}
            />
            Apple Pay
          </label>

          <label>
            <input
              type="radio"
              name="payment"
              value="paypal"
              checked={paymentMethod === "paypal"}
              onChange={() => setPaymentMethod("paypal")}
            />
            PayPal
          </label>

          <label>
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={() => setPaymentMethod("cash")}
            />
            Cash on Delivery
          </label>
        </div>

        {paymentMethod === "card" && (
          <div className="payment-details">
            <h4>Card Details</h4>
            <input
              type="text"
              placeholder="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
            <input
              type="text"
              placeholder="MM / YY"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
            <input
              type="text"
              placeholder="CVC"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
            />
          </div>
        )}

        {paymentMethod === "apple" && (
          <div className="payment-details">
            <h4>Apple Pay</h4>
            <p>
              You will securely confirm the payment using Apple Pay on your
              device.
            </p>
          </div>
        )}

        {paymentMethod === "paypal" && (
          <div className="payment-details">
            <h4>PayPal</h4>
            <p>You will be redirected to PayPal to complete your purchase.</p>
          </div>
        )}

        {paymentMethod === "cash" && (
          <div className="payment-details">
            <h4>Cash on Delivery</h4>
            <p>You will pay when the dress is delivered.</p>
          </div>
        )}

        <button
          className="confirm-btn"
          onClick={handleConfirmPurchase}
          disabled={loading}
        >
          {loading
            ? "Placing Order..."
            : paymentMethod === "paypal"
            ? "Continue to PayPal"
            : paymentMethod === "apple"
            ? "Pay with Apple Pay"
            : paymentMethod === "cash"
            ? "Place Order"
            : "Confirm Purchase"}
        </button>

        <Link to="/browse" className="cancel-link">
          Cancel and return to browse
        </Link>
      </div>
    </div>
  );
}

export default Checkout;