import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const ProviderOnlineOfflineStatus = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        padding: "30px",
        minHeight: "calc(100vh - 70px)",
        background: "#f4f7fb",
        boxSizing: "border-box",
      }}
    >

             <button
            onClick={() => navigate("/users")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              border: "none",
              background: "transparent",
              color: "#14344A",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              marginBottom: "12px",
            }}
          >
            <ArrowLeft size={17} />
            Back
          </button>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >

        <h1
          style={{
            color: "#14344A",
            fontSize: "26px",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Provider Online/Offline Status
        </h1>

        <button
          onClick={() => navigate("/messages")}
          style={{
            background: "linear-gradient(135deg, #14344A, #163A5F)",
            color: "#fff",
            border: "none",
            padding: "11px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(20, 52, 74, 0.2)",
          }}
        >
          View Messages
        </button>
      </div>
    </div>
  );
};

export default ProviderOnlineOfflineStatus;