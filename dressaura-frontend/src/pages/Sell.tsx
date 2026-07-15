import "./Sell.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sell() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [conditionStatus, setConditionStatus] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");


  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("User information missing. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", String(user.id));
    formData.append("brand", brand);
    formData.append("size", size);
    formData.append("condition_status", conditionStatus);
    formData.append("price", price);
    formData.append("description", description);


    if (imageFile) {
      formData.append("image", imageFile);
    }

    console.log("📦 Sending dress with image...");

    try {
      const res = await fetch("/api/dresses/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Created dress:", data);

      navigate("/my-listings");

      // Reset form
      setBrand("");
      setSize("");
      setConditionStatus("");
      setDescription("");
      setPrice("");
      setImageFile(null);
      setImagePreview("");

      navigate("/browse");
    } catch (err) {
      console.error("❌ Failed to publish listing:", err);
      alert("Failed to publish listing");
    }
  };


  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="sell-page">
      <h1 className="sell-title">Sell a Dress</h1>
      <p className="sell-subtitle">
        List your pre-owned dress and give it a second life.
      </p>

      <form className="sell-form" onSubmit={handleSubmit}>
        {/* IMAGE UPLOAD */}
        <div className="form-group">
          <label>Dress Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="image-upload">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            ) : (
              <span>Click to upload image</span>
            )}
          </label>
        </div>

        {/* BRAND */}
        <div className="form-group">
          <label>Brand</label>
          <input
            type="text"
            required
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>

        {/* SIZE */}
        <div className="form-group">
          <label>Size</label>
          <select
            required
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option value="">Select size</option>
            <option>XXS</option>
            <option>XS</option>
            <option>S</option>
            <option>M</option>
            <option>L</option>
            <option>XL</option>
            <option>XXL</option>
            <option>XXXL</option>
            <option>One Size</option>
          </select>
        </div>

        {/* CONDITION */}
        <div className="form-group">
          <label>Condition</label>
          <select
            required
            value={conditionStatus}
            onChange={(e) => setConditionStatus(e.target.value)}
          >
            <option value="">Select condition</option>
            <option>New with tags</option>
            <option>New without tags</option>
            <option>Very good</option>
            <option>Good</option>
            <option>Satisfactory</option>
          </select>
        </div>

        {/* DESCRIPTION */}
        <div className="form-group">
          <label>Describe your item</label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* PRICE */}
        <div className="form-group">
          <label>Price (€)</label>
          <input
            type="number"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <button type="submit" className="sell-btn">
          Publish Listing
        </button>
      </form>
    </div>
  );
}

export default Sell;