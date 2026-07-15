import "./OrdersPage.css";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function OrdersPage() {
  const { type, status } = useParams();
  const { user } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [notice, setNotice] = useState("");

  const showNotice = (message: string) => {
    setNotice(message);

    setTimeout(() => {
      setNotice("");
    }, 3000);
  };

  const titleType = type === "sold" ? "Sold" : "Ordered";
  const titleStatus = status === "completed" ? "Completed" : "In Progress";

  useEffect(() => {
    if (!user?.id || !type || !status) return;

    fetch(`http://localhost:8000/orders/${user.id}/${type}/${status}`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(console.error);
  }, [user, type, status]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type, status]);

  const markAsCompleted = async (orderId: number) => {
    try {
      const res = await fetch(
        `http://localhost:8000/orders/${orderId}/complete`,
        {
          method: "PUT",
        }
      );

      const data = await res.json();

      if (data.error) {
        showNotice(data.error);
        return;
      }

      // Remove completed order from current in-progress page
      setOrders((prev) => prev.filter((order) => order.id !== orderId));

      showNotice("Order marked as completed.");
    } catch (error) {
      console.error(error);
      showNotice("Failed to update order.");
    }
  };

  return (
    <div className="orders-page">
    {notice && <div className="product-notice">{notice}</div>}
      <div className="orders-wrapper">
        <div className="orders-card">
          <Link to="/profile" className="back-link">
            ← Back to Profile
          </Link>

          <h1 className="orders-title">{titleType}</h1>
          <p className="orders-subtitle">{titleStatus} orders</p>

          {orders.length === 0 ? (
            <div className="empty-orders">
              No {titleStatus.toLowerCase()} {titleType.toLowerCase()} orders yet.
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div className="order-item" key={order.id}>
                  {order.dress?.image_url && (
                    <img
                      src={`http://127.0.0.1:8000${order.dress.image_url}`}
                      alt={order.dress.brand}
                    />
                  )}

                  <div>
                    <h3>{order.dress?.brand} Dress</h3>
                    <p>Size: {order.dress?.size}</p>
                    <p>€{order.dress?.price}</p>
                    <span className="order-status">{order.status}</span>

                    {type === "sold" && status === "in-progress" && (
                      <button
                        onClick={() => markAsCompleted(order.id)}
                        style={{
                          display: "block",
                          marginTop: "10px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: "none",
                          background: "#111",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;