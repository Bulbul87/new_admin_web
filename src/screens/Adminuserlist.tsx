

import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  getAllProviders,
} from "../service/admin.service";

import { useNavigate } from "react-router-dom";

import {
  FaEnvelope,
  FaPhone,
  FaSearch,
} from "react-icons/fa";

const AdminUsers: React.FC = () => {

  const [activeTab, setActiveTab] = useState<
    "requester" | "provider"
  >("requester");

  const [data, setData] = useState<any[]>([]);

  // ✅ Original Data
  const [originalData, setOriginalData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  // ✅ Search State
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // ==============================
  // FETCH REQUESTERS
  // ==============================

  const loadRequesters = async () => {

    try {

      setLoading(true);

      setActiveTab("requester");

      // ✅ Clear Search
      setSearch("");

      const users = await getAllUsers();

      setData(users);

      setOriginalData(users);

    } catch (err) {

      console.log("Requester Error:", err);

    } finally {

      setLoading(false);

    }
  };

  // ==============================
  // FETCH PROVIDERS
  // ==============================

  const loadProviders = async () => {

    try {

      setLoading(true);

      setActiveTab("provider");

      // ✅ Clear Search
      setSearch("");

      const providers = await getAllProviders();

      setData(providers);

      setOriginalData(providers);

    } catch (err) {

      console.log("Provider Error:", err);

    } finally {

      setLoading(false);

    }
  };

  // ==============================
  // INITIAL LOAD
  // ==============================

  useEffect(() => {

    loadRequesters();

  }, []);

  // ==============================
  // FRONTEND SEARCH
  // ==============================

  useEffect(() => {

    // ✅ Empty Search
    if (!search.trim()) {

      setData(originalData);

      return;
    }

    // ✅ Filter Logic
    const filteredData = originalData.filter((item) => {

      const nameMatch = item.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const emailMatch = item.email
        ?.toLowerCase()
        .includes(search.toLowerCase());

      return nameMatch || emailMatch;

    });

    setData(filteredData);

  }, [search, originalData]);

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
        <h2 style={{ color: "#fff", margin: 0 }}>
          Senior America Clients
        </h2>
      </div>

      {/* Toggle Buttons */}
      <div className="container mt-3 d-flex justify-content-around">

        <button
          className={`btn ${
            activeTab === "requester"
              ? "text-white"
              : ""
          }`}
          style={{
            width: "45%",
            backgroundColor:
              activeTab === "requester"
                ? "rgba(52, 183, 234, 1)"
                : "#fff",
            border: "1px solid #ccc",
          }}
          onClick={loadRequesters}
        >
          Requesters
        </button>

        <button
          className={`btn ${
            activeTab === "provider"
              ? "text-white"
              : ""
          }`}
          style={{
            width: "45%",
            backgroundColor:
              activeTab === "provider"
                ? "rgba(52, 183, 234, 1)"
                : "#fff",
            border: "1px solid #ccc",
          }}
          onClick={loadProviders}
        >
          Providers
        </button>

      </div>

      {/* ✅ Search Bar */}
      <div className="container mt-3">

        <div
          className="d-flex align-items-center border rounded px-3"
          style={{
            height: "45px",
            background: "#fff",
          }}
        >

          <FaSearch color="#999" />

          <input
            type="text"
            placeholder={`Search ${activeTab} by name or email`}
            className="form-control border-0 shadow-none"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>

      {/* Loader */}
      {loading ? (

        <div className="text-center mt-4">
          <div className="spinner-border" />
        </div>

      ) : (

        <div className="container mt-3">

          {/* No Data */}
          {data.length === 0 && (

            <p className="text-center text-muted">
              No Data Found
            </p>

          )}

          {/* List */}
          {data.map((item) => (

            <div
              key={item._id}
              className="card mb-3 p-3 shadow-sm"
              style={{
                borderRadius: "16px",
              }}
            >

              {/* Top */}
              <div className="d-flex align-items-center">

                {/* Avatar */}
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    backgroundColor: "#bfe3f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                    fontWeight: "bold",
                  }}
                >
                  {item.name?.charAt(0)}
                </div>

                {/* Name */}
                <h5
                  style={{
                    margin: 0,
                    color: "#14344A",
                  }}
                >
                  {item.name}
                </h5>

              </div>

              <hr />

              {/* Email */}
              <p>
                <FaEnvelope color="#10d2f0" />{" "}
                {item.email}
              </p>

              {/* Phone */}
              <p>
                <FaPhone color="#10d2f0" />{" "}
                {item.phone}
              </p>

              {/* Profile Button */}
              <button
                className="btn mt-2"
                style={{
                  border:
                    "1px solid rgba(52, 183, 234, 1)",
                  color:
                    "rgba(52, 183, 234, 1)",
                }}
                onClick={() =>
                  navigate(
                    activeTab === "provider"
                      ? `/provider-details/${item._id}`
                      : `/requester-details/${item._id}`
                  )
                }
              >
                See Profile
              </button>

            </div>

          ))}

        </div>

      )}
    </div>
  );
};

export default AdminUsers;