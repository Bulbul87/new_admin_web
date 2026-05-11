import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaEnvelope,
  FaPhone,
  FaUser,
  FaCheckCircle,
} from "react-icons/fa";

// ✅ import api
import { getAllUsers } from "../service/admin.service";

const RequesterDetails: React.FC = () => {
  // ✅ get id from route
  const { id } = useParams();

  const [requester, setRequester] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequesterDetails();
  }, [id]);

  const fetchRequesterDetails = async () => {
    try {
      setLoading(true);

      // ✅ api call
      const res = await getAllUsers();

      // ✅ direct array
      const users = res;

      // ✅ find requester by id
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

  if (loading) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  if (!requester) {
    return <p className="text-center mt-5">No Requester Found</p>;
  }

  return (
    <div className="container py-4">

      {/* 🔝 Top Profile */}
      <div
        className="text-center p-4 mb-4"
        style={{
          backgroundColor: "rgba(212, 237, 252, 1)",
          borderRadius: "0 0 20px 20px",
        }}
      >
        <img
          src="https://i.pravatar.cc/134"
          alt="profile"
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: 10,
          }}
        />

        <h4 style={{ color: "rgba(20,52,74,1)" }}>
          {requester.name}
        </h4>

        <p style={{ color: "rgba(20,52,74,1)" }}>
          <FaUser /> Requester
        </p>
      </div>

      {/* 📄 About */}
      <div className="card p-3 mb-3 shadow-sm">
        <h5 style={{ color: "rgba(20,52,74,1)" }}>
          About
        </h5>

        <p style={{ color: "rgba(20,52,74,1)" }}>
          {requester.bio || "No bio available"}
        </p>
      </div>

      {/* 📌 Details */}
      <div className="card p-3 shadow-sm">
        <h5 style={{ color: "rgba(20,52,74,1)" }}>
          Details
        </h5>

        <p>
          <FaEnvelope color="#34B7EA" />{" "}
          {requester.email}
        </p>

        <p>
          <FaPhone color="#34B7EA" />{" "}
          {requester.phone}
        </p>

        <p>
          <FaCheckCircle color="#34B7EA" />{" "}
          {requester.isVerified
            ? "Verified"
            : "Not Verified"}
        </p>
      </div>
    </div>
  );
};

export default RequesterDetails;