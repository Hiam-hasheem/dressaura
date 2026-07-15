import "./EditListing.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    brand: "",
    size: "",
    condition_status: "",
    description: "",
    price: "",
  });

  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getImageUrl = (url: any) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`http://localhost:8000/dresses/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Failed to load listing.");
        }

        setFormData({
          brand: data.brand || "",
          size: data.size || "",
          condition_status: data.condition_status || "",
          description: data.description || "",
          price: data.price || "",
        });

        setImageUrl(data.image_url || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    try {
      setSaving(true);

      const res = await fetch(`http://localhost:8000/dresses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: formData.brand,
          size: formData.size,
          condition_status: formData.condition_status,
          description: formData.description,
          price: Number(formData.price),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to update listing.");
      }

      navigate("/my-listings");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-listing-page">
        <h1 className="edit-title">Edit Listing</h1>
        <p className="edit-subtitle">Loading listing...</p>
      </div>
    );
  }

  return (
    <div className="edit-listing-page">
      <h1 className="edit-title">Edit Listing</h1>
      <p className="edit-subtitle">Update your item details</p>

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>Dress Image</label>
          <div className="image-upload">
            {imageUrl ? (
              <img
                src={getImageUrl(imageUrl)}
                alt={formData.brand}
                className="listing-preview-image"
              />
            ) : (
              <span>No image uploaded</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Size</label>
          <select
            name="size"
            value={formData.size}
            onChange={handleChange}
            required
          >
            <option value="">Select size</option>
            <option value="XXS">XXS</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        <div className="form-group">
          <label>Condition</label>
          <select
            name="condition_status"
            value={formData.condition_status}
            onChange={handleChange}
            required
          >
            <option value="">Select condition</option>
            <option value="New with tags">New with tags</option>
            <option value="New without tags">New without tags</option>
            <option value="Very good">Very good</option>
            <option value="Good">Good</option>
            <option value="Satisfactory">Satisfactory</option>
          </select>
        </div>

        <div className="form-group">
          <label>Describe your item</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
          />
        </div>

        <div className="form-group">
          <label>Price (€)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        {error && <p className="edit-error">{error}</p>}

        <div className="edit-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/my-listings")}
          >
            Cancel
          </button>
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}