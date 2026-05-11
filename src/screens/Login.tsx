import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { useAdminAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import img from "../assets/image.png";

const Login: React.FC = () => {

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isLoading, setIsLoading] =
    useState<boolean>(false);

  const [showPassword, setShowPassword] =
    useState<boolean>(false);

  const handleLogin = async () => {

    try {

      if (!email || !password) {
        alert("Please enter email and password");
        return;
      }

      setIsLoading(true);

      // ✅ Login
      await login(email, password);

      // ✅ Navigate
      navigate("/dashboard");

    } catch (error: any) {

      alert(
        error.message || "Login Failed"
      );

    } finally {

      setIsLoading(false);

    }
  };

  return (
    <div
      style={{
        backgroundImage: `
          linear-gradient(
            rgba(242,219,89,0.67),
            rgba(10,152,228,0.8)
          ),
          url(${img})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
      }}
    >

      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >

        <div className="container">

          <div className="row justify-content-center">

            <div className="col-md-4">

              {/* Heading */}
              <h2 className="text-center text-white mb-4">
                Welcome Back!
              </h2>

              {/* Card */}
              <div className="bg-white p-4 rounded shadow">

                {/* Email */}
                <div className="input-group mb-3">

                  <span className="input-group-text">
                    <FaUser />
                  </span>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />

                </div>

                {/* Password */}
                <div className="input-group mb-2">

                  <span className="input-group-text">
                    <FaLock />
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />

                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {
                      showPassword
                        ? <FaEye />
                        : <FaEyeSlash />
                    }
                  </span>

                </div>

                {/* Forgot Password */}
                <p
                  style={{
                    cursor: "pointer",
                    color: "#34B7EA",
                    marginTop: "10px",
                    marginBottom: "20px",
                    textAlign: "right",
                    fontSize: "14px",
                  }}
                  onClick={() =>
                    navigate("/forgot-password")
                  }
                >
                  Forgot Password?
                </p>

                {/* Login Button */}
                <button
                  className="btn w-100 text-white"
                  style={{
                    backgroundColor: "#1C355D",
                  }}
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {
                    isLoading
                      ? "Loading..."
                      : "Login"
                  }
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;