import React, { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { useParams } from "react-router-dom";


import {
  FaStar,
  FaEnvelope,
  FaPhone,
  FaTools,
  FaGlobe,
  FaCheckCircle,
} from "react-icons/fa";

import rating1 from "../assets/rating1.png";
import rating2 from "../assets/rating2.png";
import rating3 from "../assets/rating3.png";

// API

import { getAllProviders} from "../service/admin.service";
import  decryptData from '../utils/crypto.js'
const ProviderDetails: React.FC = () => {

  const { id } = useParams();

  const [provider, setProvider] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [ssmidValue, setSsmidValue] = useState("");
const [loadingSsmid, setLoadingSsmid] = useState(false);

  // ==============================
  // FETCH DATA
  // ==============================

  useEffect(() => {

    fetchProviderDetails();

  }, [id]);

const handleSsmidHover = async () => {
  try {
    if (ssmidValue || loadingSsmid) return;

    setLoadingSsmid(true);

    const encryptedSSN =
      provider?.providerInfo?.identityData?.ssnLast4;

    console.log("Encrypted SSN:", encryptedSSN);

    if (!encryptedSSN) {
      setSsmidValue("SSN Not Available");
      return;
    }

    // ✅ FRONTEND DECRYPT (CryptoJS)
    const decrypted = decryptData(encryptedSSN);

    console.log("Decrypted SSN:", decrypted);

    if (decrypted) {
      setSsmidValue(decrypted);
    } else {
      setSsmidValue("Failed to decrypt");
    }

  } catch (error) {
    console.log("Decrypt Error:", error);
    setSsmidValue("Failed to Load");
  } finally {
    setLoadingSsmid(false);
  }
};
  const fetchProviderDetails = async () => {

    try {

      setLoading(true);

      const res = await getAllProviders();

      const providers = res;
     

      const matchedProvider = providers.find(
        (item: any) =>
          item._id?.toString() === id
      );
    

      setProvider(matchedProvider);
   

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

  if (!provider) {

    return (

      <div
        style={{
          marginLeft: "260px",
          marginTop: "100px",
          textAlign: "center",
        }}
      >
        No Provider Found
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
      {/* TOP PROFILE CARD */}
      {/* ============================== */}

      <div
        style={{
          background:
            "linear-gradient(to right, #FFFF6D, #8FDAFA)",

          borderRadius: 30,

          padding: "40px 30px",

          textAlign: "center",

          marginBottom: 30,

          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >

        {/* PROFILE IMAGE */}

        <img
          src={`https://i.pravatar.cc/200?u=${provider._id}`}
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
            marginBottom: 10,
          }}
        >
          {provider.firstName} {provider.lastName}
        </h2>

        {/* RATING */}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",

            gap: 8,

            background: "#fff",

            padding: "10px 18px",

            borderRadius: 30,

            fontWeight: 600,

            color: "#14344A",

            boxShadow:
              "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >

          <FaStar color="gold" />

          {provider.providerInfo?.rating || 0}

        </div>

      </div>

      {/* ============================== */}
      {/* STATS CARDS */}
      {/* ============================== */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(3, 1fr)",

          gap: 25,

          marginBottom: 30,
        }}
      >

        {/* EXPERIENCE */}

        <div
          style={{
            background: "#fff",

            borderRadius: 22,

            padding: 25,

            textAlign: "center",

            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >

          <img
            src={rating1}
            alt=""
            width={45}
            style={{
              marginBottom: 12,
            }}
          />

          <h2
            style={{
              color: "#14344A",
              marginBottom: 5,
            }}
          >
            {provider.providerInfo?.experience || 0}
          </h2>

          <p
            style={{
              color: "#777",
              margin: 0,
            }}
          >
            Years Experience
          </p>

        </div>

        {/* RATE */}

        <div
          style={{
            background: "#fff",

            borderRadius: 22,

            padding: 25,

            textAlign: "center",

            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >

          <img
            src={rating3}
            alt=""
            width={45}
            style={{
              marginBottom: 12,
            }}
          />

          <h2
            style={{
              color: "#14344A",
              marginBottom: 5,
            }}
          >
            ₹ {provider.providerInfo?.hourlyRate || 0}
          </h2>

          <p
            style={{
              color: "#777",
              margin: 0,
            }}
          >
            Hourly Rate
          </p>

        </div>

        {/* TASKS */}

        <div
          style={{
            background: "#fff",

            borderRadius: 22,

            padding: 25,

            textAlign: "center",

            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >

          <img
            src={rating2}
            alt=""
            width={45}
            style={{
              marginBottom: 12,
            }}
          />

          <h2
            style={{
              color: "#14344A",
              marginBottom: 5,
            }}
          >
            {provider.providerInfo
              ?.completedBookings || 0}
          </h2>

          <p
            style={{
              color: "#777",
              margin: 0,
            }}
          >
            Tasks Completed
          </p>

        </div>

      </div>

      {/* ============================== */}
      {/* ABOUT + DETAILS */}
      {/* ============================== */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns: "1fr 1fr",

          gap: 25,
        }}
      >

        {/* ABOUT */}

        <div
          style={{
            background: "#fff",

            borderRadius: 24,

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
            About Provider
          </h3>

          <p
            style={{
              color: "#555",

              lineHeight: 1.8,

              fontSize: 15,
            }}
          >
            {provider.providerInfo?.bio ||
              "No bio available"}
          </p>
          

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  }}
>
  <span>
    SSN: {loadingSsmid ? "Loading..." : ssmidValue }
  </span>

  <FaInfoCircle
    size={18}
    color="#14344A"
    style={{ cursor: "pointer" }}
    onMouseEnter={handleSsmidHover}
  />
</div>


        </div>

        {/* DETAILS */}

        <div
          style={{
            background: "#fff",

            borderRadius: 24,

            padding: 30,

            boxShadow:
              "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >

          <h3
            style={{
              color: "#14344A",
              marginBottom: 22,
              fontWeight: 700,
            }}
          >
            Provider Details
          </h3>

          {/* EMAIL */}

          <div
            style={{
              display: "flex",
              alignItems: "center",

              gap: 14,

              marginBottom: 18,
            }}
          >

            <div
              style={{
                width: 42,
                height: 42,

                borderRadius: "50%",

                background:
                  "rgba(143,218,250,0.2)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <FaEnvelope color="#14344A" />

            </div>

            <span>{provider.email} </span>

          </div>

          {/* PHONE */}

          <div
            style={{
              display: "flex",
              alignItems: "center",

              gap: 14,

              marginBottom: 18,
            }}
          >

            <div
              style={{
                width: 42,
                height: 42,

                borderRadius: "50%",

                background:
                  "rgba(143,218,250,0.2)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <FaPhone color="#14344A" />

            </div>

            <span>{provider.phone}</span>

          </div>

          {/* SPECIALIZATION */}

          <div
            style={{
              display: "flex",
              alignItems: "center",

              gap: 14,

              marginBottom: 18,
            }}
          >

            <div
              style={{
                width: 42,
                height: 42,

                borderRadius: "50%",

                background:
                  "rgba(143,218,250,0.2)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <FaTools color="#14344A" />

            </div>

            <span>
              {provider.providerInfo
                ?.specializations?.join(", ") ||
                "N/A"}
            </span>

          </div>

          {/* LANGUAGES */}

          <div
            style={{
              display: "flex",
              alignItems: "center",

              gap: 14,

              marginBottom: 18,
            }}
          >

            <div
              style={{
                width: 42,
                height: 42,

                borderRadius: "50%",

                background:
                  "rgba(143,218,250,0.2)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <FaGlobe color="#14344A" />

            </div>

            <span>
              {provider.providerInfo
                ?.languages?.join(", ") ||
                "N/A"}
            </span>

          </div>

          {/* VERIFIED */}

          <div
            style={{
              display: "flex",
              alignItems: "center",

              gap: 14,
            }}
          >

            <div
              style={{
                width: 42,
                height: 42,

                borderRadius: "50%",

                background:
                  provider.providerInfo
                    ?.isVerified
                    ? "rgba(0,200,83,0.15)"
                    : "rgba(255,0,0,0.12)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >

              <FaCheckCircle
                color={
                  provider.providerInfo
                    ?.isVerified
                    ? "green"
                    : "red"
                }
              />

            </div>

            <span
              style={{
                fontWeight: 600,
                color:
                  provider.providerInfo
                    ?.isVerified
                    ? "green"
                    : "red",
              }}
            >
              {provider.providerInfo
                ?.isVerified
                ? "Verified Provider"
                : "Not Verified"}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProviderDetails;