import React, { useState } from "react";
import { forgotPassword } from "../service/auth.service";
import { FaEnvelope } from "react-icons/fa";

const ForgotPassword: React.FC = () => {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {

      setLoading(true);

      const res: any = await forgotPassword(email);

      alert(
        res?.message ||
        "Password reset link sent successfully"
      );

      console.log("FORGOT PASSWORD RESPONSE:", res);

      setEmail("");

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
        backgroundColor: "#f5f7fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >

      <div
        className="card shadow border-0"
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "14px",
        }}
      >

        {/* Header */}
        <div
          style={{
            backgroundColor: "#14344A",
            padding: "20px",
            borderTopLeftRadius: "14px",
            borderTopRightRadius: "14px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: "#fff",
              margin: 0,
              fontWeight: 600,
            }}
          >
            Forgot Password
          </h2>
        </div>

        {/* Body */}
        <div className="p-4">

          <p
            style={{
              color: "#666",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Enter your registered email address.
            We will send you a password reset link.
          </p>

          {/* Email */}
          <div className="mb-4">

            <label className="mb-2 fw-semibold">
              Email Address
            </label>

            <div className="input-group">

              <span className="input-group-text">
                <FaEnvelope />
              </span>

              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

          </div>

          {/* Button */}
          <button
            className="btn w-100 text-white"
            style={{
              backgroundColor: "rgba(52, 183, 234, 1)",
              height: "45px",
              fontWeight: 600,
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {
              loading
                ? "Sending..."
                : "Send Reset Link"
            }
          </button>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;