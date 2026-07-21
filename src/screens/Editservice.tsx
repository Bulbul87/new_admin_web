import React, { useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { serviceApi } from "../service/serviceapi";

import type { Service } from "../service/serviceapi";

import {
  FaEdit,
  FaLayerGroup,
  FaTag,
 
  FaClock,
  FaFileAlt,
  FaFire,
  FaIcons,
  FaCheckCircle,
} from "react-icons/fa";
import { DollarSign } from "lucide-react";

const EditService: React.FC = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const service = (
    location.state as {
      service: Service;
    }
  )?.service;

  // ❗ Safety Check
  if (!service) {

    return (

      <div className="text-center mt-5">
        No service data found
      </div>

    );
  }

  // ==============================
  // PREFILLED STATES
  // ==============================

  const [icon, setIcon] = useState(
    service.icon || ""
  );

  const [name, setName] = useState(
    service.name
  );

  const [category, setCategory] =
    useState(service.category);

  const [price, setPrice] = useState(
    String(service.basePrice)
  );

  const [description, setDescription] =
    useState(
      service.description || ""
    );

  const getDurationValue = (
    duration: any
  ) => {

    if (!duration) return "";

    if (
      typeof duration === "object"
    )
      return String(duration.value);

    return String(duration);
  };

  const [duration, setDuration] =
    useState(
      getDurationValue(
        service.duration
      )
    );

  const [tags, setTags] = useState(
    service.tags
      ? service.tags.join(",")
      : ""
  );

  const [isActive, setIsActive] =
    useState(
      service.isActive
        ? "true"
        : "false"
    );

  const [popularity, setPopularity] =
    useState(
      service.popularity
        ? String(
            service.popularity
          )
        : ""
    );

  // ==============================
  // UPDATE
  // ==============================

  const handleUpdate = async () => {

    try {

      await serviceApi.updateService(
        service._id,
        {
          name,

          category,

          basePrice:
            Number(price),

          description,

          duration: {
            value:
              Number(duration),
            unit: "minutes",
          },

          icon,

          isActive:
            isActive === "true",

          popularity:
            Number(popularity),

          tags: tags
            ? tags.split(",")
            : [],
        }
      );

      alert("Service Updated");

      navigate(-1);

    } catch (error) {

      console.log(error);

      alert("Update failed");

    }
  };

  // ==============================
  // INPUT STYLE
  // ==============================

  const inputStyle = {
    width: "100%",

    height: "55px",

    border: "none",

    borderRadius: "16px",

    background: "#f7f9fc",

    padding: "0 18px 0 50px",

    outline: "none",

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.05)",

    fontSize: "15px",
  };

  // ==============================
  // UI
  // ==============================

  return (

    <div
      style={{
        marginLeft: "260px",

        marginTop: "70px",

        minHeight: "100vh",

        background: "#f5f7fb",

        padding: "35px",
      }}
    >

      {/* MAIN CARD */}

      <div
        style={{
          maxWidth: "1100px",

          margin: "0 auto",

          background: "#fff",

          borderRadius: "30px",

          padding: "35px",

          boxShadow:
            "0 8px 30px rgba(0,0,0,0.08)",

          position: "relative",

          overflow: "hidden",
        }}
      >

        {/* TOP GRADIENT */}

        <div
          style={{
            position: "absolute",

            top: 0,
            left: 0,
            right: 0,

            height: "8px",

            background:
              "linear-gradient(to right, #FFFF6D, #8FDAFA)",
          }}
        />

        {/* HEADER */}

        <div className="text-center mb-5">

          <div
            style={{
              width: 90,
              height: 90,

              margin: "0 auto 18px",

              borderRadius: "50%",

              background:
                "linear-gradient(to right, #FFFF6D, #8FDAFA)",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              boxShadow:
                "0 8px 20px rgba(0,0,0,0.08)",
            }}
          >

            <FaEdit
              size={34}
              color="#14344A"
            />

          </div>

          <h2
            style={{
              color: "#14344A",

              fontWeight: 700,

              marginBottom: 10,
            }}
          >
            Edit Service
          </h2>

          <p
            style={{
              color: "#777",
            }}
          >
            Update and manage service
            details
          </p>

        </div>

        {/* FORM GRID */}

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "1fr 1fr",

            gap: 25,
          }}
        >

          {/* ICON */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaIcons
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              style={inputStyle}

              value={icon}

              placeholder="Icon"

              onChange={(e) =>
                setIcon(
                  e.target.value
                )
              }
            />

          </div>

          {/* NAME */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaLayerGroup
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              style={inputStyle}

              value={name}

              placeholder="Service Name"

              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

          </div>

          {/* CATEGORY */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaTag
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              style={inputStyle}

              value={category}

              placeholder="Category"

              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            />

          </div>

          {/* PRICE */}

          <div
            style={{
              position: "relative",
            }}
          >

            <DollarSign  
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
              size={18}
            />

            <input
              type="number"

              style={inputStyle}

              value={price}

              placeholder="Price"

              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
            />

          </div>

          {/* DESCRIPTION */}

          <div
            style={{
              position: "relative",

              gridColumn:
                "1 / span 2",
            }}
          >

            <FaFileAlt
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <textarea
              value={description}

              placeholder="Description"

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

              style={{
                width: "100%",

                minHeight: "130px",

                border: "none",

                borderRadius: "16px",

                background:
                  "#f7f9fc",

                padding:
                  "18px 18px 18px 50px",

                outline: "none",

                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.05)",

                resize: "none",
              }}
            />

          </div>

          {/* DURATION */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaClock
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              type="number"

              style={inputStyle}

              value={duration}

              placeholder="Duration"

              onChange={(e) =>
                setDuration(
                  e.target.value
                )
              }
            />

          </div>

          {/* STATUS */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaCheckCircle
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <select
              value={isActive}

              onChange={(e) =>
                setIsActive(
                  e.target.value
                )
              }

              style={{
                ...inputStyle,

                appearance: "none",

                cursor: "pointer",
              }}
            >

              <option value="true">
                Active
              </option>

              <option value="false">
                Inactive
              </option>

            </select>

          </div>

          {/* POPULARITY */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaFire
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              type="number"

              style={inputStyle}

              value={popularity}

              placeholder="Popularity"

              onChange={(e) =>
                setPopularity(
                  e.target.value
                )
              }
            />

          </div>

          {/* TAGS */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaTag
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              style={inputStyle}

              value={tags}

              placeholder="Tags"

              onChange={(e) =>
                setTags(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* BUTTON */}

        <button
          onClick={handleUpdate}

          style={{
            width: "100%",

            height: "58px",

            border: "none",

            borderRadius: "18px",

            marginTop: "35px",

            background:
              "linear-gradient(to right, #FFFF6D, #8FDAFA)",

            color: "#14344A",

            fontWeight: 700,

            fontSize: "16px",

            boxShadow:
              "0 8px 20px rgba(0,0,0,0.08)",

            transition: "0.3s",
          }}
        >
          Update Service
        </button>

      </div>

    </div>
  );
};

export default EditService;