
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./bookingdetails.css";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  UserRound,
  BriefcaseBusiness,
  CheckCircle2,
  Ban,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  Activity,
  RefreshCw,
  CalendarCheck,
  AlertCircle,
  ClipboardList,
  UserCheck,
  Info,
} from "lucide-react";

import { getAdminBookingById } from "../service/adminbookingservice";

type AnyRecord = Record<string, any>;

const BookingsDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<AnyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // HELPERS
  // ==========================================

  const getId = (value: any): string => {
    if (!value) return "";

    if (typeof value === "object") {
      return String(value._id || value.id || value.bookingId || "");
    }

    return String(value);
  };

  const getName = (person?: AnyRecord | string | null): string => {
    if (!person) return "Not Available";
    if (typeof person === "string") return person;

    return (
      [person.firstName, person.lastName].filter(Boolean).join(" ") ||
      person.name ||
      person.fullName ||
      person.email ||
      "Not Available"
    );
  };

  const formatDate = (value: any): string => {
    if (!value) return "Not Available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (value: any): string => {
    if (!value) return "Not Available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatStatus = (value: any): string => {
    if (!value) return "Not Available";

    return String(value)
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "Not Available";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (Array.isArray(value)) {
      return value.length
        ? value.map((item) => formatValue(item)).join(", ")
        : "Not Available";
    }

    if (typeof value === "object") {
      return (
        value.name ||
        value.serviceName ||
        value.firstName ||
        value.title ||
        value.label ||
        value._id ||
        JSON.stringify(value)
      );
    }

    return String(value);
  };

  const formatMoney = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "Not Available";
    }

    const amount = Number(value);

    if (Number.isNaN(amount)) return String(value);

    return `$${amount.toFixed(2)}`;
  };


  const getStatusColor = (status?: string) => {
    const value = (status || "").toLowerCase();

    if (value.includes("complete") || value.includes("accepted")) {
      return {
        background: "#dcfce7",
        color: "#15803d",
        border: "#bbf7d0",
      };
    }

    if (
      value.includes("cancel") ||
      value.includes("reject") ||
      value.includes("no-show")
    ) {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
        border: "#fecaca",
      };
    }

    return {
      background: "#dbeafe",
      color: "#1d4ed8",
      border: "#bfdbfe",
    };
  };

  const getAddress = (address: any): string => {
    if (!address) return "Not Available";
    if (typeof address === "string") return address;

    return [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ") || "Not Available";
  };

  // ==========================================
  // FETCH BOOKING DETAIL
  // ==========================================

  const fetchBookingDetail = useCallback(async () => {
    if (!id) {
      setError("Booking ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const targetId = decodeURIComponent(id);
      const result = await getAdminBookingById(targetId);

      if (!result?.success || !result?.data) {
        throw new Error(result?.message || "Booking record not found.");
      }

      const record = result.data.booking || result.data;

      if (!record || typeof record !== "object") {
        throw new Error("Invalid booking detail response.");
      }

      setBooking(record);
      console.log("Booking Detail:", record);
    } catch (err: any) {
      console.error("Booking detail error:", err);
      setBooking(null);
      setError(err?.message || "Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookingDetail();
  }, [fetchBookingDetail]);

  // ==========================================
  // NORMALIZED DATA
  // ==========================================

  const requestor = booking?.user || {};
  const provider = booking?.provider || {};
  const service = booking?.service || {};

  const pricing = booking?.pricing || {};
  const payment = booking?.payment || {};
  const location = booking?.location || {};
  const address = location?.address || {};

  const scheduledTime = booking?.scheduledTime || {};
  const daySchedules = Array.isArray(booking?.daySchedules)
    ? booking.daySchedules
    : [];

  const visits = Array.isArray(booking?.visits)
    ? booking.visits
    : [];

  const pricingLines = Array.isArray(booking?.pricingLines)
    ? booking.pricingLines
    : [];

  const completionRejection = booking?.completionRejection || {};
  const addTimeRequest = booking?.addTimeRequest || {};

  const status = booking?.status || "";
  const statusStyle = getStatusColor(status);

  const bookingId = getId(booking?._id || booking?.bookingId || id);

  // Dynamic care assessment object
  const careNeedsAssessment = booking?.careNeedsAssessment || {};

  const careAssessmentEntries = Object.entries(careNeedsAssessment);

  // ==========================================
  // REUSABLE UI
  // ==========================================

  const Section = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <section className="bd-section">
      <div className="bd-section-heading">
        <div className="bd-section-icon">
          <Icon size={19} />
        </div>
        <h2>{title}</h2>
      </div>

      <div className="bd-section-content">{children}</div>
    </section>
  );

  const DetailItem = ({
    label,
    value,
  }: {
    label: string;
    value: any;
  }) => (
    <div className="bd-detail-item">
      <span className="bd-detail-label">{label}</span>
      <strong className="bd-detail-value">{formatValue(value)}</strong>
    </div>
  );

  const PersonCard = ({
    person,
    title,
    role,
    icon: Icon,
  }: {
    person: AnyRecord;
    title: string;
    role: string;
    icon: React.ElementType;
  }) => (
    <div className="bd-person-card">
      <div className="bd-person-top">
       <div className="bd-person-avatar">
  {person.profileImage ? (
    <img
      src={`https://api.senioramerica.us${person.profileImage}`}
      alt={getName(person)}
      className="bd-profile-image"
      crossOrigin="anonymous"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <Icon size={25} />
  )}
</div>

        <div>
          <span className="bd-person-role">{role}</span>
          <h3>{title}</h3>
        </div>
      </div>

      <div className="bd-person-details">
        <div>
          <Mail size={15} />
          <span>{person.email || "Not Available"}</span>
        </div>

        <div>
          <Phone size={15} />
          <span>{person.phone || "Not Available"}</span>
        </div>

        {/* <div>
          <Hash size={15} />
          <span>ID: {getId(person._id) || "Not Available"}</span>
        </div> */}

       
      </div>
    </div>
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="bd-page">
        <div className="bd-loading">
          <RefreshCw className="bd-spin" size={32} />
          <h3>Loading Booking Details</h3>
          <p>Please wait while we fetch the booking information.</p>
        </div>
       
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !booking) {
    return (
      <div className="bd-page">
        <div className="bd-error">
          <div className="bd-error-icon">
            <AlertCircle size={34} />
          </div>

          <h2>Booking Details Not Found</h2>
          <p>{error || "No booking information is available."}</p>

          <div className="bd-error-actions">
            <button
              className="bd-back-btn"
              onClick={() => navigate("/booking-history")}
            >
              <ArrowLeft size={17} />
              Back to Booking History
            </button>

            <button
              className="bd-retry-btn"
              onClick={fetchBookingDetail}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
    
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="bd-page">
      <div className="bd-container">

        {/* TOP BAR */}

        <div className="bd-topbar">
          <button
            className="bd-back-btn"
            onClick={() => navigate("/booking-history")}
          >
            <ArrowLeft size={18} />
            Back to Booking History
          </button>

          <button
            className="bd-refresh-btn"
            onClick={fetchBookingDetail}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* HEADER */}

        <div className="bd-hero">
          <div className="bd-hero-content">
            <div className="bd-hero-icon">
              <CalendarDays size={28} />
            </div>

            <div className="bd-hero-text">
              <span>BOOKING MANAGEMENT</span>
              <h1>Booking Details</h1>

              <p>
                Complete booking information, requester,
                caregiver and service history.
              </p>

             
            </div>
          </div>

          <div className="bd-hero-status">
            <span className="bd-status-label">CURRENT STATUS</span>

            <span
              className="bd-status-badge"
              style={{
                background: statusStyle.background,
                color: statusStyle.color,
                borderColor: statusStyle.border,
              }}
            >
              {formatStatus(status)}
            </span>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="bd-summary-grid">
          <div className="bd-summary-card">
            <div className="bd-summary-icon blue">
              <BriefcaseBusiness size={21} />
            </div>
            <div>
              <span>Service</span>
              <strong>{formatValue(service.name)}</strong>
            </div>
          </div>

          <div className="bd-summary-card">
            <div className="bd-summary-icon purple">
              <CalendarCheck size={21} />
            </div>
            <div>
              <span>Scheduled Date</span>
              <strong>{formatDate(booking.scheduledDate)}</strong>
            </div>
          </div>

          <div className="bd-summary-card">
            <div className="bd-summary-icon orange">
              <Clock3 size={21} />
            </div>
            <div>
              <span>Scheduled Time</span>
              <strong>
                {scheduledTime.start || "—"} - {scheduledTime.end || "—"}
              </strong>
            </div>
          </div>

          <div className="bd-summary-card">
            <div className="bd-summary-icon green">
              <Activity size={21} />
            </div>
            <div>
              <span>Booking Type</span>
              <strong>
                {booking.isMultiDaySeries ? "Multi-Day" : "One-Time"}
              </strong>
            </div>
          </div>
        </div>

        {/* REQUESTER AND PROVIDER */}

        <div className="bd-two-column">
          <PersonCard
            person={requestor}
            title={getName(requestor)}
            role="REQUESTER"
            icon={UserRound}
          />

          <PersonCard
            person={provider}
            title={getName(provider)}
            role="CARE GIVER"
            icon={UserCheck}
          />
        </div>

        {/* SERVICE INFORMATION */}

        <Section title="Service Information" icon={BriefcaseBusiness}>
          <div className="bd-details-grid">
          
         
            <DetailItem label="Category name" value={service.category} />
            <DetailItem label="Service Description" value={service.description} />
            <DetailItem label="Booking Duration (Minutes)" value={booking.duration} />
            <DetailItem label="Booking Status" value={status} />
         
          </div>
        </Section>

        {/* SCHEDULE INFORMATION */}

        <Section title="Schedule & Visit Information" icon={CalendarDays}>
          <div className="bd-details-grid">
            <DetailItem label="Scheduled Date" value={formatDate(booking.scheduledDate)} />
            <DetailItem label="Start Time" value={scheduledTime.start} />
            <DetailItem label="End Time" value={scheduledTime.end} />
            <DetailItem label="Scheduling Time Zone" value={booking.schedulingTimeZone} />
            <DetailItem label="Repeat Daily" value={booking.repeatDaily} />
            <DetailItem label="Multi-Day Series" value={booking.isMultiDaySeries} />
          
          </div>

          <div className="bd-address">
            <MapPin size={18} />
            <div>
              <span>Service Address</span>
              <strong>{getAddress(address)}</strong>
            </div>
          </div>

          <div className="bd-details-grid" style={{ marginTop: 20 }}>
            <DetailItem label="Latitude" value={location.coordinates?.[1]} />
            <DetailItem label="Longitude" value={location.coordinates?.[0]} />
          </div>

          <h3 style={{ marginTop: 25, marginBottom: 15 }}>
            Day Schedules ({daySchedules.length})
          </h3>

          {daySchedules.length > 0 ? (
            <div className="bd-visit-list">
              {daySchedules.map((day: AnyRecord, index: number) => (
                <div className="bd-visit-card" key={day._id || index}>
                  <div className="bd-visit-number">{index + 1}</div>

                  <div className="bd-visit-content">
                    <h4>Schedule Day {index + 1}</h4>

                    <div className="bd-visit-grid">
                      <DetailItem label="Date" value={formatDate(day.date)} />
                      <DetailItem label="From Time" value={day.fromTime} />
                      <DetailItem label="To Time" value={day.toTime} />
                      <DetailItem label="Duration (Minutes)" value={day.duration} />
                      <DetailItem label="Start UTC" value={formatDateTime(day.startUtc)} />
                      <DetailItem label="End UTC" value={formatDateTime(day.endUtc)} />
                      <DetailItem label="Tasks" value={day.tasks} />
                      <DetailItem label="Pricing Lines" value={day.pricingLines?.length ?? 0} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bd-no-data">No day schedules available.</div>
          )}
        </Section>

        {/* TASKS AND INSTRUCTIONS */}

        <Section title="Tasks & Special Instructions" icon={ClipboardList}>
          <div className="bd-details-grid">
            <DetailItem label="Tasks" value={booking.tasks} />
            <DetailItem label="Special Instructions" value={booking.specialInstructions} />
          </div>
        </Section>

        {/* CARE NEEDS */}

        <Section title="Care Needs Assessment" icon={Info}>
          {careAssessmentEntries.length > 0 ? (
            careAssessmentEntries.map(([key, value]: [string, any]) => (
              <div className="bd-cancellation-box" key={key} style={{ marginBottom: 15 }}>
                <DetailItem label="Assessment ID" value={key} />
                <DetailItem
                  label="Activities Needed"
                  value={value?.multi?.activitiesNeeded}
                />
              </div>
            ))
          ) : (
            <div className="bd-no-data">No care needs assessment available.</div>
          )}
        </Section>

        {/* PROVIDER RESPONSE */}

        <Section title="Care giver Response & Activity Timeline" icon={ClipboardList}>
          <div className="bd-details-grid">
            <DetailItem label="Provider Accepted At" value={formatDateTime(booking.providerAcceptedAt)} />
            <DetailItem label="Provider En Route At" value={formatDateTime(booking.providerEnRouteAt)} />
            <DetailItem label="Provider Arrived At" value={formatDateTime(booking.providerArrivedAt)} />
            <DetailItem label="Provider Started At" value={formatDateTime(booking.providerStartedAt)} />
            <DetailItem label="Completion Requested At" value={formatDateTime(booking.completionRequestedAt)} />
            <DetailItem label="Completed At" value={formatDateTime(booking.completedAt)} />
            <DetailItem label="Completion Auto Approved" value={booking.completionAutoApproved} />
          </div>
        </Section>

        {/* ACCESS CODE */}

        <Section title="Access Code Information" icon={ShieldCheck}>
          <div className="bd-details-grid">
            <DetailItem label="Access Code" value={booking.accessCode} />
            <DetailItem label="Access Code Used" value={booking.accessCodeUsed} />
            <DetailItem label="Failed Attempts" value={booking.accessCodeFailedAttempts} />
            <DetailItem label="Attempt Window Started" value={formatDateTime(booking.accessCodeAttemptWindowStartedAt)} />
            <DetailItem label="Access Code Lock Until" value={formatDateTime(booking.accessCodeLockUntil)} />
          </div>
        </Section>

        {/* VISIT HISTORY */}

        <Section title={`Visit History (${visits.length})`} icon={Activity}>
          {visits.length > 0 ? (
            <div className="bd-visit-list">
              {visits.map((visit: AnyRecord, index: number) => (
                <div className="bd-visit-card" key={visit._id || index}>
                  <div className="bd-visit-number">{index + 1}</div>
                  <div className="bd-visit-content">
                    <h4>Visit {index + 1}</h4>
                    <div className="bd-visit-grid">
                      <DetailItem label="Visit Date" value={formatDate(visit.date || visit.visitDate || visit.scheduledDate)} />
                      <DetailItem label="Start Time" value={visit.startTime || visit.startedAt} />
                      <DetailItem label="End Time" value={visit.endTime || visit.endedAt} />
                      <DetailItem label="Status" value={visit.status} />
                      <DetailItem label="Access Code" value={visit.accessCode} />
                      <DetailItem label="Access Code Used" value={visit.accessCodeUsed} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bd-no-data">
              <Info size={19} />
              No visit records available in this API response.
            </div>
          )}
        </Section>

        {/* COMPLETION INFORMATION */}

        <Section title="Completion Information" icon={CheckCircle2}>
          <div className="bd-details-grid">
            <DetailItem label="Booking Status" value={status} />
            <DetailItem label="Completion Requested At" value={formatDateTime(booking.completionRequestedAt)} />
            <DetailItem label="Completed At" value={formatDateTime(booking.completedAt)} />
            <DetailItem label="Completion Auto Approved" value={booking.completionAutoApproved} />
            <DetailItem label="Completion Rejection Reasons" value={completionRejection.reasons} />
          </div>
        </Section>

        {/* ADD TIME REQUEST */}

        <Section title="Additional Time Request" icon={Clock3}>
          <div className="bd-details-grid">
            <DetailItem label="Request Status" value={addTimeRequest.status} />
            <DetailItem label="Request Details" value={addTimeRequest.reason} />
          </div>
        </Section>

        {/* PRICING BREAKDOWN */}

        <Section title="Pricing Information" icon={CreditCard}>
          <div className="bd-details-grid">
            <DetailItem label="Service Price" value={formatMoney(pricing.servicePrice)} />
            <DetailItem label="Additional Charges" value={formatMoney(pricing.additionalCharges)} />
            <DetailItem label="Discount" value={formatMoney(pricing.discount)} />
            <DetailItem label="Tax" value={formatMoney(pricing.tax)} />
            <DetailItem label="Total Amount" value={formatMoney(pricing.total)} />
            <DetailItem label="Platform Cut Basis" value={formatMoney(pricing.platformCutBasisUsd)} />
            <DetailItem label="Platform Cut From Requester" value={formatMoney(pricing.platformCutFromRequestorUsd)} />
            <DetailItem label="Platform Cut From Care Giver" value={formatMoney(pricing.platformCutFromProviderUsd)} />
            <DetailItem label="Provider Estimated Payout" value={formatMoney(pricing.providerEstimatedPayoutUsd)} />
          </div>

          <h3 style={{ marginTop: 25, marginBottom: 15 }}>
            Pricing Lines ({pricingLines.length})
          </h3>

          {pricingLines.length > 0 ? (
            <div className="bd-visit-list">
              {pricingLines.map((line: AnyRecord, index: number) => (
                <div className="bd-visit-card" key={line._id || index}>
                  <div className="bd-visit-number">{index + 1}</div>
                  <div className="bd-visit-content">
                    <h4>Pricing Line {index + 1}</h4>
                    <div className="bd-visit-grid">
                      <DetailItem label="Service ID" value={line.serviceId} />
                      <DetailItem label="Hours" value={line.hours} />
                      <DetailItem label="Pricing Line ID" value={line._id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bd-no-data">No pricing lines available.</div>
          )}
        </Section>

        {/* PAYMENT INFORMATION */}

        <Section title="Payment Information" icon={CreditCard}>
          <div className="bd-details-grid">
            <DetailItem label="Payment Method" value={payment.method} />
            <DetailItem label="Payment Status" value={payment.status} />
            <DetailItem label="Transaction ID" value={payment.transactionId} />
            <DetailItem label="Paid At" value={formatDateTime(payment.paidAt)} />
            <DetailItem label="Payment Held At" value={formatDateTime(payment.heldAt)} />
            <DetailItem label="Authorization Expires At" value={formatDateTime(payment.authorizationExpiresAt)} />
            <DetailItem label="Payment Hold Required" value={booking.paymentHoldRequired} />
            <DetailItem label="Payment Hold Deadline" value={formatDateTime(booking.paymentHoldDeadline)} />
          </div>
        </Section>

        {/* CANCELLATION */}

        {booking.cancellation && (
          <Section title="Cancellation Information" icon={Ban}>
            <div className="bd-details-grid">
              <DetailItem label="Cancelled By" value={booking.cancellation.cancelledBy} />
              <DetailItem label="Reason" value={booking.cancellation.reason} />
              <DetailItem label="Cancelled At" value={formatDateTime(booking.cancellation.cancelledAt)} />
            </div>
          </Section>
        )}

       

        {/* FOOTER */}

        <div className="bd-footer">
          <div>
            <ShieldCheck size={19} />
            <span>Booking Record Information</span>
          </div>

          <div className="bd-footer-details">
            <span>Booking ID: {bookingId}</span>
            <span>Data Source: Booking Detail API</span>
          </div>
        </div>
      </div>

  
    </div>
  );
};





export default BookingsDetailScreen;
