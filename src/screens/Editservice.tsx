import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { serviceApi } from "../service/serviceapi";
import type { Service } from "../service/serviceapi";

const EditService: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const service = (location.state as { service: Service })?.service;

  // ❗ safety check
  if (!service) {
    return <div className="text-center mt-5">No service data found</div>;
  }

  // ✅ Prefilled states
  const [icon, setIcon] = useState(service.icon || "");
  const [name, setName] = useState(service.name);
  const [category, setCategory] = useState(service.category);
  const [price, setPrice] = useState(String(service.basePrice));
  const [description, setDescription] = useState(service.description || "");

  const getDurationValue = (duration: any) => {
    if (!duration) return "";
    if (typeof duration === "object") return String(duration.value);
    return String(duration);
  };

  const [duration, setDuration] = useState(
    getDurationValue(service.duration)
  );

  const [tags, setTags] = useState(
    service.tags ? service.tags.join(",") : ""
  );

  const [isActive, setIsActive] = useState(
    service.isActive ? "true" : "false"
  );

  const [popularity, setPopularity] = useState(
    service.popularity ? String(service.popularity) : ""
  );

  // ✅ UPDATE
  const handleUpdate = async () => {
    try {
      await serviceApi.updateService(service._id, {
        name,
        category,
        basePrice: Number(price),
        description,
        duration: {
          value: Number(duration),
          unit: "minutes",
        },
        icon,
        isActive: isActive === "true",
        popularity: Number(popularity),
        tags: tags ? tags.split(",") : [],
      });

      alert("Service Updated");

      navigate(-1); // go back
    } catch (error) {
      console.log(error);
      alert("Update failed");
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
        <h2 style={{ color: "#fff", margin: 0 }}>Update Service</h2>
      </div>

      {/* Form */}
      <div className="container mt-4">
        <div className="card p-4 shadow-sm rounded-4">

          <div className="mb-3">
            <label className="form-label">Icon</label>
            <input
              className="form-control"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Service Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <input
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Price</label>
            <input
              type="number"
              className="form-control"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Duration</label>
            <input
              type="number"
              className="form-control"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Status (true / false)</label>
            <input
              className="form-control"
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Popularity</label>
            <input
              type="number"
              className="form-control"
              value={popularity}
              onChange={(e) => setPopularity(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Tags</label>
            <input
              className="form-control"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <button
            className="btn w-100 text-white"
            style={{ backgroundColor: "rgba(52, 183, 234, 1)" }}
            onClick={handleUpdate}
          >
            Update Service
          </button>

        </div>
      </div>
    </div>
  );
};

export default EditService;