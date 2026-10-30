
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaStar,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaInfoCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaBriefcase,
  FaCreditCard,
  FaBell,
  FaCertificate,
  FaUserCircle,
  FaTimes,
} from "react-icons/fa";
import { ArrowLeft,} from "lucide-react";
import rating1 from "../assets/rating1.png";
import rating2 from "../assets/rating2.png";
import rating3 from "../assets/rating3.png";
import { getAllProviders, getProfileImage, getAdminUserReviews } from "../service/admin.service";

import { decryptData } from "../utils/crypto";

const colors = {
  navy: "#14344A",
  blue: "#163A5F",
  muted: "#667085",
  border: "#E6EBF1",
  background: "#F5F7FB",
  pale: "#F8FAFC",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid ${colors.border}`,
  borderRadius: 20,
  padding: 24,
  boxShadow: "0 5px 20px rgba(16, 24, 40, 0.045)",
  minWidth: 0,
};

const labelStyle: React.CSSProperties = {
  color: colors.muted,
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 6,
  letterSpacing: 0.2,
  overflowWrap: "anywhere",
};

const valueStyle: React.CSSProperties = {
  color: colors.navy,
  fontSize: 14,
  fontWeight: 500,
  overflowWrap: "anywhere",
  whiteSpace: "pre-wrap",
  lineHeight: 1.6,
};


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

const formatDate = (value: any, includeTime = false): string => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return includeTime
    ? date.toLocaleString()
    : date.toLocaleDateString();
};

const display = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

const Field: React.FC<{
  label: string;
  value?: React.ReactNode;
  wide?: boolean;
}> = ({ label, value, wide }) => (
  <div
    style={{
      minWidth: 0,
      gridColumn: wide ? "1 / -1" : undefined,
    }}
  >
    <div style={labelStyle}>{label}</div>
    <div style={valueStyle}>
      {value === null || value === undefined || value === ""
        ? "N/A"
        : value}
    </div>
  </div>
);

const Section: React.FC<{
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, description, icon, children }) => (
  <section style={cardStyle}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: `1px solid ${colors.border}`,
        paddingBottom: 15,
        marginBottom: 22,
      }}
    >
      {icon && (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "#EAF5FB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.navy,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}

      <div style={{ minWidth: 0 }}>
        <h2
          style={{
            color: colors.navy,
            fontSize: 18,
            margin: 0,
            fontWeight: 800,
          }}
        >
          {title}
        </h2>

        {description && (
          <p
            style={{
              color: colors.muted,
              fontSize: 12,
              margin: "6px 0 0",
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>

    {children}
  </section>
);

const FieldGrid: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "20px 24px",
      minWidth: 0,
    }}
  >
    {children}
  </div>
);

const SummaryItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      minWidth: 0,
    }}
  >
    <div
      style={{
        width: 38,
        height: 38,
        flexShrink: 0,
        borderRadius: 12,
        background: "#EAF5FB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: colors.navy,
      }}
    >
      {icon}
    </div>

    <div style={{ minWidth: 0, paddingTop: 1 }}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value || "N/A"}</div>
    </div>
  </div>
);




/**
 * Use the API server as the base for relative upload paths.
 * Absolute URLs are returned without modification.
 */
const API_ORIGIN = "https://api.senioramerica.us";



const getImageUrl = (path?: string): string => {
  if (!path || typeof path !== "string") return "";

  const cleanPath = path.trim();

  if (!cleanPath) return "";

  if (/^https?:\/\//i.test(cleanPath)) {
    return cleanPath;
  }

  return `${API_ORIGIN}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
};

const getDocumentUrl = (path?: string): string => {
  return getImageUrl(path);
};

/**
 * Shows an uploaded image or PDF when the file type is supported.
 * The original path is retained as a link for troubleshooting/opening.
 */
const DocumentPreview: React.FC<{
  path?: string;
  label?: string;
}> = ({ path, label = "Document" }) => {
  if (!path || typeof path !== "string") {
    return (
      <div style={{ color: colors.muted, fontSize: 13 }}>
        No document uploaded.
      </div>
    );
  }

  const url = getDocumentUrl(path);
  const normalizedPath = path.split("?")[0].toLowerCase();
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|avif)$/i.test(
    normalizedPath
  );
  const isPdf = /\.pdf$/i.test(normalizedPath);

  return (
    <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
      {isImage ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${label}`}
          style={{
            display: "block",
            width: "fit-content",
            maxWidth: "100%",
          }}
        >
          <img
            src={url}
            alt={label}
            loading="lazy"
            style={{
              display: "block",
              maxWidth: "100%",
              width: 360,
              maxHeight: 280,
              objectFit: "contain",
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              background: "#FFFFFF",
              padding: 6,
            }}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </a>
      ) : isPdf ? (
        <iframe
          title={label}
          src={url}
          style={{
            width: "100%",
            height: 420,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            background: "#FFFFFF",
          }}
        />
      ) : (
        <div style={{ color: colors.muted, fontSize: 13 }}>
          Preview is unavailable for this file type. Open the file to view it.
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "9px 13px",
            borderRadius: 10,
            background: colors.navy,
            color: "#FFFFFF",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Open {isPdf ? "PDF" : isImage ? "Image" : "Document"}
        </a>

        <span
          style={{
            color: colors.muted,
            fontSize: 11,
            overflowWrap: "anywhere",
          }}
        >
          {path}
        </span>
      </div>
    </div>
  );
};

const ProviderDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ssnValue, setSsnValue] = useState("");
  const [loadingSsn, setLoadingSsn] = useState(false);
  const [showSsn, setShowSsn] = useState(false);
const [showReviews, setShowReviews] = useState(false);
const [reviews, setReviews] = useState<any[]>([]);
const [reviewsLoading, setReviewsLoading] = useState(false);
const [reviewsError, setReviewsError] = useState("");
const [reviewPage, setReviewPage] = useState(1);
const [reviewTotalPages, setReviewTotalPages] = useState(1);
const [reviewSummary, setReviewSummary] = useState<any>(null);


  useEffect(() => {
    let active = true;

    const fetchProviderDetails = async () => {
      try {
        setLoading(true);

        const firstRes = await getAllProviders(1, 100);
        let providers = [...(firstRes.users || [])];
        const totalPages = firstRes.pagination?.totalPages || 1;

        for (let page = 2; page <= totalPages; page++) {
          const res = await getAllProviders(page, 100);
          providers = [...providers, ...(res.users || [])];
        }

        const match = providers.find(
          (item: any) => item._id?.toString() === id
        );

        if (active) {
          setProvider(match || null);
       
          setSsnValue("");
          setShowSsn(false);
        }
      } catch (error) {
        console.error("Failed to fetch provider details:", error);

        if (active) {
          setProvider(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProviderDetails();

    return () => {
      active = false;
    };
  }, [id]);





const [decryptedDirectDeposit, setDecryptedDirectDeposit] = useState({
  bankName: "",
  accountNumber: "",
  routingNumber: "",
  accountType: "",
  accountHolderFirstName: "",
  accountHolderLastName: "",
  bankAddress: "",
});

useEffect(() => {
  let isMounted = true;

  const decryptField = async (value?: string): Promise<string> => {
    if (!value) return "";

    const decryptedValue = await decryptData(value);

    // Agar value encrypted nahi hai, to original value preserve karo.
    return decryptedValue ?? value;
  };

  const decryptBankDetails = async () => {
    const details = provider?.providerInfo?.directDeposit;

    if (!details) {
      if (isMounted) {
        setDecryptedDirectDeposit({
          bankName: "",
          accountNumber: "",
          routingNumber: "",
          accountType: "",
          accountHolderFirstName: "",
          accountHolderLastName: "",
          bankAddress: "",
        });
      }
      return;
    }

    const [
      bankName,
      accountNumber,
      routingNumber,
      accountType,
      accountHolderFirstName,
      accountHolderLastName,
      bankAddress,
    ] = await Promise.all([
      decryptField(details.bankName),
      decryptField(details.accountNumber),
      decryptField(details.routingNumber),
      decryptField(details.accountType),
      decryptField(details.accountHolderFirstName),
      decryptField(details.accountHolderLastName),
      decryptField(details.bankAddress),
    ]);

    if (isMounted) {
      setDecryptedDirectDeposit({
        bankName,
        accountNumber,
        routingNumber,
        accountType,
        accountHolderFirstName,
        accountHolderLastName,
        bankAddress,
      });
    }
  };

  decryptBankDetails();

  return () => {
    isMounted = false;
  };
}, [
  provider?.providerInfo?.directDeposit?.bankName,
  provider?.providerInfo?.directDeposit?.accountNumber,
  provider?.providerInfo?.directDeposit?.routingNumber,
  provider?.providerInfo?.directDeposit?.accountType,
  provider?.providerInfo?.directDeposit?.accountHolderFirstName,
  provider?.providerInfo?.directDeposit?.accountHolderLastName,
  provider?.providerInfo?.directDeposit?.bankAddress,
]);

const fetchProviderReviews = async (page: number = 1) => {
  if (!id) return;

  try {
    setReviewsLoading(true);
    setReviewsError("");

    const response: any = await getAdminUserReviews(
      id,
      "provider",
      page,
      10
    );

    // API service response unwrap kar sakti hai.
    // Array aur full response dono structures handle karein.
    const reviewList = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
        ? response.data
        : [];

    setReviews(reviewList);

    if (!Array.isArray(response)) {
      setReviewSummary(response?.summary ?? null);

      const pagination = response?.pagination;

      setReviewPage(pagination?.currentPage ?? page);
      setReviewTotalPages(
        Math.max(1, pagination?.totalPages ?? 1)
      );
    } else {
      setReviewPage(page);

      // Provider profile mein totalReviews available hai.
      setReviewTotalPages(
        Math.max(1, Math.ceil((Number(info?.totalReviews) || 0) / 10))
      );
    }
  } catch (error: any) {
    console.error("Failed to fetch provider reviews:", error);
    setReviewsError(
      error?.message || "Failed to load reviews. Please try again."
    );
    setReviews([]);
  } finally {
    setReviewsLoading(false);
  }
};

const openProviderReviews = () => {
  setShowReviews(true);
  setReviewPage(1);
  void fetchProviderReviews(1);
};

const closeProviderReviews = () => {
  setShowReviews(false);
  setReviewsError("");
};

  const handleSsnReveal = async () => {
    setShowSsn(true);

    if (ssnValue || loadingSsn) return;

    try {
      setLoadingSsn(true);

      const identity = provider?.providerInfo?.identityData;
      const encryptedValue = identity?.ssn || identity?.ssnLast4;

      if (!encryptedValue) {
        setSsnValue("Not Available");
        return;
      }

      try {
        const decrypted = await decryptData(encryptedValue);

        // Avoid showing a full SSN if decryption returns the full number.
        const digitsOnly = String(decrypted || "").replace(/\D/g, "");

        if (digitsOnly.length === 9) {
          setSsnValue(`${digitsOnly.slice(-4)}`);
        } else if (digitsOnly.length === 4) {
          setSsnValue(` ${digitsOnly}`);
        } else {
          setSsnValue("Unable to display");
        }
      } catch (error) {
        console.error("SSN decrypt error:", error);

        const lastFour = String(identity?.ssnLast4 || "").replace(/\D/g, "");

        setSsnValue(
          lastFour.length === 4
            ? `${lastFour}`
            : "Unable to display"
        );
      }
    } finally {
      setLoadingSsn(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          marginLeft: 260,
          marginTop: 80,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="spinner-border" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div
        style={{
          marginLeft: 260,
          marginTop: 100,
          textAlign: "center",
          color: colors.navy,
        }}
      >
        No Caregiver Found
      </div>
    );
  }

  const info = provider.providerInfo || {};
  const identity = info.identityData || {};
  const workArea = info.workArea || {};
  const center = workArea.center || {};
  const directDeposit = info.directDeposit || {};
  const notificationSettings = info.notificationSettings || {};
  const alertTypes = notificationSettings.alertTypes || {};
  const notificationPreferences = notificationSettings.preferences || {};

  const fullName =
    [
      provider.firstName,
      provider.middleName,
      provider.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Caregiver";

  

  const stats = [
    {
      image: rating1,
      value: info.experience ?? "N/A",
      label: "Years Experience",
    },
    {
      image: rating3,
      value: info.hourlyRate ?? "N/A",
      label: "Hourly Rate",
    },
    {
      image: rating2,
      value: info.completedBookings ?? 0,
      label: "Tasks Completed",
    },
  ];

  const listBox: React.CSSProperties = {
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: 16,
    background: colors.pale,
    minWidth: 0,
  };

  const smallTitle: React.CSSProperties = {
    margin: "0 0 14px",
    color: colors.navy,
    fontSize: 14,
    fontWeight: 800,
  };

  return (
    <div
      style={{
        marginLeft: 260,
        marginTop: 70,
        minHeight: "100vh",
        background: colors.background,
        padding: 30,
        color: colors.navy,
      }}
    >
      <button
        onClick={() =>
          navigate("/users", {
            state: {
              activeTab: location.state?.activeTab || "provider",
            },
          })
        }
         className="booking-back-btn "
      
        
      >
        <ArrowLeft size={18} /> Back 
      </button>

      {/* CAREGIVER PROFILE HEADER */}
      <section
        style={{
          background:
            "linear-gradient(115deg, #FFFF6D 0%, #BDEBFA 55%, #8FDAFA 100%)",
          borderRadius: 26,
          padding: "30px 32px",
          marginTop:"4px",
          marginBottom: 24,
          boxShadow: "0 10px 28px rgba(20,52,74,0.09)",
          display: "flex",
          alignItems: "center",
          gap: 24,
          justifyContent:"space-between",
          flexWrap: "wrap",
        }}
      >
   
{/* Caregiver Profile Header */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  }}
>
  {/* Profile Image */}
  <div
    style={{
      width: 104,
      height: 104,
      minWidth: 104,
      flexShrink: 0,
      borderRadius: "50%",
      border: "4px solid #FFFFFF",
      boxShadow: "0 5px 16px rgba(0,0,0,0.12)",
      overflow: "hidden",
      background: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <UserAvatar
  profileImage={
    provider.profileImage ||
    provider.providerInfo?.profileImage ||
    provider.providerInfo?.profilePhoto ||
    provider.profilePhoto ||
    ""
  }
/>
  </div>

  {/* Caregiver Details */}
  <div style={{ flex: "1 1 260px", minWidth: 0 }}>
    {/* Profile Badge */}
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 11px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.72)",
        color: colors.navy,
        fontSize: 12,
        fontWeight: 800,
        marginBottom: 9,
      }}
    >
      CAREGIVER PROFILE
    </div>

    {/* Caregiver Name */}
    <h1
      style={{
        fontSize: 28,
        lineHeight: 1.25,
        fontWeight: 800,
        margin: "0 0 8px",
        color: colors.navy,
        overflowWrap: "anywhere",
      }}
    >
      {fullName}
    </h1>

    {/* Contact & Rating */}
    <div
      style={{
        display: "flex",
        gap: 14,
        flexWrap: "wrap",
        alignItems: "center",
        color: colors.navy,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <FaEnvelope />
        {provider.email || "No email"}
      </span>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <FaPhone />
        {provider.phone || "No phone"}
      </span>

     <span
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  }}
>
  <FaStar color="#9A6700" />
  {info.rating ?? provider.rating ?? 0} Rating (
  <button
    type="button"
    onClick={openProviderReviews}
    style={{
      border: "none",
      background: "transparent",
      color: colors.navy,
      textDecoration: "underline",
      cursor: "pointer",
      padding: 0,
      font: "inherit",
      fontWeight: 700,
    }}
    aria-label={`View ${info.totalReviews ?? 0} caregiver reviews`}
  >
    {info.totalReviews ?? 0} reviews
  </button>
  )
</span>
    </div>
  </div>
</div>


        <div
          style={{
            padding: "10px 15px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.78)",
            fontSize: 13,
            fontWeight: 800,
            color: info.isVerified ? "#137547" : "#9A5700",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FaCheckCircle />
          {info.isVerified
            ? "Verified Caregiver"
            : "Verification Pending"}
        </div>
      </section>

      {/* SUMMARY STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 18,
          marginBottom: 24,
        }}
      >
        {stats.map((item) => (
          <div
            key={item.label}
            style={{
              ...cardStyle,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                flexShrink: 0,
                borderRadius: 16,
                background: "#F0F7FB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={item.image}
                alt=""
                width={36}
                height={36}
                style={{ objectFit: "contain" }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: colors.navy,
                  fontSize: 23,
                  fontWeight: 800,
                  overflowWrap: "anywhere",
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  fontWeight: 600,
                  marginTop: 3,
                }}
              >
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CONTACT OVERVIEW AND ABOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 22,
          marginBottom: 24,
        }}
      >
        <section style={cardStyle}>
          <h2
            style={{
              margin: "0 0 22px",
              color: colors.navy,
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            Contact & Account Overview
          </h2>

          <div style={{ display: "grid", gap: 20 }}>
            <SummaryItem
              icon={<FaEnvelope />}
              label="Email Address"
              value={provider.email}
            />
            <SummaryItem
              icon={<FaPhone />}
              label="Phone Number"
              value={provider.phone}
            />
            <SummaryItem
              icon={<FaCalendarAlt />}
              label="Date Created"
              value={formatDate(provider.createdAt)}
            />
            <SummaryItem
              icon={<FaMapMarkerAlt />}
              label="Work Area"
              value={workArea.address}
            />
          </div>
        </section>

        <section style={cardStyle}>
          <h2
            style={{
              margin: "0 0 12px",
              color: colors.navy,
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            About Caregiver
          </h2>

          <p
            style={{
              margin: 0,
              color: "#475467",
              lineHeight: 1.8,
              fontSize: 14,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {info.bio || "No bio available."}
          </p>

          <div
            style={{
              borderTop: `1px solid ${colors.border}`,
              paddingTop: 18,
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                color: colors.navy,
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              <FaIdCard /> Identity Information
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 12,
              }}
            >
              <FaInfoCircle color={colors.muted} />

              <span style={{ color: colors.muted, fontSize: 13 }}>
                SSN
              </span>

              <button
                type="button"
                onMouseEnter={handleSsnReveal}
                onMouseLeave={() => setShowSsn(false)}
                onFocus={handleSsnReveal}
                onBlur={() => setShowSsn(false)}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: 9,
                  background: colors.pale,
                  color: colors.navy,
                  padding: "7px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {showSsn
                  ? loadingSsn
                    ? "Loading..."
                    : ssnValue || "Unavailable"
                  : "Hover to reveal"}
              </button>
            </div>

            <p
              style={{
                margin: "8px 0 0",
                color: "#98A2B3",
                fontSize: 11,
              }}
            >
              Only the masked SSN value is displayed.
            </p>
          </div>
        </section>
      </div>

      <div style={{ display: "grid", gap: 22 }}>
      

        <Section
          title="Provider Profile & Work Details"
          description="Professional profile and caregiver work preferences."
          icon={<FaBriefcase />}
        >
          <FieldGrid>
            <Field label="Gender" value={info.gender} />
            <Field label="Professional Title" value={info.professionalTitle} />
         
            <Field
              label="Accepting Requests"
              value={display(info.acceptingRequests)}
            />
            <Field
              label="Availability Timezone"
              value={info.availabilityTimezone}
            />
            <Field
              label="Declared No Professional Licenses"
              value={display(info.declaredNoProfessionalLicenses)}
            />
         
         


<Field
  label="Specializations"
  value={
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gap: "20px 16px",
        width: "100%",
        alignItems: "start",
      }}
    >
      {(() => {
        const specializationList: string[] = Array.isArray(
          info.specializations
        )
          ? info.specializations.map(String)
          : (info.specializations || "").split(
              /(?=[A-Za-z &]+:)/
            );

        const groups = specializationList
          .map((item: string) => item.trim())
          .filter(Boolean)
          .reduce<Record<string, string[]>>(
            (acc, item) => {
              const separatorIndex = item.indexOf(":");

              const category =
                separatorIndex !== -1
                  ? item.slice(0, separatorIndex).trim()
                  : "Other";

              const service =
                separatorIndex !== -1
                  ? item.slice(separatorIndex + 1).trim()
                  : item;

              if (!acc[category]) {
                acc[category] = [];
              }

              acc[category].push(service);
              return acc;
            },
            {}
          );

        return Object.entries(groups).map(
          ([category, services]: [string, string[]]) => (
            <div
              key={category}
              style={{
                minWidth: 0,
                overflowWrap: "anywhere",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: "#14344A",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                {category}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  paddingLeft: "10px",
                  color: "#475569",
                  fontSize: "13px",
                }}
              >
                {services.map(
                  (service: string, index: number) => (
                    <div key={`${category}-${index}`}>
                      • {service}
                    </div>
                  )
                )}
              </div>
            </div>
          )
        );
      })()}
    </div>
  }
  wide
/>



          </FieldGrid>
        </Section>

        <Section
          title="Identity & Verification"
          description="Identity details and onboarding/verification status. SSN is handled separately above."
          icon={<FaIdCard />}
        >
          <FieldGrid>
         <Field
  label="Legal Full Name"
  value={[
    identity.firstName,
    identity.noLegalMiddleName ? "" : identity.middleName,
    identity.lastName,
  ]
    .filter(Boolean)
    .join(" ")}
/>
            <Field
              label="Date of Birth"
              value={formatDate(identity.dateOfBirth)}
            />
            <Field
              label="Identity Confirmed At"
              value={formatDate(identity.confirmedAt, true)}
            />
            <Field
              label="Identity Confirmed"
              value={display(info.identityConfirmed)}
            />
            <Field label="Verified" value={display(info.isVerified)} />
            <Field
              label="Verification Status"
              value={info.verificationStatus}
            />
            <Field
              label="Verification Submitted At"
              value={formatDate(info.verificationSubmittedAt, true)}
            />
            <Field label="Rejection Reason" value={info.rejectionReason} />
            <Field label="Onboarding Step" value={info.onboardingStep} />
            <Field
              label="Activation Complete"
              value={display(info.activationComplete)}
            />
            <Field
              label="Profile Fully Complete"
              value={display(info.profileFullyComplete)}
            />
            <Field
              label="Activation Banner Dismissed At"
              value={formatDate(info.activationBannerDismissedAt, true)}
            />
          </FieldGrid>
        </Section>

        <Section
          title="Work Area & Location"
          description="Caregiver service area and configured location coordinates."
          icon={<FaMapMarkerAlt />}
        >
          <FieldGrid>
            <Field label="Work Area Address" value={workArea.address} wide />
            <Field label="Work Area ZIP Code" value={workArea.zipCode} />
            <Field
              label="Service Radius"
              value={
                workArea.radius !== undefined
                  ? `${workArea.radius} miles`
                  : undefined
              }
            />
            <Field label="Center Latitude" value={center.latitude} />
            <Field label="Center Longitude" value={center.longitude} />
            <Field
              label="Location Tracking Enabled"
              value={display(info.locationTrackingEnabled)}
            />
          </FieldGrid>
        </Section>

        <Section
          title="Direct Deposit"
          description="Bank profile metadata. Full account and routing numbers are intentionally not displayed."
          icon={<FaCreditCard />}
        >
          <FieldGrid>
            <Field
              label="Direct Deposit Verified"
              value={display(directDeposit.verified)}
            />
            <Field label="Account Type" value={decryptedDirectDeposit.accountType}  />
            <Field label="Bank Name" value={decryptedDirectDeposit.bankName} />

            <Field
              label="Account Holder First Name"
              value={decryptedDirectDeposit.accountHolderFirstName}
            />
            <Field
              label="Account Holder Last Name"
              value={decryptedDirectDeposit.accountHolderLastName}
            />
            <Field
              label="Bank Address"
              value={decryptedDirectDeposit.bankAddress}
              wide
            />
              <Field label="Account Number" value={decryptedDirectDeposit.accountNumber} />
             <Field label="Routing Number" value={decryptedDirectDeposit.routingNumber} />
            <Field
              label="Direct Deposit Updated At"
              value={formatDate(directDeposit.updatedAt, true)}
            />
          </FieldGrid>
        </Section>

        <Section
          title="Payout & Payment Settings"
          description="Payout status and payment method metadata. Secret financial identifiers are not shown."
          icon={<FaCreditCard />}
        >
          <FieldGrid>
            <Field
              label="Stripe Connect Status"
              value={info.stripeConnectStatus}
            />
            <Field
              label="Stripe Withdrawn Total"
              value={info.stripeWithdrawnTotal}
            />
            <Field
              label="PayPal Withdrawn Total"
              value={info.paypalWithdrawnTotal}
            />
            <Field
              label="Venmo Withdrawn Total"
              value={info.venmoWithdrawnTotal}
            />
            <Field label="PayPal Email" value={info.paypalEmail} />
            <Field label="Venmo Handle" value={info.venmoHandle} />
          </FieldGrid>

          <div style={{ marginTop: 22 }}>
            <h3 style={smallTitle}>
              Payment Methods (
              {Array.isArray(info.paymentMethods)
                ? info.paymentMethods.length
                : 0}
              )
            </h3>

            {Array.isArray(info.paymentMethods) &&
            info.paymentMethods.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 14,
                }}
              >
                {info.paymentMethods.map((method: any, index: number) => (
                  <div
                    key={method?._id || index}
                    style={listBox}
                  >
                    <h4
                      style={{
                        margin: "0 0 12px",
                        color: colors.navy,
                        fontSize: 14,
                        fontWeight: 800,
                      }}
                    >
                      Payment Method {index + 1}
                    </h4>

                    <FieldGrid>
                      <Field label="Type" value={method?.type} />
                      <Field
                        label="Default Method"
                        value={display(method?.isDefault)}
                      />
                      <Field
                        label="Contact"
                        value={method?.details?.contact}
                        wide
                      />
                      <Field
                        label="Added At"
                        value={formatDate(method?.addedAt, true)}
                        wide
                      />
                    </FieldGrid>
                  </div>
                ))}
              </div>
            ) : (
              <div style={valueStyle}>No payment methods available.</div>
            )}
          </div>
        </Section>

        <Section
          title="Licenses"
          description="Each license record has its own explicitly named fields."
          icon={<FaCertificate />}
        >
          {Array.isArray(info.licenses) && info.licenses.length ? (
            <div style={{ display: "grid", gap: 14 }}>
              {info.licenses.map((license: any, index: number) => (
                <div key={license?._id || index} style={listBox}>
                  <h3 style={smallTitle}>License {index + 1}</h3>

                  <FieldGrid>
                    <Field label="License Type" value={license?.type} />
                    <Field label="License Number" value={license?.number} />
                    <Field label="Issuing State" value={license?.state} />
                    <Field label="License Status" value={license?.status} />

                    <div style={{ gridColumn: "1 / -1", minWidth: 0 }}>
                      <div style={labelStyle}>License Document</div>
                      <DocumentPreview
                        path={license?.photoUrl}
                        label={`License ${index + 1} document`}
                      />
                    </div>
                  </FieldGrid>
                </div>
              ))}
            </div>
          ) : (
            <div style={valueStyle}>No licenses available.</div>
          )}
        </Section>

        <Section
          title="Certifications, Photos & Documents"
          description="Uploaded certification, profile photo and verification document records."
          icon={<FaCertificate />}
        >
          <h3 style={smallTitle}>
            Certifications (
            {Array.isArray(info.certifications)
              ? info.certifications.length
              : 0}
            )
          </h3>

          {Array.isArray(info.certifications) && info.certifications.length ? (
            <div
              style={{
                display: "grid",
                gap: 12,
                marginBottom: 22,
              }}
            >
              {info.certifications.map((cert: any, index: number) => (
                <div key={cert?._id || index} style={listBox}>
                  <h4 style={smallTitle}>Certification {index + 1}</h4>

                  <FieldGrid>
                    <Field label="Name" value={cert?.name} />
                    <Field label="Type" value={cert?.type} />
                    <Field label="Issuer" value={cert?.issuer} />
                    <Field label="Number" value={cert?.number} />
                    <Field
                      label="Issue Date"
                      value={formatDate(cert?.issueDate)}
                    />
                    <Field
                      label="Expiry Date"
                      value={formatDate(cert?.expiryDate)}
                    />
                    <Field label="Status" value={cert?.status} />

                    <div style={{ gridColumn: "1 / -1", minWidth: 0 }}>
                      <div style={labelStyle}>Certification Document</div>
                      <DocumentPreview
                        path={cert?.photoUrl || cert?.documentUrl}
                        label={`Certification ${index + 1} document`}
                      />
                    </div>
                  </FieldGrid>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ ...valueStyle, marginBottom: 22 }}>
              No certifications available.
            </p>
          )}

          <h3 style={smallTitle}>
            Provider Photos (
            {Array.isArray(info.photos) ? info.photos.length : 0})
          </h3>

          {Array.isArray(info.photos) && info.photos.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                marginBottom: 22,
              }}
            >
              {info.photos.map((photo: any, index: number) => {
                const photoPath =
                  typeof photo === "string"
                    ? photo
                    : photo?.url || photo?.photoUrl;

                return (
                  <div key={photo?._id || index} style={listBox}>
                    <h4 style={smallTitle}>Photo {index + 1}</h4>

                    <FieldGrid>
                      <div style={{ gridColumn: "1 / -1", minWidth: 0 }}>
                        <div style={labelStyle}>Photo</div>
                        <DocumentPreview
                          path={photoPath}
                          label={`Provider photo ${index + 1}`}
                        />
                      </div>

                      {typeof photo !== "string" && (
                        <>
                          <Field label="Caption" value={photo?.caption} />
                          <Field
                            label="Uploaded At"
                            value={formatDate(photo?.uploadedAt, true)}
                          />
                        </>
                      )}
                    </FieldGrid>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ ...valueStyle, marginBottom: 22 }}>
              No provider photos available.
            </p>
          )}

          <h3 style={smallTitle}>
            Verification Documents (
            {Array.isArray(info.verificationDocuments)
              ? info.verificationDocuments.length
              : 0}
            )
          </h3>

          {Array.isArray(info.verificationDocuments) &&
          info.verificationDocuments.length ? (
            <div style={{ display: "grid", gap: 12 }}>
              {info.verificationDocuments.map((doc: any, index: number) => (
                <div key={doc?._id || index} style={listBox}>
                  <h4 style={smallTitle}>
                    Verification Document {index + 1}
                  </h4>

                  <FieldGrid>
                    <Field
                      label="Document Type"
                      value={doc?.type || doc?.documentType}
                    />
                    <Field label="Document Status" value={doc?.status} />

                    <div style={{ gridColumn: "1 / -1", minWidth: 0 }}>
                      <div style={labelStyle}>Verification Document</div>
                      <DocumentPreview
                        path={
                          doc?.url ||
                          doc?.documentUrl ||
                          doc?.photoUrl
                        }
                        label={`Verification document ${index + 1}`}
                      />
                    </div>

                    <Field
                      label="Uploaded At"
                      value={formatDate(doc?.uploadedAt, true)}
                    />
                    <Field
                      label="Verified At"
                      value={formatDate(doc?.verifiedAt, true)}
                    />
                  </FieldGrid>
                </div>
              ))}
            </div>
          ) : (
            <div style={valueStyle}>
              No verification documents available.
            </div>
          )}
        </Section>

        <Section
          title="Notification Settings"
          description="Notification toggles and user preferences."
          icon={<FaBell />}
        >
          <FieldGrid>
            <Field
              label="Push Notifications Enabled"
              value={display(notificationSettings.pushEnabled)}
            />
            <Field
              label="Schedule Reminders"
              value={display(alertTypes.scheduleReminders)}
            />
            <Field
              label="License Expiry Alerts"
              value={display(alertTypes.licenseExpiry)}
            />
            <Field
              label="Message Alerts"
              value={display(alertTypes.messages)}
            />
            <Field
              label="App Updates"
              value={display(alertTypes.appUpdates)}
            />
            <Field
              label="Sound Preference"
              value={notificationPreferences.sound}
            />
            <Field
              label="Vibration Enabled"
              value={display(notificationPreferences.vibration)}
            />
          </FieldGrid>
        </Section>

        <Section
          title="Availability"
          description="Availability date slots supplied by the provider record."
        >
          {Array.isArray(info.availabilityDateSlots) &&
          info.availabilityDateSlots.length ? (
            <div style={{ display: "grid", gap: 12 }}>
              {info.availabilityDateSlots.map(
                (slot: any, index: number) => (
                  <div key={slot?._id || index} style={listBox}>
                    <h3 style={smallTitle}>
                      Availability Slot {index + 1}
                    </h3>

                    <FieldGrid>
                      <Field label="Date" value={formatDate(slot?.date)} />
                      <Field label="Start Time" value={slot?.startTime} />
                      <Field label="End Time" value={slot?.endTime} />
                      <Field
                        label="Available"
                        value={display(slot?.available)}
                      />
                      <Field
                        label="Timezone"
                        value={
                          slot?.timezone || info.availabilityTimezone
                        }
                      />
                    </FieldGrid>
                  </div>
                )
              )}
            </div>
          ) : (
            <div style={valueStyle}>
              No availability date slots available.
            </div>
          )}
        </Section>
      </div>

      <div
        style={{
          marginTop: 20,
          color: "#98A2B3",
          fontSize: 11,
          lineHeight: 1.6,
        }}
      >
        Passwords, device tokens, full bank account numbers and routing
        numbers are intentionally not displayed.
      </div>

     {/* model */}

     {showReviews && (
  <div
    onClick={closeProviderReviews}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(15, 23, 42, 0.58)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="provider-reviews-title"
      onClick={(event) => event.stopPropagation()}
      style={{
        background: "#FFFFFF",
        borderRadius: 20,
        width: "100%",
        maxWidth: 760,
        maxHeight: "85vh",
        overflow: "hidden",
        boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <h2
            id="provider-reviews-title"
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: colors.navy,
            }}
          >
            Caregiver Reviews
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13,
              color: colors.muted,
            }}
          >
            {reviewSummary?.totalReviews ??
              info.totalReviews ??
              0}{" "}
            total reviews
            {reviewSummary?.averageRating != null
              ? ` · Average ${reviewSummary.averageRating}/5`
              : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={closeProviderReviews}
          aria-label="Close reviews"
          style={{
            border: "none",
            background: "#F1F5F9",
            borderRadius: 10,
            width: 38,
            height: 38,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.navy,
            flexShrink: 0,
          }}
        >
          <FaTimes />
        </button>
      </div>

      <div
        style={{
          padding: 24,
          overflowY: "auto",
          display: "grid",
          gap: 16,
        }}
      >
        {reviewsLoading ? (
          <div
            style={{
              padding: 35,
              textAlign: "center",
              color: colors.muted,
            }}
          >
            Loading reviews...
          </div>
        ) : reviewsError ? (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: "#B42318",
            }}
          >
            <p>{reviewsError}</p>

            <button
              type="button"
              onClick={() => void fetchProviderReviews(reviewPage)}
              style={{
                border: "none",
                background: colors.navy,
                color: "#FFFFFF",
                padding: "9px 16px",
                borderRadius: 9,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div
            style={{
              padding: 35,
              textAlign: "center",
              color: colors.muted,
            }}
          >
            <FaStar
              size={28}
              color="#CBD5E1"
              style={{ marginBottom: 12 }}
            />
            <div style={{ fontWeight: 700, color: colors.navy }}>
              No reviews available
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              This caregiver has no visible reviews yet.
            </div>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div
              key={review._id}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 15,
                padding: 18,
                background: "#FFFFFF",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: colors.navy,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {review.reviewer?.name || "Unknown reviewer"}
                  </div>

                  <div
                    style={{
                      color: colors.muted,
                      fontSize: 12,
                      marginTop: 4,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {review.reviewer?.email || "No email available"}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 3,
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={14}
                        color={
                          star <= (Number(review.rating) || 0)
                            ? "#F4B400"
                            : "#D0D5DD"
                        }
                      />
                    ))}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      marginTop: 5,
                    }}
                  >
                    {formatDate(review.createdAt)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  color: "#344054",
                  fontSize: 14,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {review.comment?.trim() ||
                  "No written comment provided."}
              </div>

              {review.booking && (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: `1px solid ${colors.border}`,
                    fontSize: 12,
                    color: colors.muted,
                    display: "flex",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    Booking:{" "}
                    {String(review.booking._id).slice(-8)}
                  </span>

                  {review.booking.status && (
                    <span>
                      Status: {review.booking.status}
                    </span>
                  )}

                  {review.booking.startDate && (
                    <span>
                      Start: {formatDate(review.booking.startDate)}
                    </span>
                  )}

                  {review.booking.endDate && (
                    <span>
                      End: {formatDate(review.booking.endDate)}
                    </span>
                  )}
                </div>
              )}

              {review.response?.comment && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 10,
                    background: "#F8FAFC",
                    borderLeft: "3px solid #163A5F",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: colors.navy,
                      marginBottom: 5,
                    }}
                  >
                    Caregiver Response
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "#475467",
                      lineHeight: 1.6,
                    }}
                  >
                    {review.response.comment}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {!reviewsLoading &&
        !reviewsError &&
        reviewTotalPages > 1 && (
          <div
            style={{
              padding: "15px 24px",
              borderTop: `1px solid ${colors.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <button
              type="button"
              disabled={reviewPage <= 1}
              onClick={() => void fetchProviderReviews(reviewPage - 1)}
              style={{
                padding: "9px 14px",
                borderRadius: 9,
                border: `1px solid ${colors.border}`,
                background: reviewPage <= 1 ? "#F2F4F7" : "#FFFFFF",
                color: colors.navy,
                cursor: reviewPage <= 1 ? "not-allowed" : "pointer",
                opacity: reviewPage <= 1 ? 0.6 : 1,
              }}
            >
              Previous
            </button>

            <span
              style={{
                fontSize: 13,
                color: colors.muted,
              }}
            >
              Page {reviewPage} of {reviewTotalPages}
            </span>

            <button
              type="button"
              disabled={reviewPage >= reviewTotalPages}
              onClick={() => void fetchProviderReviews(reviewPage + 1)}
              style={{
                padding: "9px 14px",
                borderRadius: 9,
                border: `1px solid ${colors.border}`,
                background:
                  reviewPage >= reviewTotalPages
                    ? "#F2F4F7"
                    : colors.navy,
                color:
                  reviewPage >= reviewTotalPages
                    ? colors.navy
                    : "#FFFFFF",
                cursor:
                  reviewPage >= reviewTotalPages
                    ? "not-allowed"
                    : "pointer",
                opacity: reviewPage >= reviewTotalPages ? 0.6 : 1,
              }}
            >
              Next
            </button>
          </div>
        )}
    </div>
  </div>
)}
    </div>
  );
};

export default ProviderDetails;
