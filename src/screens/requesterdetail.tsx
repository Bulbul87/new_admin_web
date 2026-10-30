
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhone, FaCheckCircle, FaUserCircle, FaStar, FaTimes } from "react-icons/fa";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getAllUsers, getProfileImage, getAdminUserReviews } from "../service/admin.service";
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

  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewPage, setReviewPage] = useState(1);
  const [hasNextReviewPage, setHasNextReviewPage] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<any>(null);

  const fetchRequesterReviews = async (page = 1) => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      setReviewsError("");
      const response: any = await getAdminUserReviews(id, "requester", page, 10);
      const reviewList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.reviews)
            ? response.reviews
            : [];
      setReviews(reviewList);
      setReviewSummary(response?.summary || response?.profile?.summary || null);
      setReviewPage(page);
      const totalPages = Number(response?.pagination?.totalPages);
      setHasNextReviewPage(
        Number.isFinite(totalPages) && totalPages > 0
          ? page < totalPages
          : reviewList.length === 10
      );
    } catch (error: any) {
      console.error("Failed to fetch requester reviews:", error);
      setReviewsError(error?.message || "Unable to load reviews. Please try again.");
      setReviews([]);
      setHasNextReviewPage(false);
    } finally {
      setReviewsLoading(false);
    }
  };

  const openRequesterReviews = () => {
    setShowReviews(true);
    setReviewPage(1);
    fetchRequesterReviews(1);
  };

  const closeRequesterReviews = () => {
    setShowReviews(false);
    setReviewsError("");
  };

  const formatReviewDate = (value: any) => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Date unavailable"
      : date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

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
          <p style={{ margin: 0, color: "#14344A", overflowWrap: "anywhere" }}>{requester.requestorInfo?.publicRequesterId || ""}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 14, flexWrap: "wrap" }}>
            <FaStar color="#9A6700" />
            <span style={{ color: "#14344A", fontWeight: 700 }}>
              {reviewSummary?.averageRating ?? requester.rating ?? 0}
            </span>
            <span style={{ color: "#14344A" }}>Rating</span>
            <button
              type="button"
              onClick={openRequesterReviews}
              aria-label="View requester reviews"
              style={{ border: "none", background: "transparent", color: "#14344A", fontWeight: 700, textDecoration: "underline", cursor: "pointer", padding: 0 }}
            >
              {reviewSummary?.totalReviews ?? requester.totalReviews ?? requester.reviewCount ?? 0} reviews
            </button>
          </div>
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
   

    

     

   

      {showReviews && (
        <div
          role="presentation"
          onClick={closeRequesterReviews}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.58)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="requester-reviews-title"
            onClick={(event) => event.stopPropagation()}
            style={{ width: "100%", maxWidth: 760, maxHeight: "88vh", overflow: "hidden", background: "#fff", borderRadius: 20, boxShadow: "0 24px 70px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px 24px", borderBottom: "1px solid #e8edf3", background: "linear-gradient(110deg, #f3fbff, #fffde7)" }}>
              <div>
                <h3 id="requester-reviews-title" style={{ margin: 0, color: "#14344A", fontSize: 21, fontWeight: 800 }}>Requester Reviews</h3>
                <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 13 }}>Reviews received by {fullName || "this requester"}</p>
              </div>
              <button type="button" onClick={closeRequesterReviews} aria-label="Close reviews" style={{ width: 38, height: 38, border: "1px solid #dbe4ec", borderRadius: 10, background: "#fff", color: "#14344A", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: 24, overflowY: "auto", minHeight: 220 }}>
              {reviewSummary && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 15, marginBottom: 18, borderRadius: 14, background: "#f5f9fc", border: "1px solid #e5edf4" }}>
                  <FaStar color="#d69e00" size={24} />
                  <div>
                    <div style={{ color: "#14344A", fontWeight: 800, fontSize: 20 }}>{Number(reviewSummary.averageRating || 0).toFixed(1)} / 5</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>{reviewSummary.totalReviews ?? 0} total reviews</div>
                  </div>
                </div>
              )}

              {reviewsLoading ? (
                <div style={{ minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", gap: 10 }}>
                  <div className="spinner-border" /><span>Loading reviews...</span>
                </div>
              ) : reviewsError ? (
                <div style={{ padding: 18, borderRadius: 12, background: "#fff1f2", color: "#be123c", textAlign: "center" }}>
                  {reviewsError}
                  <div style={{ marginTop: 12 }}>
                    <button type="button" onClick={() => fetchRequesterReviews(reviewPage)} style={{ border: "none", borderRadius: 8, padding: "9px 15px", background: "#14344A", color: "#fff", cursor: "pointer" }}>Try Again</button>
                  </div>
                </div>
              ) : reviews.length === 0 ? (
                <div style={{ padding: "48px 16px", textAlign: "center", color: "#64748b" }}>
                  <FaStar size={28} color="#cbd5e1" />
                  <p style={{ margin: "12px 0 0", fontWeight: 600 }}>No reviews found for this requester.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  {reviews.map((review: any, index: number) => {
                    const reviewer = review.reviewer || review.reviewedBy || review.user || {};
                    const reviewerName = [reviewer.firstName, reviewer.middleName, reviewer.lastName].filter(Boolean).join(" ") || reviewer.name || review.reviewerName || "Anonymous";
                    const rating = Math.max(0, Math.min(5, Number(review.rating || 0)));
                    return (
                      <div key={review._id || review.id || `${reviewPage}-${index}`} style={{ border: "1px solid #e5edf4", borderRadius: 14, padding: 17, background: "#fff" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ color: "#14344A", fontWeight: 800 }}>{reviewerName}</div>
                            {reviewer.email && <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>{reviewer.email}</div>}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
                              {[1, 2, 3, 4, 5].map((star) => <FaStar key={star} color={star <= rating ? "#eab308" : "#dbe2ea"} size={15} />)}
                            </div>
                            <div style={{ color: "#64748b", fontSize: 12, marginTop: 5 }}>{formatReviewDate(review.createdAt || review.updatedAt)}</div>
                          </div>
                        </div>
                        <p style={{ margin: "14px 0 0", color: "#334155", fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                          {review.comment || review.review || "No written comment provided."}
                        </p>
                        {review.booking && (
                          <div style={{ marginTop: 12, padding: "9px 11px", borderRadius: 9, background: "#f8fafc", color: "#475569", fontSize: 12 }}>
                            <strong>Booking:</strong> {typeof review.booking === "object" ? (review.booking.bookingId || review.booking._id || "Booking details available") : review.booking}
                          </div>
                        )}
                        {review.response?.comment && (
                          <div style={{ marginTop: 13, borderLeft: "3px solid #8FDAFA", padding: "9px 12px", background: "#f5fbff", borderRadius: "0 9px 9px 0" }}>
                            <div style={{ color: "#14344A", fontWeight: 700, fontSize: 12, marginBottom: 5 }}>Response</div>
                            <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.5 }}>{review.response.comment}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "15px 24px", borderTop: "1px solid #e8edf3" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Page {reviewPage}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" disabled={reviewPage <= 1 || reviewsLoading} onClick={() => fetchRequesterReviews(reviewPage - 1)} style={{ padding: "9px 14px", borderRadius: 9, border: "1px solid #dbe4ec", background: reviewPage <= 1 ? "#f1f5f9" : "#fff", color: "#14344A", cursor: reviewPage <= 1 || reviewsLoading ? "not-allowed" : "pointer", opacity: reviewPage <= 1 ? 0.55 : 1 }}>Previous</button>
                <button type="button" disabled={!hasNextReviewPage || reviewsLoading} onClick={() => fetchRequesterReviews(reviewPage + 1)} style={{ padding: "9px 14px", borderRadius: 9, border: "1px solid #14344A", background: !hasNextReviewPage ? "#e2e8f0" : "#14344A", color: !hasNextReviewPage ? "#64748b" : "#fff", cursor: !hasNextReviewPage || reviewsLoading ? "not-allowed" : "pointer" }}>Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RequesterDetails;