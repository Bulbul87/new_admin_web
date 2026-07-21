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
      const fullName =
  item.name ||
  `${item.firstName || ""} ${item.lastName || ""}`;

      const nameMatch = fullName
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

         {/* ======================= USER TABLE ======================= */}

<div
  style={{
    background: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 10px 35px rgba(0,0,0,.08)",
    border: "1px solid rgba(20,52,74,.08)",
  }}
>
  <div
   style={{
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "650px",
    
  }}
  >
    <table
       style={{
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px", 
  }}
    >
      <thead >
        <tr
          style={{
            background:
              "linear-gradient(to right,#FFFF6D,#8FDAFA)",
            height: 72,
            position: "sticky",
top: 0,
zIndex: 10,
          }}
        >
          {/* PROFILE */}

          <th
            style={{
              width: "20%",
              padding: "0 25px",
            textAlign: "center",
              color: "#14344A",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: ".3px",
            }}
          >
            Profile
          </th>

          {/* EMAIL */}

          <th
            style={{
              width: "24%",
              padding: "0 20px",
               textAlign: "center",
              color: "#14344A",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Email
          </th>

          {/* PHONE */}

          <th
            style={{
              width: "18%",
              padding: "0 20px",
               textAlign: "center",
              color: "#14344A",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Phone Number
          </th>

          {/* ACTION */}

          <th
            style={{
              width: "28%",
              padding: "0 20px",
              textAlign: "center",
              color: "#14344A",
              fontWeight: 700,
              fontSize: 15,
             
            }}
          >
            Action
          </th>
        </tr>
      </thead>

      <tbody>

        {data.map((item, index) => (

          <tr
            key={item._id}
            style={{
              height: 88,
              background:
                index % 2 === 0
                  ? "#ffffff"
                  : "#FCFDFE",
              transition: ".25s",
              borderBottom:
                "1px solid rgba(20,52,74,.08)",
            }}
          >
            {/* ================= PROFILE COLUMN ================= */}

<td
  style={{
    padding: "18px 24px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background:
          "linear-gradient(to right,#FFFF6D,#8FDAFA)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow:
          "0 6px 15px rgba(0,0,0,.08)",
      }}
    >
      <FaUserCircle
        size={20}
        color="#14344A"
      />
    </div>

    <div>
      <div
        style={{
          color: "#14344A",
          fontWeight: 700,
          fontSize: 16,
          marginBottom: 4,
        }}
      >
         {item.firstName} {item.lastName}
      </div>

      <div
        style={{
          color: "#8A98A8",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {activeTab === "provider"
          ? "Service Provider"
          : "Requester"}
      </div>
    </div>
  </div>
</td>

{/* ================= EMAIL COLUMN ================= */}

<td
  style={{
    padding: "18px 20px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "#EEF9FE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FaEnvelope
        size={15}
        color="#14344A"
      />
    </div>

    <span
      style={{
        color: "#4A5568",
        fontSize: 15,
        wordBreak: "break-word",
      }}
    >
      {item.email || "-"}
    </span>
  </div>
</td>

{/* ================= PHONE COLUMN ================= */}

<td
  style={{
    padding: "18px 20px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "#EEF9FE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FaPhone
        size={15}
        color="#14344A"
        style={{
    transform: "rotate(90deg)",
  }}
      />
    </div>

    <span
      style={{
        color: "#4A5568",
        fontSize: 15,
        fontWeight: 500,
      }}
    >
      {item.phone || "-"}
    </span>
  </div>
</td>
{/* ================= ACTION COLUMN ================= */}

<td
  style={{
    padding: "18px 20px",
    textAlign: "center",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      flexWrap: "nowrap",
    }}
  >
    {/* PROVIDER BUTTONS */}

    {activeTab === "provider" && (
      <>
        <button
          onClick={() => handleApprove(item._id)}
          style={{
            padding: "9px 16px",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            background: "#28a745",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            transition: ".3s",
            boxShadow: "0 4px 10px rgba(40,167,69,.18)",
          }}
        >
          Approve
        </button>

        <button
          onClick={() => handleReject(item._id)}
          style={{
            padding: "9px 16px",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            background: "#dc3545",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            transition: ".3s",
            boxShadow: "0 4px 10px rgba(220,53,69,.18)",
          }}
        >
          Reject
        </button>
      </>
    )}

    {/* SEE PROFILE */}

    <button
      onClick={() =>
        navigate(
          activeTab === "provider"
            ? `/provider-details/${item._id}`
            : `/requester-details/${item._id}`
        )
      }
      style={{
        padding: "9px 18px",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: 700,
        color: "#14344A",
        background:
          "linear-gradient(to right,#FFFF6D,#8FDAFA)",
        boxShadow: "0 4px 12px rgba(0,0,0,.08)",
        transition: ".3s",
      }}
    >
      See Profile
    </button>
  </div>
</td>
          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>
        </>

      )}

    </div>
  );
};

export default AdminUsers;