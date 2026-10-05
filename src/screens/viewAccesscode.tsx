
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  FileText,
  KeyRound,
  Loader2,
  MapPin,
  ShieldCheck,
  User,
  XCircle,
  Activity,
  ClipboardList,
  Timer,
  Mail,
  Hash,
} from "lucide-react";

import {
  getAccessCodeVisit,
  type AccessCodeVisit,
  type PopulatedUser,
  type PopulatedService,
} from "../service/visitaccesscodeservice";

interface ViewAccessCodeProps {
  visitId?: string;
}

const ViewAccessCode: React.FC<ViewAccessCodeProps> = ({
  visitId,
}) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const id = visitId || params.id;

  const [visit, setVisit] = useState<AccessCodeVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVisit = async () => {
      if (!id) {
        setError("Access code visit ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log("Fetching access code visit:", id);

        const data = await getAccessCodeVisit(id);

        console.log("🔥 ACCESS CODE VISIT DATA:", data);
        console.log("🔥 BOOKING:", data?.booking);
        console.log("🔥 REQUESTER:", data?.booking?.user);
        console.log("🔥 PROVIDER:", data?.booking?.provider);
        console.log("🔥 SERVICE:", data?.booking?.service);

        setVisit(data);
      } catch (err: any) {
        console.error("Access code fetch error:", err);

        setError(
          err?.message || "Failed to load access code details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadVisit();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatMoney = (value?: number) => {
    if (value === undefined || value === null) {
      return "$0.00";
    }

    return `$${Number(value).toFixed(2)}`;
  };

  /* ========================================================= */
  /* USER / SERVICE HELPERS */
  /* ========================================================= */

const getUserName = (
  user?: PopulatedUser | string
): string => {
  if (!user) return "-";

  if (typeof user === "string") {
    return user;
  }

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.firstName?.trim() || user.lastName?.trim() || "-";
};

  const getUserEmail = (
 user?: PopulatedUser | string
  ): string => {
    if (!user || typeof user === "string") {
      return "-";
    }

    return user.email || "-";
  };

  const getUserId = (
    user?: PopulatedUser | string
  ): string => {
    if (!user) {
      return "-";
    }

    if (typeof user === "string") {
      return user;
    }

    return user._id || "-";
  };

  const getServiceName = (
    service?: PopulatedService | string
  ): string => {
    if (!service) {
      return "-";
    }

    if (typeof service === "string") {
      return service;
    }

    return (
      service.name||
      "-"
    );
  };

  const getServiceId = (
    service?: PopulatedService | string
  ): string => {
    if (!service) {
      return "-";
    }

    if (typeof service === "string") {
      return service;
    }

    return service._id  ||  service.name|| "-";
  };

  const getStatusStyle = (status?: string) => {
    const value = status?.toLowerCase();

    if (
      value === "completed" ||
      value === "confirmed" ||
      value === "arrived"
    ) {
      return {
        background: "#EAF8F0",
        color: "#16834B",
      };
    }

    if (
      value === "in-progress" ||
      value === "en-route" ||
      value === "scheduled"
    ) {
      return {
        background: "#EEF4FF",
        color: "#315EA8",
      };
    }

    if (
      value === "cancelled" ||
      value === "disputed" ||
      value === "no-show"
    ) {
      return {
        background: "#FFF0F0",
        color: "#D64545",
      };
    }

    return {
      background: "#F2F4F7",
      color: "#667085",
    };
  };

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingContainer}>
          <Loader2
            size={32}
            style={{
              animation: "spin 1s linear infinite",
              color: "#14344A",
            }}
          />

          <p style={loadingText}>
            Loading access code details...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ERROR
   */
  if (error || !visit) {
    return (
      <div style={pageStyle}>
        <div style={errorCard}>
          <XCircle size={40} color="#D64545" />

          <h3 style={errorTitle}>
            Unable to load visit
          </h3>

          <p style={errorText}>
            {error || "Access code visit not found."}
          </p>

          <button
            onClick={handleBack}
            style={backButton}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        </div>
      </div>
    );
  }

  const address = visit.booking?.location?.address;

  const locationText = [
    address?.street,
    address?.city,
    address?.state,
    address?.zipCode,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const statusStyle = getStatusStyle(visit.status);

  return (
    <div style={pageStyle}>

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div style={headerRow}>
        <div>
          <div style={titleRow}>
            <div style={headerIcon}>
              <KeyRound size={21} />
            </div>

            <div>
              <h2 style={pageTitle}>
                Visit Access Code
              </h2>

              <p style={pageSubtitle}>
                Complete access code and visit information
              </p>
            </div>
          </div>
        </div>

        <div style={headerActions}>
          <button
            onClick={handleBack}
            style={backButton}
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <span
            style={{
              ...statusBadge,
              background: statusStyle.background,
              color: statusStyle.color,
            }}
          >
            <Activity size={13} />

            {visit.status
              ?.replace("-", " ")
              .toUpperCase() || "UNKNOWN"}
          </span>

          <span
            style={{
              ...statusBadge,
              background: visit.accessCodeUsed
                ? "#EAF8F0"
                : "#EEF4FF",
              color: visit.accessCodeUsed
                ? "#16834B"
                : "#315EA8",
            }}
          >
            {visit.accessCodeUsed ? (
              <CheckCircle2 size={13} />
            ) : (
              <ShieldCheck size={13} />
            )}

            {visit.accessCodeUsed
              ? "CODE USED"
              : "CODE ACTIVE"}
          </span>
        </div>
      </div>

      {/* ===================================================== */}
      {/* ACCESS CODE HERO */}
      {/* ===================================================== */}

      <div style={accessCodeCard}>
        <div>
          <div style={heroLabel}>
            VISIT ACCESS CODE
          </div>

          <div style={accessCodeText}>
            {visit.accessCode || "-"}
          </div>

          <div style={accessCodeSubtext}>
            Visit #{visit.visitIndex + 1}
            {"  "}•{"  "}
            Booking ID: {visit.booking?._id || "-"}
          </div>
        </div>

        <div style={codeStatusBox}>
          {visit.accessCodeUsed ? (
            <>
              <CheckCircle2
                size={22}
                color="#65D69A"
              />

              <div style={codeStatusContent}>
                <strong>Used</strong>

                <span>
                  {formatDateTime(
                    visit.providerStartedAt
                  )}
                </span>
              </div>
            </>
          ) : (
            <>
              <ShieldCheck
                size={22}
                color="#8FC7FF"
              />

              <div style={codeStatusContent}>
                <strong>Active</strong>

                <span>Not used yet</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* VISIT OVERVIEW */}
      {/* ===================================================== */}

      <Section
        title="Visit Overview"
        icon={<CalendarDays size={17} />}
      >
        <div style={grid4}>
          <InfoCard
            label="Visit Date"
            value={formatDate(
              visit.scheduledDate
            )}
            icon={<CalendarDays size={16} />}
          />

          <InfoCard
            label="Visit Time"
            value={`${visit.fromTime} - ${visit.toTime}`}
            icon={<Clock3 size={16} />}
          />

          <InfoCard
            label="Duration"
            value={`${visit.duration} minutes`}
            icon={<Timer size={16} />}
          />

          <InfoCard
            label="Visit Index"
            value={`Visit ${visit.visitIndex + 1}`}
            icon={<ClipboardList size={16} />}
          />
        </div>
      </Section>

      {/* ===================================================== */}
      {/* BOOKING INFORMATION */}
      {/* ===================================================== */}

      <Section
        title="Booking Information"
        icon={<User size={17} />}
      >
        <div style={peopleGrid}>

          {/* REQUESTER */}
          <div style={personCard}>
            <div style={personCardHeader}>
              <div
                style={{
                  ...personAvatar,
                  background: "#EEF4F8",
                  color: "#14344A",
                }}
              >
                <User size={18} />
              </div>

              <div style={personHeaderContent}>
                <div style={personRole}>
                  REQUESTER
                </div>

                <div style={personName}>
                  {getUserName(
                    visit.booking?.user
                  )}
                </div>
              </div>
            </div>

            <div style={personDetails}>

              <div style={personDetailRow}>
                <div style={personDetailLabelRow}>
                  <Mail size={11} />
                  <span style={personDetailLabel}>
                    Email
                  </span>
                </div>

                <span style={personDetailValue}>
                  {getUserEmail(
                    visit.booking?.user
                  )}
                </span>
              </div>

              <div style={personDetailRow}>
                <div style={personDetailLabelRow}>
                  <Hash size={11} />
                  <span style={personDetailLabel}>
                    User ID
                  </span>
                </div>

                <span style={personIdValue}>
                  {getUserId(
                    visit.booking?.user
                  )}
                </span>
              </div>

            </div>
          </div>

          {/* PROVIDER */}
          <div style={personCard}>
            <div style={personCardHeader}>
              <div
                style={{
                  ...personAvatar,
                  background: "#EEF7F1",
                  color: "#16834B",
                }}
              >
                <ShieldCheck size={18} />
              </div>

              <div style={personHeaderContent}>
                <div style={personRole}>
                  PROVIDER
                </div>

                <div style={personName}>
                  {getUserName(
                    visit.booking?.provider
                  )}
                </div>
              </div>
            </div>

            <div style={personDetails}>

              <div style={personDetailRow}>
                <div style={personDetailLabelRow}>
                  <Mail size={11} />
                  <span style={personDetailLabel}>
                    Email
                  </span>
                </div>

                <span style={personDetailValue}>
                  {getUserEmail(
                    visit.booking?.provider
                  )}
                </span>
              </div>

              <div style={personDetailRow}>
                <div style={personDetailLabelRow}>
                  <Hash size={11} />
                  <span style={personDetailLabel}>
                    Provider ID
                  </span>
                </div>

                <span style={personIdValue}>
                  {getUserId(
                    visit.booking?.provider
                  )}
                </span>
              </div>

            </div>
          </div>

          {/* SERVICE */}
          <div style={personCard}>
            <div style={personCardHeader}>
              <div
                style={{
                  ...personAvatar,
                  background: "#FFF6E8",
                  color: "#B7791F",
                }}
              >
                <ClipboardList size={18} />
              </div>

              <div style={personHeaderContent}>
                <div style={personRole}>
                  SERVICE
                </div>

                <div style={personName}>
                  {getServiceName(
                    visit.booking?.service
                  )}
                </div>
              </div>
            </div>

            <div style={personDetails}>

              <div style={personDetailRow}>
                <div style={personDetailLabelRow}>
                  <ClipboardList size={11} />

                  <span style={personDetailLabel}>
                    Service Name
                  </span>
                </div>

                <span style={personDetailValue}>
                  {getServiceName(
                    visit.booking?.service
                  )}
                </span>
              </div>

              <div style={personDetailRow}>
                <div style={personDetailLabelRow}>
                  <Hash size={11} />

                  <span style={personDetailLabel}>
                    Service ID
                  </span>
                </div>

                <span style={personIdValue}>
                  {getServiceId(
                    visit.booking?.service
                  )}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* BOOKING ID */}
        <div style={bookingIdBox}>
          <div style={bookingIdLabelRow}>
            <Hash size={12} />

            <div style={smallLabel}>
              BOOKING ID
            </div>
          </div>

          <div style={bookingIdText}>
            {visit.booking?._id || "-"}
          </div>
        </div>
      </Section>

      {/* ===================================================== */}
      {/* TASKS */}
      {/* ===================================================== */}

      <Section
        title="Visit Tasks"
        icon={<ClipboardList size={17} />}
      >
        {visit.tasks?.length ? (
          <div style={tasksWrapper}>
            {visit.tasks.map((task, index) => (
              <div
                key={`${task}-${index}`}
                style={taskBadge}
              >
                <CheckCircle2 size={14} />
                {task}
              </div>
            ))}
          </div>
        ) : (
          <EmptyText text="No tasks available." />
        )}
      </Section>

      {/* ===================================================== */}
      {/* LOCATION */}
      {/* ===================================================== */}

      <Section
        title="Service Location"
        icon={<MapPin size={17} />}
      >
        <div style={locationCard}>
          <div style={locationIcon}>
            <MapPin size={20} />
          </div>

          <div>
            <div style={locationTextStyle}>
              {locationText ||
                "Location not available"}
            </div>

            {visit.booking?.schedulingTimeZone && (
              <div style={mutedText}>
                Time Zone:{" "}
                {visit.booking.schedulingTimeZone}
              </div>
            )}

            {visit.booking?.location?.coordinates
              ?.length === 2 && (
              <div style={mutedText}>
                Coordinates:{" "}
                {visit.booking.location.coordinates.join(
                  ", "
                )}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ===================================================== */}
      {/* TIMELINE */}
      {/* ===================================================== */}

      <Section
        title="Visit Timeline"
        icon={<Activity size={17} />}
      >
        <div style={timeline}>
          <TimelineItem
            title="Provider En Route"
            date={visit.providerEnRouteAt}
            active={!!visit.providerEnRouteAt}
          />

          <TimelineItem
            title="Provider Arrived"
            date={visit.providerArrivedAt}
            active={!!visit.providerArrivedAt}
          />

          <TimelineItem
            title="Visit Started"
            date={visit.providerStartedAt}
            active={!!visit.providerStartedAt}
          />

          <TimelineItem
            title="Completion Requested"
            date={visit.completionRequestedAt}
            active={!!visit.completionRequestedAt}
          />

          <TimelineItem
            title="Visit Completed"
            date={visit.completedAt}
            active={!!visit.completedAt}
            last
          />
        </div>
      </Section>

      {/* ===================================================== */}
      {/* PRICING */}
      {/* ===================================================== */}

      <Section
        title="Visit Pricing"
        icon={<DollarSign size={17} />}
      >
        <div style={grid4}>
          <MoneyCard
            label="Service Price"
            value={visit.pricing?.servicePrice}
          />

          <MoneyCard
            label="Additional Charges"
            value={
              visit.pricing?.additionalCharges
            }
          />

          <MoneyCard
            label="Discount"
            value={visit.pricing?.discount}
          />

          <MoneyCard
            label="Tax"
            value={visit.pricing?.tax}
          />
        </div>

        <div style={totalCard}>
          <span>Total Visit Amount</span>

          <strong>
            {formatMoney(
              visit.pricing?.total
            )}
          </strong>
        </div>

        <div style={grid3WithMargin}>
          <InfoBlock
            label="Requestor Platform Cut"
            value={formatMoney(
              visit.pricing
                ?.platformCutFromRequestorUsd
            )}
          />

          <InfoBlock
            label="Provider Platform Cut"
            value={formatMoney(
              visit.pricing
                ?.platformCutFromProviderUsd
            )}
          />

          <InfoBlock
            label="Provider Estimated Payout"
            value={formatMoney(
              visit.pricing
                ?.providerEstimatedPayoutUsd
            )}
          />
        </div>
      </Section>

      {/* ===================================================== */}
      {/* PAYMENT */}
      {/* ===================================================== */}

      <Section
        title="Payment Information"
        icon={<CreditCard size={17} />}
      >
        <div style={grid4}>
          <InfoBlock
            label="Payment Method"
            value={
              visit.payment?.method?.toUpperCase() ||
              "-"
            }
          />

          <InfoBlock
            label="Payment Status"
            value={
              visit.payment?.status?.toUpperCase() ||
              "-"
            }
          />

          <InfoBlock
            label="Paid At"
            value={formatDateTime(
              visit.payment?.paidAt
            )}
          />

          <InfoBlock
            label="Payment Hold"
            value={
              visit.paymentHoldRequired
                ? "Required"
                : "Not Required"
            }
          />
        </div>

        <div style={marginTop12}>
          <InfoBlock
            label="Transaction ID"
            value={
              visit.payment?.transactionId || "-"
            }
          />
        </div>
      </Section>

      {/* ===================================================== */}
      {/* SPECIAL INSTRUCTIONS */}
      {/* ===================================================== */}

      {visit.booking?.specialInstructions && (
        <Section
          title="Special Instructions"
          icon={<FileText size={17} />}
        >
          <div style={notesBox}>
            {visit.booking.specialInstructions}
          </div>
        </Section>
      )}

      {/* ===================================================== */}
      {/* ADD TIME */}
      {/* ===================================================== */}

      <Section
        title="Additional Time Request"
        icon={<Clock3 size={17} />}
      >
        <div style={grid4}>
          <InfoBlock
            label="Status"
            value={
              visit.addTimeRequest?.status?.toUpperCase() ||
              "NONE"
            }
          />

          <InfoBlock
            label="Additional Minutes"
            value={
              visit.addTimeRequest
                ?.additionalMinutes
                ? `${visit.addTimeRequest.additionalMinutes} min`
                : "-"
            }
          />

          <InfoBlock
            label="Proposed End Time"
            value={
              visit.addTimeRequest
                ?.proposedEndTime || "-"
            }
          />

          <InfoBlock
            label="Price Delta"
            value={formatMoney(
              visit.addTimeRequest?.priceDelta
            )}
          />
        </div>

        {visit.addTimeRequest?.reason && (
          <div style={marginTop12}>
            <InfoBlock
              label="Reason"
              value={
                visit.addTimeRequest.reason
              }
            />
          </div>
        )}
      </Section>

      {/* ===================================================== */}
      {/* COMPLETION */}
      {/* ===================================================== */}

      <Section
        title="Completion Information"
        icon={<CheckCircle2 size={17} />}
      >
        <div style={grid3}>
          <InfoBlock
            label="Completion Auto Approved"
            value={
              visit.booking?.completionAutoApproved
                ? "Yes"
                : "No"
            }
          />

          <InfoBlock
            label="Completion Requested"
            value={formatDateTime(
              visit.completionRequestedAt
            )}
          />

          <InfoBlock
            label="Completed At"
            value={formatDateTime(
              visit.completedAt
            )}
          />
        </div>

        {visit.completionRejection?.reasons
          ?.length ? (
          <div style={rejectionBox}>
            <div style={smallLabel}>
              REJECTION REASONS
            </div>

            <ul style={rejectionList}>
              {visit.completionRejection.reasons.map(
                (reason, index) => (
                  <li key={index}>
                    {reason}
                  </li>
                )
              )}
            </ul>

            {visit.completionRejection.comment && (
              <div style={rejectionComment}>
                {visit.completionRejection.comment}
              </div>
            )}
          </div>
        ) : null}
      </Section>

      {/* ===================================================== */}
      {/* SYSTEM INFO */}
      {/* ===================================================== */}

      <Section
        title="System Information"
        icon={<ShieldCheck size={17} />}
      >
        <div style={grid3}>
          <InfoBlock
            label="Visit Created"
            value={formatDateTime(
              visit.createdAt
            )}
          />

          <InfoBlock
            label="Last Updated"
            value={formatDateTime(
              visit.updatedAt
            )}
          />

          <InfoBlock
            label="Active Visit ID"
            value={
              visit.booking?.activeVisit || "-"
            }
          />
        </div>
      </Section>
    </div>
  );
};

/* ========================================================= */
/* COMPONENTS */
/* ========================================================= */

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div style={sectionCard}>
      <div style={sectionHeader}>
        <div style={sectionTitle}>
          <div style={sectionIcon}>
            {icon}
          </div>

          {title}
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
};

const InfoCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div style={infoCard}>
    <div style={infoIcon}>
      {icon}
    </div>

    <div>
      <div style={smallLabel}>
        {label}
      </div>

      <div style={infoValue}>
        {value}
      </div>
    </div>
  </div>
);

const InfoBlock = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div style={infoBlock}>
    <div style={smallLabel}>
      {label}
    </div>

    <div style={infoBlockValue}>
      {value}
    </div>
  </div>
);

const MoneyCard = ({
  label,
  value,
}: {
  label: string;
  value?: number;
}) => (
  <div style={moneyCard}>
    <div style={smallLabel}>
      {label}
    </div>

    <div style={moneyValue}>
      ${Number(value || 0).toFixed(2)}
    </div>
  </div>
);

const TimelineItem = ({
  title,
  date,
  active,
  last = false,
}: {
  title: string;
  date?: string;
  active: boolean;
  last?: boolean;
}) => (
  <div style={timelineItem}>
    <div style={timelineLeft}>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: active
            ? "#14344A"
            : "#D9E1E8",
          border: "3px solid #fff",
          boxShadow: active
            ? "0 0 0 2px #D9E5ED"
            : "0 0 0 1px #D9E1E8",
          zIndex: 2,
        }}
      />

      {!last && (
        <div style={timelineLine} />
      )}
    </div>

    <div
      style={{
        paddingBottom: last ? 0 : 22,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 650,
          color: active
            ? "#263B4D"
            : "#9AA5B1",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#8995A5",
          marginTop: 4,
        }}
      >
        {date
          ? formatTimelineDate(date)
          : "Not recorded"}
      </div>
    </div>
  </div>
);

const EmptyText = ({
  text,
}: {
  text: string;
}) => (
  <div style={emptyText}>
    {text}
  </div>
);

const formatTimelineDate = (
  date: string
) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/* ========================================================= */
/* STYLES */
/* ========================================================= */

const pageStyle: React.CSSProperties = {
  marginLeft: "260px",
  marginTop: "70px",
  padding: "30px",
  minHeight: "calc(100vh - 70px)",
  background: "#F4F7FB",
  boxSizing: "border-box",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
  gap: 20,
  flexWrap: "wrap",
};

const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const headerActions: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const headerIcon: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background:
    "linear-gradient(135deg, #14344A, #163A5F)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  boxShadow:
    "0 6px 18px rgba(20,52,74,.18)",
};

const pageTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  color: "#14344A",
};

const pageSubtitle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "#718096",
};

const statusBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "7px 11px",
  borderRadius: 20,
  fontSize: 10,
  fontWeight: 700,
};

const backButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "1px solid #D8E0E8",
  background: "#fff",
  color: "#14344A",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
};

const accessCodeCard: React.CSSProperties = {
  background:
    "linear-gradient(135deg, #14344A, #163A5F)",
  borderRadius: 17,
  padding: "24px 26px",
  color: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 22,
  boxShadow:
    "0 10px 30px rgba(20,52,74,.16)",
};

const heroLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: ".6px",
  color: "rgba(255,255,255,.65)",
};

const accessCodeText: React.CSSProperties = {
  marginTop: 7,
  fontSize: 30,
  fontWeight: 800,
  letterSpacing: "3px",
};

const accessCodeSubtext: React.CSSProperties = {
  marginTop: 7,
  fontSize: 11,
  opacity: 0.7,
};

const codeStatusBox: React.CSSProperties = {
  minWidth: 170,
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "13px 15px",
  borderRadius: 11,
  background: "rgba(255,255,255,.09)",
  border:
    "1px solid rgba(255,255,255,.12)",
};

const codeStatusContent: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

const sectionCard: React.CSSProperties = {
  background: "#fff",
  borderRadius: 15,
  border: "1px solid #E6EBF1",
  padding: 21,
  marginBottom: 18,
  boxShadow:
    "0 4px 16px rgba(20,52,74,.035)",
};

const sectionHeader: React.CSSProperties = {
  marginBottom: 16,
};

const sectionTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
  fontWeight: 700,
  color: "#14344A",
};

const sectionIcon: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: "#EEF4F8",
  color: "#14344A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const grid4: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: 12,
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: 12,
};

const peopleGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, minmax(0, 1fr))",
  gap: 14,
};

const grid3WithMargin: React.CSSProperties = {
  ...grid3,
  marginTop: 12,
};

const infoCard: React.CSSProperties = {
  border: "1px solid #E5EAF0",
  borderRadius: 10,
  padding: 13,
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "#FAFCFE",
};

const infoIcon: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: "#EEF4F8",
  color: "#14344A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const infoValue: React.CSSProperties = {
  marginTop: 5,
  fontSize: 12,
  fontWeight: 650,
  color: "#34495A",
};

const infoBlock: React.CSSProperties = {
  padding: 13,
  border: "1px solid #E5EAF0",
  borderRadius: 10,
  background: "#FAFCFE",
};

const infoBlockValue: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  fontWeight: 600,
  color: "#34495A",
  wordBreak: "break-word",
};

const personCard: React.CSSProperties = {
  border: "1px solid #E5EAF0",
  borderRadius: 12,
  padding: 15,
  background: "#FAFCFE",
  transition: "all .2s ease",
  minWidth: 0,
};

const personCardHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 11,
  paddingBottom: 13,
  borderBottom: "1px solid #E9EEF3",
  minWidth: 0,
};

const personAvatar: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const personHeaderContent: React.CSSProperties = {
  minWidth: 0,
};

const personRole: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: ".7px",
  color: "#8995A5",
};

const personName: React.CSSProperties = {
  marginTop: 4,
  fontSize: 14,
  fontWeight: 700,
  color: "#263B4D",
  wordBreak: "break-word",
};

const personDetails: React.CSSProperties = {
  marginTop: 12,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const personDetailRow: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 0,
};

const personDetailLabelRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  color: "#9AA5B1",
};

const personDetailLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: ".5px",
  color: "#9AA5B1",
};

const personDetailValue: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#34495A",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
};

const personIdValue: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  color: "#718096",
  wordBreak: "break-all",
  fontFamily: "monospace",
};

const bookingIdBox: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 10,
  background: "#F8FAFC",
  border: "1px solid #E6EBF1",
};

const bookingIdLabelRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
};

const bookingIdText: React.CSSProperties = {
  marginTop: 5,
  fontSize: 13,
  fontWeight: 650,
  color: "#34495A",
  wordBreak: "break-all",
};

const tasksWrapper: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 9,
};

const taskBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 11px",
  borderRadius: 8,
  background: "#F0F8F4",
  border: "1px solid #D6EDDF",
  color: "#26724A",
  fontSize: 11,
  fontWeight: 600,
};

const locationCard: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 13,
  padding: 15,
  background: "#F8FAFC",
  border: "1px solid #E5EAF0",
  borderRadius: 10,
};

const locationIcon: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 9,
  background: "#EEF4F8",
  color: "#14344A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const locationTextStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 650,
  color: "#263B4D",
  lineHeight: 1.6,
};

const mutedText: React.CSSProperties = {
  fontSize: 11,
  color: "#8995A5",
  marginTop: 5,
};

const timeline: React.CSSProperties = {
  paddingLeft: 4,
};

const timelineItem: React.CSSProperties = {
  display: "flex",
  gap: 14,
};

const timelineLeft: React.CSSProperties = {
  width: 14,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
};

const timelineLine: React.CSSProperties = {
  position: "absolute",
  top: 12,
  bottom: 0,
  width: 2,
  background: "#E0E7ED",
};

const moneyCard: React.CSSProperties = {
  border: "1px solid #E5EAF0",
  borderRadius: 10,
  padding: 14,
  background: "#FAFCFE",
};

const moneyValue: React.CSSProperties = {
  marginTop: 6,
  fontSize: 17,
  fontWeight: 700,
  color: "#14344A",
};

const totalCard: React.CSSProperties = {
  marginTop: 14,
  padding: "15px 17px",
  borderRadius: 10,
  background: "#EEF4F8",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "#14344A",
  fontSize: 13,
  fontWeight: 650,
};

const notesBox: React.CSSProperties = {
  padding: 15,
  borderRadius: 10,
  background: "#FFFDF5",
  border: "1px solid #F1E8BD",
  color: "#625A35",
  fontSize: 12,
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
};

const rejectionBox: React.CSSProperties = {
  marginTop: 12,
  padding: 14,
  borderRadius: 10,
  background: "#FFF5F5",
  border: "1px solid #F3D4D4",
};

const rejectionList: React.CSSProperties = {
  margin: "8px 0 0",
  paddingLeft: 20,
  color: "#8D4141",
  fontSize: 12,
};

const rejectionComment: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: "#8D4141",
};

const emptyText: React.CSSProperties = {
  padding: 15,
  background: "#F8FAFC",
  borderRadius: 9,
  color: "#8995A5",
  fontSize: 12,
};

const marginTop12: React.CSSProperties = {
  marginTop: 12,
};

const smallLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: ".6px",
  color: "#8995A5",
  textTransform: "uppercase",
};

const loadingContainer: React.CSSProperties = {
  minHeight: "60vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const loadingText: React.CSSProperties = {
  color: "#718096",
  marginTop: 12,
};

const errorCard: React.CSSProperties = {
  maxWidth: 500,
  margin: "100px auto",
  padding: 35,
  background: "#fff",
  borderRadius: 15,
  border: "1px solid #E6EBF1",
  textAlign: "center",
};

const errorTitle: React.CSSProperties = {
  color: "#14344A",
  margin: "15px 0 5px",
};

const errorText: React.CSSProperties = {
  color: "#718096",
  margin: 0,
};

export default ViewAccessCode;
