import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import {
  FaEnvelope,
  FaPhone,

  FaCheckCircle,
} from "react-icons/fa";

// API
import { getAllUsers } from "../service/admin.service";

const RequesterDetails: React.FC = () => {

  const { id } = useParams();

  const [requester, setRequester] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  // ==============================
  // FETCH DATA
  // ==============================

  useEffect(() => {

    fetchRequesterDetails();

  }, [id]);

  const fetchRequesterDetails = async () => {

    try {

      setLoading(true);

      const res = await getAllUsers();

      const users = res;

      const matchedRequester = users.find(
        (item: any) =>
          item._id?.toString() === id &&
          item.role === "user"
      );

      setRequester(matchedRequester);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {

    return (

      <div
        style={{
          marginLeft: "260px",
          marginTop: "80px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="spinner-border" />
      </div>

    );
  }

  // ==============================
  // NO DATA
  // ==============================

  if (!requester) {

    return (

      <div
        style={{
          marginLeft: "260px",
          marginTop: "100px",
          textAlign: "center",
        }}
      >
        No Requester Found
      </div>

    );
  }

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

        padding: "30px",
      }}
    >

      {/* ============================== */}
      {/* TOP SECTION */}
      {/* ============================== */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns: "350px 1fr",

          gap: 25,

          marginBottom: 30,
        }}
      >

        {/* ============================== */}
        {/* PROFILE CARD */}
        {/* ============================== */}

        <div
          style={{
            background:
              "linear-gradient(to right, #FFFF6D, #8FDAFA)",

            borderRadius: 30,

            padding: "35px 25px",

            textAlign: "center",

            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >

          {/* PROFILE IMAGE */}

          <img
            src={`https://i.pravatar.cc/200?u=${requester._id}`}
            alt="profile"
            style={{
              width: 120,
              height: 120,

              borderRadius: "50%",

              objectFit: "cover",

              border: "5px solid #fff",

              boxShadow:
                "0 6px 20px rgba(0,0,0,0.15)",

              marginBottom: 20,
            }}
          />

          {/* NAME */}

          <h2
            style={{
              color: "#14344A",
              fontWeight: 700,
              fontSize:24,
              
              marginBottom: 10,
            }}
          >
           {requester.firstName} {requester.lastName}
          </h2>

        

        </div>

        {/* ============================== */}
        {/* DETAILS CARD */}
        {/* ============================== */}

        <div
          style={{
            background: "#fff",

            borderRadius: 28,

            padding: 30,

            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >

          <h3
            style={{
              color: "#14344A",

              marginBottom: 25,

              fontWeight: 700,
            }}
          >
            Requester Details
          </h3>

          {/* EMAIL */}

          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 15,

              marginBottom: 22,
            }}
          >

            <div
              style={{
                width: 48,
                height: 48,

                borderRadius: "50%",

                background:
                  "rgba(143,218,250,0.2)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <FaEnvelope
                color="#14344A"
                size={18}
              />

            </div>

            <div>

              <p
                style={{
                  margin: 0,

                  color: "#777",

                  fontSize: 13,
                }}
              >
                Email Address
              </p>

              <h6
                style={{
                  margin: 0,

                  color: "#14344A",

                  marginTop: 4,
                }}
              >
                {requester.email}
              </h6>

            </div>

          </div>

          {/* PHONE */}

          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 15,

              marginBottom: 22,
            }}
          >

            <div
              style={{
                width: 48,
                height: 48,

                borderRadius: "50%",

                background:
                  "rgba(143,218,250,0.2)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <FaPhone
                color="#14344A"
                size={18}
              />

            </div>

            <div>

              <p
                style={{
                  margin: 0,

                  color: "#777",

                  fontSize: 13,
                }}
              >
                Phone Number
              </p>

              <h6
                style={{
                  margin: 0,

                  color: "#14344A",

                  marginTop: 4,
                }}
              >
                {requester.phone}
              </h6>

            </div>

          </div>

          {/* VERIFIED */}

          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 15,
            }}
          >

            <div
              style={{
                width: 48,
                height: 48,

                borderRadius: "50%",

                background:
                  requester.isVerified
                    ? "rgba(0,200,83,0.15)"
                    : "rgba(255,0,0,0.12)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <FaCheckCircle
                color={
                  requester.isVerified
                    ? "green"
                    : "red"
                }
                size={18}
              />

            </div>

            <div>

              <p
                style={{
                  margin: 0,

                  color: "#777",

                  fontSize: 13,
                }}
              >
                Verification Status
              </p>

              <h6
                style={{
                  margin: 0,

                  marginTop: 4,

                  color:
                    requester.isVerified
                      ? "green"
                      : "red",
                }}
              >
                {requester.isVerified
                  ? "Verified User"
                  : "Not Verified"}
              </h6>

            </div>

          </div>

        </div>

      </div>

      {/* ============================== */}
      {/* ABOUT SECTION */}
      {/* ============================== */}

      <div
        style={{
          background: "#fff",

          borderRadius: 28,

          padding: 30,

          boxShadow:
            "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >

        <h3
          style={{
            color: "#14344A",

            marginBottom: 20,

            fontWeight: 700,
          }}
        >
          About us
        </h3>

        <p
          style={{
            color: "#555",

            lineHeight: 1.9,

            fontSize: 15,
          }}
        >
          {requester.bio ||
            "No bio available"}
        </p>

      </div>

    </div>
  );
};

export default RequesterDetails;