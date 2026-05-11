import React, { useState } from "react";
import { changePassword } from "../service/auth.service";

import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword: React.FC = () => {

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ✅ Show / Hide States
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {

      setLoading(true);

      const res: any = await changePassword(
        currentPassword,
        newPassword
      );

      alert(res.message || "Password changed successfully");

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
      }}
    >

      {/* Header */}
      <div
        style={{
          backgroundColor: "#14344A",
          padding: "18px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#fff", margin: 0 }}>
          Change Password
        </h2>
      </div>

      <div
        className="container mt-4"
        style={{ maxWidth: "500px" }}
      >

        {/* Current Password */}
        <div className="mb-3">

          <label className="mb-2">
            Current Password
          </label>

          <div className="position-relative">

            <input
              type={showCurrent ? "text" : "password"}
              className="form-control"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
            />

            <span
              onClick={() =>
                setShowCurrent(!showCurrent)
              }
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
            >
              {showCurrent ? <FaEyeSlash /> : <FaEye />}
            </span>

          </div>
        </div>

        {/* New Password */}
        <div className="mb-3">

          <label className="mb-2">
            New Password
          </label>

          <div className="position-relative">

            <input
              type={showNew ? "text" : "password"}
              className="form-control"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
            />

            <span
              onClick={() =>
                setShowNew(!showNew)
              }
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </span>

          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-3">

          <label className="mb-2">
            Confirm Password
          </label>

          <div className="position-relative">

            <input
              type={showConfirm ? "text" : "password"}
              className="form-control"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

            <span
              onClick={() =>
                setShowConfirm(!showConfirm)
              }
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>

          </div>
        </div>

        {/* Button */}
        <button
          className="btn text-white w-100"
          style={{
            backgroundColor: "rgba(52, 183, 234, 1)",
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? "Changing..."
            : "Change Password"}
        </button>

      </div>
    </div>
  );
};

export default ChangePassword;