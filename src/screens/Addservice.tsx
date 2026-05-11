import React, { useState } from "react";
import { serviceApi } from "../service/serviceapi";
import { useNavigate } from "react-router-dom";

const AddService: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");

  const [icon, setIcon] = useState("");
  const [isActive, setIsActive] = useState("true");
  const [popularity, setPopularity] = useState("");

const handleAddService = async () => {
  try {
    if (!name || !category || !price || !duration) {
      alert("Please fill required fields");
      return;
    }

    const payload = {
      name,
      category,
      basePrice: Number(price),
      description,
      duration: {
        value: Number(duration),
        unit: "minutes",
      },
      tags: tags ? tags.split(",") : [],
      icon,
      isActive: isActive === "true",
      popularity: popularity ? Number(popularity) : 0,
    };

    console.log("PAYLOAD 👉", payload);

    const res = await serviceApi.createService(payload);

    console.log("RESPONSE 👉", res);

    alert("Service Added Successfully");
    navigate(-1);

  } catch (error: any) {
    console.log("ERROR 👉", error?.response?.data || error);
    alert("Error: " + (error?.response?.data?.message || "Something went wrong"));
  }
};

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>

      {/* Header */}
      <div
        style={{
          backgroundColor: "#14344A",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#fff", margin: 0 }}>Add Service</h2>
      </div>

      {/* Form */}
      <div className="container mt-4">
        <div className="card p-4 shadow-sm rounded-4">

          {/* Name */}
          <div className="mb-3">
            <label className="form-label">Service Name</label>
            <input
              className="form-control"
              placeholder="Enter service name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="mb-3">
            <label className="form-label">Category</label>
            <input
              className="form-control"
              placeholder="Enter category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Price */}
          <div className="mb-3">
            <label className="form-label">Price</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div className="mb-3">
            <label className="form-label">Duration (mins)</label>
            <input
              type="number"
              className="form-control"
              placeholder="Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* Icon */}
          <div className="mb-3">
            <label className="form-label">Icon</label>
            <input
              className="form-control"
              placeholder="e.g. construct-outline"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="mb-3">
            <label className="form-label">Status (true / false)</label>
            <input
              className="form-control"
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
            />
          </div>

          {/* Popularity */}
          <div className="mb-3">
            <label className="form-label">Popularity</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter number"
              value={popularity}
              onChange={(e) => setPopularity(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="mb-3">
            <label className="form-label">Tags</label>
            <input
              className="form-control"
              placeholder="comma separated tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            className="btn w-100 text-white"
            style={{ backgroundColor: "rgba(52, 183, 234, 1)" }}
            onClick={handleAddService}
          >
            Add Service
          </button>

        </div>
      </div>
    </div>
  );
};

export default AddService;