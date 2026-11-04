
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./bookinghistory.css";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  UserRound,
  BriefcaseBusiness,
  CheckCircle2,
  XCircle,
  Ban,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  Activity,
  RefreshCw,
  Hash,
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
      return String(
        value._id ||
        value.id ||
        value.bookingId ||
        value.$oid ||
        ""
      );
    }

    return String(value);
  };

  const getName = (person?: AnyRecord | string | null): string => {
    if (!person) return "Not Available";

    if (typeof person === "string") return person;

    const fullName = [
      person.firstName,
      person.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      fullName ||
      person.name ||
      person.fullName ||
      person.email ||
      "Not Available"
    );
  };

  const formatDate = (date?: any): string => {
    if (!date) return "Not Available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date);
    }

    return parsed.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: any): string => {
    if (!date) return "Not Available";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return String(date);
    }

    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatStatus = (status?: string): string => {
    if (!status) return "Not Available";

    return String(status)
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
        "Not Available"
      );
    }

    return String(value);
  };

  const getStatusColor = (status?: string) => {
    const value = (status || "").toLowerCase();

    if (
      value.includes("complete") ||
      value.includes("accepted")
    ) {
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

  const getPerson = (person: any): AnyRecord => {
    if (!person || typeof person !== "object") {
      return {};
    }

    return person;
  };

  const getScheduledTime = (value: any) => {
    if (!value) {
      return { start: "", end: "" };
    }

    if (typeof value === "string") {
      return { start: value, end: "" };
    }

    return {
      start:
        value.start ||
        value.startTime ||
        value.from ||
        "",
      end:
        value.end ||
        value.endTime ||
        value.to ||
        "",
    };
  };

  const getAddress = (address: any): string => {
    if (!address) return "";

    if (typeof address === "string") {
      return address;
    }

    return [
      address.address,
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
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
        throw new Error(
          result?.message || "Booking record not found."
        );
      }

      // Supports both { data: booking } and { data: { booking } }
      const record =
        result.data.booking ||
        result.data;

      if (!record || typeof record !== "object") {
        throw new Error("Invalid booking detail response.");
      }

      setBooking(record);

      console.log("Booking Detail:", record);
    } catch (err: any) {
      console.error("Booking detail error:", err);

      setBooking(null);
      setError(
        err?.message || "Failed to load booking details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookingDetail();
  }, [fetchBookingDetail]);

  // ==========================================
  // NORMALIZED BOOKING DATA
  // ==========================================

  const requestor = getPerson(
    booking?.requestor ||
    booking?.requestorInfo ||
    booking?.requester ||
    booking?.user
  );

  const provider = getPerson(
    booking?.provider ||
    booking?.caregiver ||
    booking?.providerInfo
  );

  const service = getPerson(
    booking?.service ||
    booking?.serviceInfo
  );

  const scheduledTime = getScheduledTime(
    booking?.scheduledTime
  );

  const cancellation = booking?.cancellation || {};

  const visits = Array.isArray(booking?.visits)
    ? booking.visits
    : Array.isArray(booking?.bookingVisits)
    ? booking.bookingVisits
    : [];

  const status = booking?.status || booking?.type || "";

  const statusStyle = getStatusColor(status);

  const serviceName =
    service.name ||
    service.serviceName ||
    booking?.serviceName;

  const bookingId =
    getId(booking?._id) ||
    getId(booking?.id) ||
    getId(booking?.bookingId) ||
    id;

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

      <div className="bd-section-content">
        {children}
      </div>
    </section>
  );

  const DetailItem = ({
    label,
    value,
    icon: Icon,
  }: {
    label: string;
    value: any;
    icon?: React.ElementType;
  }) => (
    <div className="bd-detail-item">
      <span className="bd-detail-label">
        {Icon && <Icon size={14} />}
        {label}
      </span>

      <strong className="bd-detail-value">
        {formatValue(value)}
      </strong>
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
          <Icon size={25} />
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
          <span>
            {person.phone ||
              person.phoneNumber ||
              person.mobileNumber ||
              "Not Available"}
          </span>
        </div>

        <div>
          <Hash size={15} />
          <span>
            ID: {getId(person._id || person.id) || "Not Available"}
          </span>
        </div>
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

        <style>{styles}</style>
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

          <p>
            {error || "No booking information is available."}
          </p>

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

        <style>{styles}</style>
      </div>
    );
  }

  // ==========================================
  // MAIN DETAIL UI
  // ==========================================

  return (
    <div className="bd-page">
      <div className="bd-container">

        {/* TOP NAVIGATION */}

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

              <div className="bd-booking-id">
                <Hash size={15} />
                <span>Booking ID: {bookingId}</span>
              </div>
            </div>
          </div>

          <div className="bd-hero-status">
            <span className="bd-status-label">
              CURRENT STATUS
            </span>

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

        {/* QUICK SUMMARY */}

        <div className="bd-summary-grid">

          <div className="bd-summary-card">
            <div className="bd-summary-icon blue">
              <BriefcaseBusiness size={21} />
            </div>

            <div>
              <span>Service</span>
              <strong>{formatValue(serviceName)}</strong>
            </div>
          </div>

          <div className="bd-summary-card">
            <div className="bd-summary-icon purple">
              <CalendarCheck size={21} />
            </div>

            <div>
              <span>Scheduled Date</span>
              <strong>
                {formatDate(booking?.scheduledDate)}
              </strong>
            </div>
          </div>

          <div className="bd-summary-card">
            <div className="bd-summary-icon orange">
              <Clock3 size={21} />
            </div>

            <div>
              <span>Scheduled Time</span>
              <strong>
                {scheduledTime.start || "—"}
                {scheduledTime.end
                  ? ` - ${scheduledTime.end}`
                  : ""}
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
                {booking?.isMultiDay
                  ? "Multi-Day"
                  : "One-Time"}
              </strong>
            </div>
          </div>

        </div>

        {/* REQUESTER AND CAREGIVER */}

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
            role="CAREGIVER"
            icon={UserCheck}
          />
        </div>

        {/* SERVICE INFORMATION */}

        <Section
          title="Service Information"
          icon={BriefcaseBusiness}
        >
          <div className="bd-details-grid">

            <DetailItem
              label="Service Name"
              value={serviceName}
            />

            <DetailItem
              label="Service ID"
              value={
                service._id ||
                service.id ||
                booking?.serviceId
              }
            />

            <DetailItem
              label="Category"
              value={
                service.categoryName ||
                service.category?.name ||
                booking?.categoryName
              }
            />

            <DetailItem
              label="Booking Type"
              value={
                booking?.isMultiDay
                  ? "Multi-Day"
                  : "One-Time"
              }
            />

            <DetailItem
              label="Minimum Hours"
              value={service.minHours || booking?.minHours}
            />

            <DetailItem
              label="Total Hours"
              value={
                booking?.totalHours ||
                booking?.hours ||
                booking?.durationHours
              }
            />

            <DetailItem
              label="Service Status"
              value={status}
            />

            <DetailItem
              label="Response Type"
              value={booking?.type}
            />

          </div>
        </Section>

        {/* SCHEDULE INFORMATION */}

        <Section
          title="Schedule & Visit Information"
          icon={CalendarDays}
        >
          <div className="bd-details-grid">

            <DetailItem
              label="Scheduled Date"
              value={formatDate(booking?.scheduledDate)}
            />

            <DetailItem
              label="Start Time"
              value={scheduledTime.start}
            />

            <DetailItem
              label="End Time"
              value={scheduledTime.end}
            />

            <DetailItem
              label="Start Date"
              value={formatDate(
                booking?.startDate ||
                booking?.scheduledDate
              )}
            />

            <DetailItem
              label="End Date"
              value={formatDate(booking?.endDate)}
            />

            <DetailItem
              label="Multi-Day Booking"
              value={booking?.isMultiDay}
            />

            <DetailItem
              label="Created At"
              value={formatDateTime(booking?.createdAt)}
            />

            <DetailItem
              label="Updated At"
              value={formatDateTime(booking?.updatedAt)}
            />

          </div>

          {booking?.address && (
            <div className="bd-address">
              <MapPin size={18} />
              <div>
                <span>Service Address</span>
                <strong>
                  {getAddress(booking.address) || "Not Available"}
                </strong>
              </div>
            </div>
          )}
        </Section>

        {/* RESPONSE INFORMATION */}

        <Section
          title="Caregiver Response Information"
          icon={ClipboardList}
        >
          <div className="bd-details-grid">

            <DetailItem
              label="Response Status"
              value={booking?.type}
            />

            <DetailItem
              label="Response Date"
              value={formatDateTime(booking?.responseAt)}
            />

            <DetailItem
              label="Accepted At"
              value={formatDateTime(
                booking?.providerAcceptedAt ||
                booking?.acceptedAt
              )}
            />

            <DetailItem
              label="Rejected At"
              value={formatDateTime(booking?.rejectedAt)}
            />

            <DetailItem
              label="Response Reason"
              value={
                booking?.responseReason ||
                booking?.rejectionReason ||
                booking?.reason
              }
            />

          </div>
        </Section>

        {/* VISITS */}

        <Section
          title={`Visit History (${visits.length})`}
          icon={Activity}
        >
          {visits.length > 0 ? (
            <div className="bd-visit-list">
              {visits.map(
                (visit: AnyRecord, index: number) => {
                  const visitTime = getScheduledTime(
                    visit.scheduledTime
                  );

                  return (
                    <div
                      className="bd-visit-card"
                      key={visit._id || visit.id || index}
                    >
                      <div className="bd-visit-number">
                        {index + 1}
                      </div>

                      <div className="bd-visit-content">
                        <h4>Visit {index + 1}</h4>

                        <div className="bd-visit-grid">

                          <DetailItem
                            label="Visit Date"
                            value={formatDate(
                              visit.date ||
                              visit.visitDate ||
                              visit.scheduledDate
                            )}
                          />

                          <DetailItem
                            label="Start Time"
                            value={
                              visit.startTime ||
                              visitTime.start ||
                              visit.startedAt
                            }
                          />

                          <DetailItem
                            label="End Time"
                            value={
                              visit.endTime ||
                              visitTime.end ||
                              visit.endedAt
                            }
                          />

                          <DetailItem
                            label="Status"
                            value={visit.status}
                          />

                          <DetailItem
                            label="Access Code"
                            value={visit.accessCode}
                          />

                          <DetailItem
                            label="Access Code Used"
                            value={visit.accessCodeUsed}
                          />

                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="bd-no-data">
              <Info size={19} />
              No visit records available in this API response.
            </div>
          )}
        </Section>

        {/* COMPLETION INFORMATION */}

        <Section
          title="Completion Information"
          icon={CheckCircle2}
        >
          <div className="bd-details-grid">

            <DetailItem
              label="Booking Status"
              value={status}
            />

            <DetailItem
              label="Completed At"
              value={formatDateTime(booking?.completedAt)}
            />

            <DetailItem
              label="Service Started At"
              value={formatDateTime(
                booking?.startedAt ||
                booking?.startTime
              )}
            />

            <DetailItem
              label="Service Ended At"
              value={formatDateTime(
                booking?.endedAt ||
                booking?.endTime
              )}
            />

          </div>
        </Section>

        {/* CANCELLATION INFORMATION */}

        {booking?.cancellation && (
          <Section
            title="Cancellation Information"
            icon={Ban}
          >
            <div className="bd-cancellation-box">

              <div className="bd-cancellation-heading">
                <div className="bd-cancellation-icon">
                  <XCircle size={22} />
                </div>

                <div>
                  <h3>Booking Cancelled</h3>
                  <span>
                    {formatDateTime(cancellation.cancelledAt)}
                  </span>
                </div>
              </div>

              <div className="bd-details-grid">

                <DetailItem
                  label="Cancelled By"
                  value={cancellation.cancelledBy}
                />

                <DetailItem
                  label="Cancellation Reason"
                  value={cancellation.reason}
                />

                <DetailItem
                  label="Cancelled At"
                  value={formatDateTime(cancellation.cancelledAt)}
                />

              </div>
            </div>
          </Section>
        )}

        {/* PAYMENT INFORMATION */}

        <Section
          title="Payment Information"
          icon={CreditCard}
        >
          <div className="bd-details-grid">

            <DetailItem
              label="Total Amount"
              value={
                booking?.totalAmount ??
                booking?.totalPrice ??
                booking?.amount
              }
            />

            <DetailItem
              label="Requester Price"
              value={booking?.requesterPrice}
            />

            <DetailItem
              label="Provider Price"
              value={booking?.providerPrice}
            />

            <DetailItem
              label="Tax"
              value={booking?.Tax ?? booking?.tax}
            />

            <DetailItem
              label="Payment Status"
              value={booking?.paymentStatus}
            />

            <DetailItem
              label="Payment Method"
              value={booking?.paymentMethod}
            />

            <DetailItem
              label="Transaction ID"
              value={
                booking?.transactionId ||
                booking?.paymentIntentId
              }
            />

          </div>
        </Section>

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

      <style>{styles}</style>
    </div>
  );
};

// ======================================================
// PREMIUM BOOKING DETAIL PAGE STYLES
// ======================================================

const styles = `
* {
  box-sizing: border-box;
}

.bd-page {
  margin-left: 260px;
  margin-top: 70px;
  min-height: calc(100vh - 70px);
  padding: 32px;
  background: #f4f7fb;
  color: #17324d;
  font-family: inherit;
}

.bd-container {
  max-width: 1500px;
  margin: 0 auto;
}

.bd-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.bd-back-btn,
.bd-refresh-btn,
.bd-retry-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid #dce5ef;
  border-radius: 10px;
  background: #fff;
  color: #23435f;
  padding: 11px 16px;
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
  transition: .2s;
}

.bd-back-btn:hover,
.bd-refresh-btn:hover,
.bd-retry-btn:hover {
  background: #edf5fb;
  border-color: #a9c4dc;
  transform: translateY(-1px);
}

.bd-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(115deg, #14344a, #1c5374 65%, #277c91);
  border-radius: 19px;
  padding: 30px 32px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  box-shadow: 0 12px 30px rgba(20,52,74,.15);
}

.bd-hero::after {
  content: "";
  position: absolute;
  width: 290px;
  height: 290px;
  border: 1px solid rgba(255,255,255,.10);
  border-radius: 50%;
  right: 120px;
  top: -170px;
}

.bd-hero-content {
  display: flex;
  align-items: flex-start;
  gap: 19px;
  position: relative;
  z-index: 1;
}

.bd-hero-icon {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.20);
  flex-shrink: 0;
}

.bd-hero-text > span {
  color: #b9e7f2;
  font-size: 10px;
  letter-spacing: 2px;
  font-weight: 800;
}

.bd-hero-text h1 {
  margin: 7px 0;
  font-size: 29px;
  font-weight: 750;
  letter-spacing: -.6px;
}

.bd-hero-text p {
  color: #d2e6ef;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}

.bd-booking-id {
  margin-top: 14px;
  display: inline-flex;
  gap: 7px;
  align-items: center;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.15);
  padding: 7px 11px;
  border-radius: 7px;
  font-size: 12px;
  color: #fff;
  word-break: break-all;
}

.bd-hero-status {
  position: relative;
  z-index: 1;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.bd-status-label {
  font-size: 10px;
  letter-spacing: 1.4px;
  color: #c5e2ec;
  font-weight: 800;
}

.bd-status-badge {
  border: 1px solid;
  padding: 9px 16px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 750;
}

.bd-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 17px;
  margin: 22px 0;
}

.bd-summary-card {
  display: flex;
  align-items: center;
  gap: 13px;
  background: #fff;
  padding: 19px;
  border: 1px solid #e8edf3;
  border-radius: 13px;
  box-shadow: 0 3px 12px rgba(20,52,74,.035);
  min-width: 0;
}

.bd-summary-icon {
  width: 43px;
  height: 43px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bd-summary-icon.blue {
  color: #2563eb;
  background: #eaf1ff;
}

.bd-summary-icon.purple {
  color: #7c3aed;
  background: #f1eaff;
}

.bd-summary-icon.orange {
  color: #d97706;
  background: #fff3df;
}

.bd-summary-icon.green {
  color: #15803d;
  background: #e8f8ed;
}

.bd-summary-card div:last-child {
  min-width: 0;
}

.bd-summary-card span {
  display: block;
  color: #8191a4;
  font-size: 11px;
  margin-bottom: 5px;
  font-weight: 600;
}

.bd-summary-card strong {
  display: block;
  color: #183a55;
  font-size: 13px;
  font-weight: 750;
  overflow-wrap: anywhere;
}

.bd-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 19px;
  margin-bottom: 20px;
}

.bd-person-card {
  background: #fff;
  border: 1px solid #e7edf3;
  border-radius: 15px;
  padding: 23px;
  box-shadow: 0 3px 12px rgba(20,52,74,.035);
}

.bd-person-top {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 18px;
  border-bottom: 1px solid #edf1f5;
}

.bd-person-avatar {
  height: 51px;
  width: 51px;
  background: linear-gradient(140deg, #e1f1fa, #dbeafe);
  color: #1b5474;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
}

.bd-person-role {
  color: #8797a8;
  font-size: 10px;
  letter-spacing: 1.4px;
  font-weight: 800;
}

.bd-person-top h3 {
  color: #173b56;
  margin: 5px 0 0;
  font-size: 17px;
  font-weight: 750;
  overflow-wrap: anywhere;
}

.bd-person-details {
  display: grid;
  gap: 13px;
  padding-top: 17px;
}

.bd-person-details div {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #687e91;
  overflow-wrap: anywhere;
}

.bd-person-details svg {
  color: #54809e;
  flex-shrink: 0;
}

.bd-section {
  background: #fff;
  border: 1px solid #e7edf3;
  border-radius: 15px;
  padding: 23px;
  margin-bottom: 19px;
  box-shadow: 0 3px 12px rgba(20,52,74,.035);
}

.bd-section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid #edf1f5;
  margin-bottom: 20px;
}

.bd-section-icon {
  height: 38px;
  width: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1c607e;
  background: #eaf4f9;
}

.bd-section-heading h2 {
  margin: 0;
  color: #183b56;
  font-size: 16px;
  font-weight: 750;
}

.bd-details-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 25px;
  row-gap: 22px;
}

.bd-detail-item {
  min-width: 0;
}

.bd-detail-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #8292a3;
  margin-bottom: 7px;
}

.bd-detail-label svg {
  color: #7190a6;
}

.bd-detail-value {
  display: block;
  font-size: 13px;
  font-weight: 650;
  color: #29465e;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.bd-address {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f4f8fb;
  border: 1px solid #e5edf3;
  padding: 15px;
  border-radius: 10px;
  margin-top: 22px;
}

.bd-address svg {
  color: #27738d;
  flex-shrink: 0;
}

.bd-address span,
.bd-address strong {
  display: block;
}

.bd-address span {
  color: #8394a4;
  font-size: 11px;
  margin-bottom: 5px;
}

.bd-address strong {
  color: #29465e;
  font-size: 12px;
  line-height: 1.6;
}

.bd-visit-list {
  display: grid;
  gap: 15px;
}

.bd-visit-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 18px;
  border: 1px solid #e6edf3;
  border-radius: 12px;
  background: #fbfdff;
}

.bd-visit-number {
  height: 35px;
  width: 35px;
  background: #e8f3f8;
  color: #1d627e;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
}

.bd-visit-content {
  flex: 1;
  min-width: 0;
}

.bd-visit-content h4 {
  margin: 2px 0 17px;
  color: #1d405b;
  font-size: 14px;
}

.bd-visit-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.bd-no-data {
  padding: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px dashed #d7e2eb;
  border-radius: 10px;
  background: #fafcff;
  color: #8292a3;
  font-size: 13px;
}

.bd-cancellation-box {
  background: #fffafa;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  padding: 19px;
}

.bd-cancellation-heading {
  display: flex;
  gap: 13px;
  align-items: center;
  padding-bottom: 19px;
  margin-bottom: 20px;
  border-bottom: 1px solid #fce7e7;
}

.bd-cancellation-icon {
  height: 42px;
  width: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  background: #fee2e2;
}

.bd-cancellation-heading h3 {
  color: #b42323;
  font-size: 14px;
  margin: 0 0 5px;
}

.bd-cancellation-heading span {
  color: #a36a6a;
  font-size: 11px;
}

.bd-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 18px 21px;
  border: 1px solid #e5edf3;
  background: #fff;
  border-radius: 13px;
}

.bd-footer > div:first-child {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #315c75;
  font-size: 13px;
  font-weight: 750;
}

.bd-footer-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  font-size: 10px;
  color: #8292a3;
  overflow-wrap: anywhere;
}

.bd-loading {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: #1c5572;
  text-align: center;
}

.bd-loading h3 {
  font-size: 18px;
  margin: 5px 0 0;
}

.bd-loading p {
  color: #8292a3;
  font-size: 13px;
  margin: 0;
}

.bd-spin {
  animation: bdRotate 1s linear infinite;
}

@keyframes bdRotate {
  to {
    transform: rotate(360deg);
  }
}

.bd-error {
  max-width: 550px;
  margin: 100px auto;
  background: #fff;
  border: 1px solid #e7edf3;
  padding: 40px 30px;
  border-radius: 17px;
  text-align: center;
  box-shadow: 0 10px 35px rgba(20,52,74,.07);
}

.bd-error-icon {
  height: 65px;
  width: 65px;
  margin: 0 auto 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #dc5555;
  background: #fff0f0;
  border-radius: 17px;
}

.bd-error h2 {
  font-size: 19px;
  color: #183b56;
  margin: 0 0 10px;
}

.bd-error p {
  color: #8292a3;
  font-size: 13px;
  line-height: 1.7;
}

.bd-error-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 22px;
}

.bd-retry-btn {
  background: #173f59;
  color: #fff;
  border-color: #173f59;
}

.bd-retry-btn:hover {
  background: #245e7c;
  color: #fff;
}

@media(max-width: 1100px) {
  .bd-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bd-details-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media(max-width: 700px) {
  .bd-page {
    margin-left: 0;
    padding: 16px 12px 30px;
  }

  .bd-hero {
    padding: 22px 17px;
    flex-direction: column;
    align-items: flex-start;
  }

  .bd-hero-text h1 {
    font-size: 23px;
  }

  .bd-hero-icon {
    width: 45px;
    height: 45px;
  }

  .bd-hero-content {
    gap: 12px;
  }

  .bd-summary-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .bd-summary-card {
    padding: 12px 10px;
    gap: 9px;
  }

  .bd-summary-icon {
    width: 34px;
    height: 34px;
  }

  .bd-summary-card strong {
    font-size: 11px;
  }

  .bd-two-column {
    grid-template-columns: 1fr;
  }

  .bd-section {
    padding: 16px;
  }

  .bd-details-grid,
  .bd-visit-grid {
    grid-template-columns: 1fr 1fr;
    gap: 18px 12px;
  }

  .bd-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .bd-footer-details {
    align-items: flex-start;
  }

  .bd-topbar {
    gap: 8px;
  }

  .bd-back-btn,
  .bd-refresh-btn {
    padding: 9px 10px;
    font-size: 11px;
  }
}

@media(max-width: 400px) {
  .bd-summary-grid {
    grid-template-columns: 1fr;
  }

  .bd-details-grid,
  .bd-visit-grid {
    grid-template-columns: 1fr;
  }
}
`;

export default BookingsDetailScreen;
