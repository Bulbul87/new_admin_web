
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhone, FaCheckCircle, FaUserCircle } from "react-icons/fa";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getAllUsers ,getProfileImage} from "../service/admin.service";
import "./requester.css";


interface UserAvatarProps {
  profileImage?: string | null;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ profileImage }) => {
  const [imageError, setImageError] = useState(false);

  const hasImage =
    !!profileImage &&
    profileImage.trim() !== "" &&
    profileImage !== "undefined";

  if (!hasImage || imageError) {
    return (
      <FaUserCircle
        className="text-gray-400"
        style={{
          width: "40px",
          height: "40px",
          minWidth: "40px",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <img
      src={getProfileImage(profileImage)}
      alt="User Profile"
      width={40}
      height={40}
      crossOrigin="anonymous"
      className="w-10 h-10 rounded-full object-cover"
      style={{
        display: "block",
        minWidth: "108px",
        minHeight: "108px",
        borderRadius:"50%",
        flexShrink: 0,
      }}
      onLoad={() => {
        console.log("Profile image loaded:", profileImage);
      }}
      onError={(e) => {
        console.error("Profile image failed:", e.currentTarget.src);
        setImageError(true);
      }}
    />
  );
};


const RequesterDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [requester, setRequester] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequesterDetails = async () => {
      try {
        setLoading(true);
        const firstRes = await getAllUsers(1, 100);
        let users = [...(firstRes.users || [])];
        const totalPages = firstRes.pagination?.totalPages || 1;

        for (let page = 2; page <= totalPages; page++) {
          const res = await getAllUsers(page, 100);
          users = [...users, ...(res.users || [])];
        }

        const matchedRequester = users.find(
          (item: any) => item._id?.toString() === id && item.role === "user"
        );
        setRequester(matchedRequester || null);
      } catch (error) {
        console.error("Failed to fetch requester details:", error);
        setRequester(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRequesterDetails();
  }, [id]);

  const hiddenKeys = new Set([
    "password",
    "passwordHash",
    "__v",
    "fcmTokens",
    "ssn",
    "ssnLast4",
    "identityData",
    "stripeCustomerId",
    "stripePaymentMethodId",
    "stripeAccountId",
    "stripeConnectAccountId",
    "paymentMethodId",
    "clientSecret",
    "accessToken",
    "refreshToken",
    "otp",
    "phoneOtp",
    "emailOtp",
  ]);

  const labelFor = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .replace(/^./, (char) => char.toUpperCase());

  const isHiddenKey = (key: string) =>
    hiddenKeys.has(key) || /password|secret|token|\bssn\b|otp/i.test(key);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (Array.isArray(value)) {
      if (!value.length) return "N/A";
      if (value.every((item) => item === null || ["string", "number", "boolean"].includes(typeof item))) {
        return value.map((item) => formatValue(item)).join(", ");
      }
      return `${value.length} item(s)`;
    }
    return "Details available";
  };

  const renderObject = (value: any, depth = 0): React.ReactNode => {
    if (!value || typeof value !== "object") return null;
    const entries = Object.entries(value).filter(([key, item]) => !isHiddenKey(key) && item !== undefined);
    if (!entries.length) {
      return <p style={{ color: "#777", margin: 0 }}>No details available</p>;
    }

    return (
      <div
      className="main-data-div"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          width: "100%",
        }}
      >
        {entries.map(([key, item]) => {
          const isNestedObject = item !== null && typeof item === "object";
          const isComplexArray = Array.isArray(item) && item.some((entry) => entry !== null && typeof entry === "object");
          return (
            <div
              key={`${depth}-${key}`}
              className="data-list-div"
              style={{
                minWidth: 0,
                padding: 14,
                border: "1px solid #e8edf3",
                borderRadius: 12,
                background: "#fbfcfe",
                gridColumn: isNestedObject || isComplexArray ? "1/-1": undefined,
              }}
            >
              <p style={{ margin: "0 0 6px", color: "#718096", fontSize: 12, fontWeight: 600 }}>
                {labelFor(key)}
              </p>
              {isNestedObject && !Array.isArray(item) ? (
                <div style={{ marginTop: 8 }}>{renderObject(item, depth + 1)}</div>
              ) : isComplexArray ? (
                <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                  {(item as any[]).map((entry, index) => (
                    <div key={index} style={{ padding: 12, borderRadius: 10, background: "#fff", border: "1px solid #edf0f5" }}>
                      <p style={{ margin: "0 0 8px", color: "#14344A", fontSize: 12, fontWeight: 700 }}>Item {index + 1}</p>
                      {renderObject(entry, depth + 1)}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, color: "#14344A", fontSize: 14, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
                  {formatValue(item)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const sectionStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 24,
    padding: 26,
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    marginBottom: 24,
  };
  const sectionTitleStyle: React.CSSProperties = {
    color: "#14344A",
    margin: "0 0 18px",
    fontWeight: 700,
    fontSize: 20,
  };

  if (loading) {
    return (
      <div style={{ marginLeft: 260, marginTop: 80, display: "flex", justifyContent: "center" }}>
        <div className="spinner-border" />
      </div>
    );
  }

  if (!requester) {
    return (
      <div style={{ marginLeft: 260, marginTop: 100, textAlign: "center" }}>
        <p>No Requester Found</p>
        <button onClick={() => navigate("/users")} style={{ cursor: "pointer" }}>Back to Users</button>
      </div>
    );
  }

  const fullName = [requester.firstName, requester.middleName, requester.lastName].filter(Boolean).join(" ");
  const extraFields = { ...requester };
  ["_id", "firstName", "middleName", "lastName", "email", "phone", "role", "isActive", "bio"].forEach((key) => delete (extraFields as any)[key]);

  return (
    <div style={{ marginLeft: 260, marginTop: 70, minHeight: "100vh", background: "#f5f7fb", padding: 30 }}>
      <button
        onClick={() => navigate("/users")}
          className="booking-back-btn "
      >
        <ArrowLeft size={17} /> Back
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 350px) minmax(0, 1fr)", gap: 25, marginBottom: 30  ,marginTop:"4px"}}>
        <div style={{ background: "linear-gradient(to right, #FFFF6D, #8FDAFA)", borderRadius: 30, padding: "35px 25px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" , alignItems:"center",justifyItems:"center"}}>
           <UserAvatar 
  profileImage={
    requester.profileImage ||
    ""
  }
/>
          <h2 style={{ color: "#14344A", fontWeight: 700, fontSize: 24, marginBottom: 10 }}>{fullName || "Requester"}</h2>
          <p style={{ margin: 0, color: "#14344A", overflowWrap: "anywhere" }}>{requester.requestorInfo.publicRequesterId || ""}</p>
        </div>

<div
  style={{
    background: "#fff",
    borderRadius: 28,
    padding: 30,
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
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

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "25px 30px",
    }}
  >
    {/* EMAIL */}
    <div style={{ display: "flex", alignItems: "center", gap: 15, minWidth: 0 }}>
      <div
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: "50%",
          background: "rgba(143,218,250,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaEnvelope color="#14344A" size={18} />
      </div>

      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, color: "#777", fontSize: 13 }}>
          Email Address
        </p>
        <h6
          style={{
            margin: 0,
            color: "#14344A",
            marginTop: 4,
            overflowWrap: "anywhere",
          }}
        >
          {requester.email || "N/A"}
        </h6>
      </div>
    </div>

    {/* PHONE */}
    <div style={{ display: "flex", alignItems: "center", gap: 15, minWidth: 0 }}>
      <div
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: "50%",
          background: "rgba(143,218,250,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaPhone color="#14344A" size={18} />
      </div>

      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, color: "#777", fontSize: 13 }}>
          Phone Number
        </p>
        <h6 style={{ margin: 0, color: "#14344A", marginTop: 4 }}>
          {requester.phone || "N/A"}
        </h6>
      </div>
    </div>

    {/* DATE OF BIRTH */}
    <div style={{ display: "flex", alignItems: "center", gap: 15, minWidth: 0 }}>
      <div
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: "50%",
          background: "rgba(143,218,250,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#14344A",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
    <CalendarDays size={20} color="#14344A" />
      </div>

      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, color: "#777", fontSize: 13 }}>
          Date of Birth
        </p>
        <h6 style={{ margin: 0, color: "#14344A", marginTop: 4 }}>
          {requester.dateOfBirth
            ? new Date(requester.dateOfBirth).toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
            : "N/A"}
        </h6>
      </div>
    </div>

    {/* ACTIVE STATUS */}
    <div style={{ display: "flex", alignItems: "center", gap: 15, minWidth: 0 }}>
      <div
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: "50%",
          background: requester.isActive
            ? "rgba(0,200,83,0.15)"
            : "rgba(255,0,0,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaCheckCircle
          color={requester.isActive ? "green" : "red"}
          size={18}
        />
      </div>

      <div>
        <p style={{ margin: 0, color: "#777", fontSize: 13 }}>
          Active Status
        </p>
        <h6
          style={{
            margin: 0,
            marginTop: 4,
            color: requester.isActive ? "green" : "red",
          }}
        >
          {requester.isActive ? "Active" : "Deactive"}
        </h6>
      </div>
    </div>
  </div>
</div>

      </div>

  

      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Personal & Account Information</h3>
        {renderObject({
          address: requester.address,
          location: requester.location,
          liveLocation: requester.liveLocation,
          isEmailVerified: requester.isEmailVerified,
          isPhoneVerified: requester.isPhoneVerified,
          createdAt: requester.createdAt,
          updatedAt: requester.updatedAt,
          lastLogin: requester.lastLogin,
         
        })}
      </div>

      {requester.requestorInfo && (
        <div style={sectionStyle}  className="requester-div" >
          <h3 style={sectionTitleStyle}>Requester Information</h3>
          {renderObject(requester.requestorInfo)}
        </div>
      )}


   {requester.paymentMethods && (
        <div style={sectionStyle}  className="payment-div" >
          <h3 style={sectionTitleStyle}>payments methods</h3>
          {renderObject(requester.paymentMethods)}
        </div>
      )}
   

    

     

   
    </div>
  );
};

export default RequesterDetails;