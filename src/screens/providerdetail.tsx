// import React from "react";
// import { useLocation } from "react-router-dom";
// import {
//   FaStar,
//   FaEnvelope,
//   FaPhone,
//   FaTools,
//   FaGlobe,
//   FaCheckCircle,
// } from "react-icons/fa";

// import rating1 from "../assets/rating1.png";
// import rating2 from "../assets/rating2.png";
// import rating3 from "../assets/rating3.png";

// const ProviderDetails: React.FC = () => {
//   // ✅ get data from router
//   const location = useLocation();
//   const provider = location.state as any;

//   if (!provider) {
//     return <p className="text-center mt-5">No Data</p>;
//   }

//   return (
//     <div className="container py-4">

//       {/* 🔝 Top Profile */}
//       <div
//         className="text-center p-4 mb-4"
//         style={{
//           backgroundColor: "rgba(212, 237, 252, 1)",
//           borderRadius: "0 0 20px 20px",
//         }}
//       >
//         <img
//           src="https://i.pravatar.cc/134"
//           alt="profile"
//           style={{
//             width: 90,
//             height: 90,
//             borderRadius: "50%",
//             objectFit: "cover",
//             marginBottom: 10,
//           }}
//         />

//         <h4 style={{ color: "rgba(20,52,74,1)" }}>
//           {provider.name}
//         </h4>

//         <p style={{ color: "rgba(20,52,74,1)" }}>
//           <FaStar color="gold" />{" "}
//           {provider.providerInfo?.rating || 0}
//         </p>
//       </div>

//       {/* 📊 Stats */}
//       <div className="row text-center mb-4">
//         <div className="col-md-4">
//           <div className="shadow-sm p-3 rounded bg-white">
//             <img src={rating1} alt="" width={30} />
//             <h5>{provider.providerInfo?.experience || 0}</h5>
//             <p className="text-muted">Experience</p>
//           </div>
//         </div>

//         <div className="col-md-4">
//           <div className="shadow-sm p-3 rounded bg-white">
//             <img src={rating3} alt="" width={30} />
//             <h5>₹ {provider.providerInfo?.hourlyRate || 0}</h5>
//             <p className="text-muted">Rate</p>
//           </div>
//         </div>

//         <div className="col-md-4">
//           <div className="shadow-sm p-3 rounded bg-white">
//             <img src={rating2} alt="" width={30} />
//             <h5>{provider.providerInfo?.completedBookings || 0}</h5>
//             <p className="text-muted">Task Completed</p>
//           </div>
//         </div>
//       </div>

//       {/* 📄 About */}
//       <div className="card p-3 mb-3 shadow-sm">
//         <h5 style={{ color: "rgba(20,52,74,1)" }}>About</h5>
//         <p style={{ color: "rgba(20,52,74,1)" }}>
//           {provider.providerInfo?.bio || "No bio available"}
//         </p>
//       </div>

//       {/* 📌 Details */}
//       <div className="card p-3 shadow-sm">
//         <h5 style={{ color: "rgba(20,52,74,1)" }}>Details</h5>

//         <p>
//           <FaEnvelope color="#34B7EA" /> {provider.email}
//         </p>

//         <p>
//           <FaPhone color="#34B7EA" /> {provider.phone}
//         </p>

//         <p>
//           <FaTools color="#34B7EA" />{" "}
//           {provider.providerInfo?.specializations?.join(", ") || "N/A"}
//         </p>

//         <p>
//           <FaGlobe color="#34B7EA" />{" "}
//           {provider.providerInfo?.languages?.join(", ") || "N/A"}
//         </p>

//         <p>
//           <FaCheckCircle color="#34B7EA" />{" "}
//           {provider.providerInfo?.isVerified
//             ? "Verified"
//             : "Not Verified"}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default ProviderDetails;

import React, { useEffect, useState } from "react";
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

// ✅ import your api
import { getAllProviders } from "../service/admin.service";

const ProviderDetails: React.FC = () => {
  // ✅ get id from route
  const { id } = useParams();

  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviderDetails();
  }, [id]);

 const fetchProviderDetails = async () => {
  try {
    setLoading(true);

    const res = await getAllProviders();

    // ✅ direct array
    const providers = res;

    const matchedProvider = providers.find(
      (item: any) => item._id?.toString() === id
    );

    setProvider(matchedProvider);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  if (!provider) {
    return <p className="text-center mt-5">No Provider Found</p>;
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
          {provider.name}
        </h4>

        <p style={{ color: "rgba(20,52,74,1)" }}>
          <FaStar color="gold" />{" "}
          {provider.providerInfo?.rating || 0}
        </p>
      </div>

      {/* 📊 Stats */}
      <div className="row text-center mb-4">
        <div className="col-md-4">
          <div className="shadow-sm p-3 rounded bg-white">
            <img src={rating1} alt="" width={30} />
            <h5>{provider.providerInfo?.experience || 0}</h5>
            <p className="text-muted">Experience</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="shadow-sm p-3 rounded bg-white">
            <img src={rating3} alt="" width={30} />
            <h5>₹ {provider.providerInfo?.hourlyRate || 0}</h5>
            <p className="text-muted">Rate</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="shadow-sm p-3 rounded bg-white">
            <img src={rating2} alt="" width={30} />
            <h5>{provider.providerInfo?.completedBookings || 0}</h5>
            <p className="text-muted">Task Completed</p>
          </div>
        </div>
      </div>

      {/* 📄 About */}
      <div className="card p-3 mb-3 shadow-sm">
        <h5 style={{ color: "rgba(20,52,74,1)" }}>About</h5>

        <p style={{ color: "rgba(20,52,74,1)" }}>
          {provider.providerInfo?.bio || "No bio available"}
        </p>
      </div>

      {/* 📌 Details */}
      <div className="card p-3 shadow-sm">
        <h5 style={{ color: "rgba(20,52,74,1)" }}>Details</h5>

        <p>
          <FaEnvelope color="#34B7EA" /> {provider.email}
        </p>

        <p>
          <FaPhone color="#34B7EA" /> {provider.phone}
        </p>

        <p>
          <FaTools color="#34B7EA" />{" "}
          {provider.providerInfo?.specializations?.join(", ") || "N/A"}
        </p>

        <p>
          <FaGlobe color="#34B7EA" />{" "}
          {provider.providerInfo?.languages?.join(", ") || "N/A"}
        </p>

        <p>
          <FaCheckCircle color="#34B7EA" />{" "}
          {provider.providerInfo?.isVerified
            ? "Verified"
            : "Not Verified"}
        </p>
      </div>
    </div>
  );
};

export default ProviderDetails;