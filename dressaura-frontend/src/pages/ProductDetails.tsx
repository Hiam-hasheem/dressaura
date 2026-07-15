import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const showNotice = (message: string) => {
    setNotice(message);

    setTimeout(() => {
      setNotice("");
    }, 3000);
  };

  useEffect(() => {
    fetch(`/api/dresses/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Dress not found");
        return res.json();
      })
      .then((data) => {
        console.log("PRODUCT DATA:", data);

        setProduct({
          ...data,
          condition: data.condition_status,
          price: Number(data.price),
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load product:", err);
        setLoading(false);
      });
  }, [id]);

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      showNotice("Please log in or register to buy a dress.");
      navigate("/login");
      return;
    }
    const sellerId =
      product.user_id ||
      product.seller_id ||
      product.owner_id ||
      product.created_by;

    if (Number(sellerId) === Number(user?.id)) {
      showNotice("You can’t buy your own listing.");
      return;
    }

    navigate("/checkout", { state: product });
  };

  const handleMessageSeller = async () => {
    if (!isAuthenticated) {
      showNotice("Please log in or register to message the seller.");
      navigate("/login");
      return;
    }

    const sellerId =
      product.user_id ||
      product.seller_id ||
      product.owner_id ||
      product.created_by;

    console.log("CURRENT USER:", user?.id);
    console.log("SELLER ID:", sellerId);
    console.log("PRODUCT:", product);

    if (!sellerId) {
      showNotice("Seller information is missing for this dress.");
      return;
    }

    if (Number(sellerId) === Number(user?.id)) {
      showNotice("You can’t message yourself about your own listing.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/chat/conversation?user1_id=${user?.id}&user2_id=${sellerId}&product_id=${product.id}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) throw new Error("Failed to start chat");

      const convo = await res.json();

      console.log("CHAT RESPONSE:", convo);

      const conversationId = convo.id || convo.conversation_id;

      navigate("/chat", {
        state: {
          conversationId: Number(conversationId),
          sellerId: sellerId,
          sellerName:
            product.user_name ||
            product.seller_name ||
            product.owner_name ||
            product.username ||
            "Seller",
          prefillMessage: `Hi, I'm interested in your ${product.brand} dress for €${product.price}.`,
          product: {
            id: product.id,
            user_id:
              product.user_id ||
              product.seller_id ||
              product.owner_id ||
              product.created_by,
            brand: product.brand,
            price: product.price,
            size: product.size,
            image_url: product.image_url,
          },
        },
      });
    } catch (err) {
      console.error("❌ Failed to message seller:", err);
      showNotice("Could not open chat with seller.");
    }
  };

  if (loading) return <p style={{ padding: "40px" }}>Loading...</p>;
  if (!product) return <p style={{ padding: "40px" }}>Product not found.</p>;

  return (
    <div className="product-details">
      {notice && <div className="product-notice">{notice}</div>}

      <div className="details-container">
        <div className="images">
          {product.image_url ? (
            <img
              src={`http://127.0.0.1:8000${product.image_url}`}
              alt={product.brand}
              style={{
                width: "100%",
                height: "420px",
                objectFit: "cover",
                borderRadius: "16px",
                marginBottom: "20px",
              }}
            />
          ) : (
            <div className="main-image">No Image</div>
          )}
        </div>

        <div className="info">
          <h1>{product.brand} Dress</h1>
          <p className="price">€{product.price}</p>

          <div className="meta">
            <p>
              <strong>Size:</strong> {product.size}
            </p>
            <p>
              <strong>Condition:</strong> {product.condition}
            </p>
            <p>
              <strong>Brand:</strong> {product.brand}
            </p>
          </div>

          <p className="description">{product.description}</p>

          <div className="actions">
            <button
              className="btn secondary"
              onClick={() => navigate("/browse")}
            >
              ← Back to Browse
            </button>

            <button className="btn secondary" onClick={handleMessageSeller}>
              Message Seller
            </button>

            <button className="btn primary" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;