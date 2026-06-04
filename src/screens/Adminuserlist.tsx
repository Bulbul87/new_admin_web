import React, { useEffect, useState } from "react";

import {
  getAllUsers,
  getAllProviders,
    approveProvider,
  rejectProvider,
} from "../service/admin.service";

import { useNavigate } from "react-router-dom";

import {
  FaEnvelope,
  FaPhone,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
  import { useLocation } from "react-router-dom"

const AdminUsers: React.FC = () => {

const location = useLocation();

const [activeTab, setActiveTab] = useState<
  "requester" | "provider"
>(
  location.state?.activeTab === "provider"
    ? "provider"
    : "requester"
);

  const [data, setData] = useState<any[]>([]);

  const [originalData, setOriginalData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // ==============================
  // FETCH REQUESTERS
  // ==============================

  const loadRequesters = async () => {

    try {

      setLoading(true);

      setActiveTab("requester");

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


  const handleApprove = async (id: string) => {
  try {
    await approveProvider(id);

    alert("Provider approved successfully");

    loadProviders(); // refresh list
  } catch (error) {
    console.error("Approve Error:", error);
    alert("Failed to approve provider");
  }
};

const handleReject = async (id: string) => {
  const reason = window.prompt(
    "Enter rejection reason"
  );

  if (!reason) return;

  try {
    await rejectProvider(id, reason);

    alert("Provider rejected successfully");

    loadProviders(); // refresh list
  } catch (error) {
    console.error("Reject Error:", error);
    alert("Failed to reject provider");
  }
};

  // ==============================
  // INITIAL LOAD
  // ==============================
useEffect(() => {
  if (activeTab === "provider") {
    loadProviders();
  } else {
    loadRequesters();
  }
}, []);

  // ==============================
  // SEARCH
  // ==============================

  useEffect(() => {

    if (!search.trim()) {

      setData(originalData);

      return;
    }

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

    <div
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
      }}
    >


      {/* TOGGLE BUTTONS */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginBottom: 30,
        }}
      >

        <button
          style={{
            width: 180,
            padding: "12px",

            borderRadius: 12,

            border: "none",

            cursor: "pointer",

            fontWeight: 600,

            transition: "0.3s",

            background:
              activeTab === "requester"
                ? "linear-gradient(to right, #FFFF6D, #8FDAFA)"
                : "#fff",

            color:
              activeTab === "requester"
                ? "#14344A"
                : "#666",

            boxShadow:
              activeTab === "requester"
                ? "0 6px 20px rgba(0,0,0,0.1)"
                : "0 2px 10px rgba(0,0,0,0.06)",
          }}
          onClick={loadRequesters}
        >
          Requesters
        </button>

        <button
          style={{
            width: 180,
            padding: "12px",

            borderRadius: 12,

            border: "none",

            cursor: "pointer",

            fontWeight: 600,

            transition: "0.3s",

            background:
              activeTab === "provider"
                ? "linear-gradient(to right, #FFFF6D, #8FDAFA)"
                : "#fff",

            color:
              activeTab === "provider"
                ? "#14344A"
                : "#666",

            boxShadow:
              activeTab === "provider"
                ? "0 6px 20px rgba(0,0,0,0.1)"
                : "0 2px 10px rgba(0,0,0,0.06)",
          }}
          onClick={loadProviders}
        >
          Providers
        </button>

      </div>

      {/* SEARCH BAR */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 35,
        }}
      >

        <div
          style={{
            width: "420px",
            height: "52px",

            display: "flex",
            alignItems: "center",

            background: "#fff",

            borderRadius: "40px",

            padding: "0 18px",

            boxShadow:
              "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >

          <FaSearch
            color="#14344A"
            size={16}
          />

          <input
            type="text"
            placeholder={`Search ${activeTab} by name or email`}
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={{
              border: "none",
              outline: "none",

              width: "100%",

              marginLeft: 12,

              fontSize: 15,

              background: "transparent",
            }}
          />

        </div>

      </div>

      {/* LOADER */}

      {loading ? (

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 60,
          }}
        >
          <div className="spinner-border" />
        </div>

      ) : (

        <>
          {/* NO DATA */}

          {data.length === 0 && (

            <p
              style={{
                textAlign: "center",
                color: "#777",
              }}
            >
              No Data Found
            </p>

          )}

          {/* CARDS GRID */}

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(2, 1fr)",

              gap: 25,
            }}
          >

            {data.map((item) => (

              <div
                key={item._id}
                style={{
                  background: "#fff",

                  borderRadius: 22,

                  padding: 22,

                  boxShadow:
                    "0 4px 20px rgba(0,0,0,0.07)",

                  transition: "0.3s",

                  border:
                    "1px solid rgba(0,0,0,0.04)",
                }}
              >

                {/* TOP */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >

                  {/* AVATAR */}

                  <div
                    style={{
                      width: 62,
                      height: 62,

                      borderRadius: "50%",

                      background:
                        "linear-gradient(to right, #FFFF6D, #8FDAFA)",

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      marginRight: 15,

                      boxShadow:
                        "0 4px 10px rgba(0,0,0,0.08)",
                    }}
                  >

                    <FaUserCircle
                      size={30}
                      color="#14344A"
                    />

                  </div>

                  {/* NAME */}

                  <div>

                    <h4
                      style={{
                        margin: 0,
                        color: "#14344A",
                        fontWeight: 700,
                      }}
                    >
                      {item.name}
                    </h4>

                    <p
                      style={{
                        margin: 0,
                        color: "#888",
                        marginTop: 5,
                        fontSize: 14,
                      }}
                    >
                      {activeTab === "provider"
                        ? "Service Provider"
                        : "Requester User"}
                    </p>

                  </div>

                </div>

                {/* INFO */}

                <div
                  style={{
                    marginBottom: 18,
                  }}
                >

                  {/* EMAIL */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >

                    <div
                      style={{
                        width: 34,
                        height: 34,

                        borderRadius: "50%",

                        background:
                          "rgba(143,218,250,0.2)",

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        marginRight: 10,
                      }}
                    >

                      <FaEnvelope
                        color="#14344A"
                        size={14}
                      />

                    </div>

                    <span
                      style={{
                        color: "#444",
                        fontSize: 15,
                      }}
                    >
                      {item.email}
                    </span>

                  </div>

                  {/* PHONE */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >

                    <div
                      style={{
                        width: 34,
                        height: 34,

                        borderRadius: "50%",

                        background:
                          "rgba(143,218,250,0.2)",

                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",

                        marginRight: 10,
                      }}
                    >

                      <FaPhone
                        color="#14344A"
                        size={14}
                      />

                    </div>

                    <span
                      style={{
                        color: "#444",
                        fontSize: 15,
                      }}
                    >
                      {item.phone}
                    </span>

                  </div>

                </div>
{/* APPROVE OR REJECT BUTTON */}
{activeTab === "provider" && (
  <div
    style={{
      display: "flex",
      gap: 10,
      marginBottom: 12,
    }}
  >
    <button
      onClick={() => handleApprove(item._id)}
      style={{
        flex: 1,
        padding: "10px",
        border: "none",
        borderRadius: 12,
        cursor: "pointer",
        fontWeight: 600,
        background: "#28a745",
        color: "#fff",
      }}
    >
      Approve
    </button>

    <button
      onClick={() => handleReject(item._id)}
      style={{
        flex: 1,
        padding: "10px",
        border: "none",
        borderRadius: 12,
        cursor: "pointer",
        fontWeight: 600,
        background: "#dc3545",
        color: "#fff",
      }}
    >
      Reject
    </button>
  </div>
)}

                {/* BUTTON */}

                <button
                  onClick={() =>
                    navigate(
                      activeTab === "provider"
                        ? `/provider-details/${item._id}`
                        : `/requester-details/${item._id}`
                    )
                  }
                  style={{
                    width: "100%",

                    padding: "12px",

                    border: "none",

                    borderRadius: 14,

                    cursor: "pointer",

                    fontWeight: 600,

                    background:
                      "linear-gradient(to right, #FFFF6D, #8FDAFA)",

                    color: "#14344A",

                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  See Profile
                </button>

              </div>

            ))}

          </div>
        </>

      )}

    </div>
  );
};

export default AdminUsers;