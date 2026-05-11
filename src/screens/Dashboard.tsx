import React from "react";
import img from "../assets/image2.png";

const Dashboard: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff" }}>

      {/* Header */}
      <div
        style={{
          backgroundColor: "#14344A",
          padding: "18px 16px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            color: "#fff",
            margin: 0,
            fontWeight: 600,
            letterSpacing: "0.3px",
          }}
        >
          Welcome to Senior America Dashboard
        </h2>
      </div>

      {/* Scrollable Content */}
      <div style={{ overflowY: "auto" }}>

        {/* Image */}
        <img
          src={img}
          alt="dashboard"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "800px",
            objectFit: "cover",
          }}
        />

      </div>
    </div>
  );
};

export default Dashboard;