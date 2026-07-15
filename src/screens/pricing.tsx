import React from "react";

const Pricing: React.FC = () => {
  return (
    <div
      style={{
        marginLeft: 220,
        marginTop: 70,
        padding: "30px",
        minHeight: "calc(100vh - 70px)",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#14344A",
            fontSize: "28px",
            fontWeight: 700,
          }}
        >
          Pricing Management
        </h2>

        <p
          style={{
            marginTop: "12px",
            color: "#6b7280",
            fontSize: "16px",
          }}
        >
          Manage service pricing from this page.
        </p>

        <div
          style={{
            marginTop: "30px",
            padding: "40px",
            border: "2px dashed #d1d5db",
            borderRadius: "10px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "18px",
          }}
        >
          🚧 Pricing module is under development.
        </div>
      </div>
    </div>
  );
};

export default Pricing;