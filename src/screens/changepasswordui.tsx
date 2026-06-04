import React, { useState } from "react";

import { changePassword } from "../service/auth.service";

import {
  FaEye,
  FaEyeSlash,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";

const ChangePassword: React.FC = () => {

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // ✅ Show / Hide States
  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  // ==============================
  // SUBMIT
  // ==============================

  const handleSubmit = async () => {

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      alert("Please fill all fields");

      return;
    }

    if (newPassword !== confirmPassword) {

      alert(
        "New password and confirm password do not match"
      );

      return;
    }

    try {

      setLoading(true);

      const res: any =
        await changePassword(
          currentPassword,
          newPassword
        );

      alert(
        res.message ||
          "Password changed successfully"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error: any) {

      alert(
        error?.response?.data?.message ||
          "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };

  // ==============================
  // INPUT STYLE
  // ==============================

  const inputContainerStyle = {
    position: "relative" as const,

    marginBottom: "22px",
  };

  const inputStyle = {
    width: "100%",

    height: "58px",

    border: "none",

    outline: "none",

    borderRadius: "16px",

    background: "#f7f9fc",

    padding: "0 55px 0 52px",

    fontSize: "15px",

    color: "#14344A",

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.05)",
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

        display: "flex",

        justifyContent: "center",

        alignItems: "center",

        padding: "40px 20px",
      }}
    >

      {/* MAIN CARD */}

      <div
        style={{
          width: "100%",

          maxWidth: "520px",

          background: "#fff",

          borderRadius: "32px",

          padding: "40px 35px",

          boxShadow:
            "0 10px 35px rgba(0,0,0,0.08)",

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

        {/* ICON */}

        <div
          style={{
            width: 90,
            height: 90,

            margin: "0 auto 20px",

            borderRadius: "50%",

            background:
              "linear-gradient(to right, #FFFF6D, #8FDAFA)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            boxShadow:
              "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >

          <FaShieldAlt
            size={38}
            color="#14344A"
          />

        </div>

        {/* TITLE */}

        <div className="text-center mb-4">

          <h2
            style={{
              color: "#14344A",

              fontWeight: 700,

              marginBottom: 10,
            }}
          >
            Change Password
          </h2>

          <p
            style={{
              color: "#777",

              fontSize: 14,
            }}
          >
            Update your account password securely
          </p>

        </div>

        {/* ============================== */}
        {/* CURRENT PASSWORD */}
        {/* ============================== */}

        <div style={inputContainerStyle}>

          <FaLock
            style={{
              position: "absolute",

              left: "18px",

              top: "50%",

              transform:
                "translateY(-50%)",

              color: "#14344A",

              zIndex: 1,
            }}
          />

          <input
            type={
              showCurrent
                ? "text"
                : "password"
            }

            placeholder="Current Password"

            value={currentPassword}

            onChange={(e) =>
              setCurrentPassword(
                e.target.value
              )
            }

            style={inputStyle}
          />

          <span
            onClick={() =>
              setShowCurrent(
                !showCurrent
              )
            }

            style={{
              position: "absolute",

              right: "18px",

              top: "50%",

              transform:
                "translateY(-50%)",

              cursor: "pointer",

              color: "#666",
            }}
          >
            {showCurrent ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </span>

        </div>

        {/* ============================== */}
        {/* NEW PASSWORD */}
        {/* ============================== */}

        <div style={inputContainerStyle}>

          <FaLock
            style={{
              position: "absolute",

              left: "18px",

              top: "50%",

              transform:
                "translateY(-50%)",

              color: "#14344A",

              zIndex: 1,
            }}
          />

          <input
            type={
              showNew
                ? "text"
                : "password"
            }

            placeholder="New Password"

            value={newPassword}

            onChange={(e) =>
              setNewPassword(
                e.target.value
              )
            }

            style={inputStyle}
          />

          <span
            onClick={() =>
              setShowNew(!showNew)
            }

            style={{
              position: "absolute",

              right: "18px",

              top: "50%",

              transform:
                "translateY(-50%)",

              cursor: "pointer",

              color: "#666",
            }}
          >
            {showNew ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </span>

        </div>

        {/* ============================== */}
        {/* CONFIRM PASSWORD */}
        {/* ============================== */}

        <div style={inputContainerStyle}>

          <FaLock
            style={{
              position: "absolute",

              left: "18px",

              top: "50%",

              transform:
                "translateY(-50%)",

              color: "#14344A",

              zIndex: 1,
            }}
          />

          <input
            type={
              showConfirm
                ? "text"
                : "password"
            }

            placeholder="Confirm Password"

            value={confirmPassword}

            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }

            style={inputStyle}
          />

          <span
            onClick={() =>
              setShowConfirm(
                !showConfirm
              )
            }

            style={{
              position: "absolute",

              right: "18px",

              top: "50%",

              transform:
                "translateY(-50%)",

              cursor: "pointer",

              color: "#666",
            }}
          >
            {showConfirm ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </span>

        </div>

        {/* ============================== */}
        {/* BUTTON */}
        {/* ============================== */}

        <button
          onClick={handleSubmit}

          disabled={loading}

          style={{
            width: "100%",

            height: "58px",

            border: "none",

            borderRadius: "16px",

            background:
              "linear-gradient(to right, #FFFF6D, #8FDAFA)",

            color: "#14344A",

            fontWeight: 700,

            fontSize: "16px",

            marginTop: "10px",

            boxShadow:
              "0 6px 20px rgba(0,0,0,0.08)",

            transition: "0.3s",
          }}
        >

          {loading
            ? "Changing Password..."
            : "Change Password"}

        </button>

      </div>

    </div>
  );
};

export default ChangePassword;