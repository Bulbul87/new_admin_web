import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, CalendarDays, CheckCircle2, Clock3, CreditCard, DollarSign,
  FileText, KeyRound, Loader2, MapPin, ShieldCheck, User, XCircle,
  Activity, ClipboardList, Timer, Mail, Hash,
} from "lucide-react";
import {
  getAccessCodeVisit,
  type AccessCodeVisit,
  type PopulatedUser,
  type PopulatedService,
} from "../service/visitaccesscodeservice";
import { toast } from "react-toastify";

interface ViewAccessCodeProps { visitId?: string; }
type RecordType = "booking" | "visit";

const ViewAccessCode: React.FC<ViewAccessCodeProps> = ({ visitId }) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const id = visitId || params.id;
  const searchParams = new URLSearchParams(location.search);
  const recordType: RecordType = searchParams.get("type") === "visit" ? "visit" : "booking";

  const [visit, setVisit] = useState<AccessCodeVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) {
        setError("Access code record ID is missing.");
        setVisit(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const data = await getAccessCodeVisit(id, recordType);
        if (!mounted) return;
        if (!data) {
          setVisit(null);
          setError("Access code record not found.");
        } else {
          setVisit(data);
        }
      } catch (e: unknown) {
        if (!mounted) return;
        const message = e instanceof Error ? e.message : "Failed to load access code details.";
        setError(message);
        setVisit(null);
        toast.error(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [id, recordType]);

  const handleBack = () => navigate(-1);
  const formatDate = (value?: string | Date | null) => {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  };
  const formatMoney = (value?: number | string | null) => {
    if (value === undefined || value === null || value === "" || Number.isNaN(Number(value))) return "$0.00";
    return `$${Number(value).toFixed(2)}`;
  };
  const getUserName = (user?: PopulatedUser | string | null) => {
    if (!user) return "-";
    if (typeof user === "string") return user;
    return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "-";
  };
  const getUserEmail = (user?: PopulatedUser | string | null) => !user || typeof user === "string" ? "-" : user.email || "-";
  const getUserId = (user?: PopulatedUser | string | null) => {
    if (!user) return "-";
    if (typeof user === "string") return user;
    return user.requestorInfo?.publicRequesterId || "-";
  };
  const getServiceName = (service?: PopulatedService | string | null) => {
    if (!service) return "-";
    return typeof service === "string" ? service : service.name || "-";
  };
  const getStatusStyle = (status?: string) => {
    const value = status?.toLowerCase().replace(/_/g, "-");
    if (["completed", "confirmed", "arrived"].includes(value || "")) return { background: "#EAF8F0", color: "#16834B" };
    if (["in-progress", "en-route", "scheduled", "accepted", "active"].includes(value || "")) return { background: "#EEF4FF", color: "#315EA8" };
    if (["cancelled", "canceled", "disputed", "no-show", "rejected"].includes(value || "")) return { background: "#FFF0F0", color: "#D64545" };
    return { background: "#F2F4F7", color: "#667085" };
  };

  if (loading) return <div style={pageStyle}><div style={loadingContainer}><Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#14344A" }} /><p style={loadingText}>Loading access code details...</p></div></div>;
  if (error || !visit) return <div style={pageStyle}><div style={errorCard}><XCircle size={40} color="#D64545" /><h3 style={errorTitle}>Unable to load access code</h3><p style={errorText}>{error || "Access code record not found."}</p><button onClick={handleBack} style={backButton}><ArrowLeft size={15} />Back</button></div></div>;

  // BookingVisit documents may store people/service directly; booking records generally store them on booking.
  const booking = visit.booking && typeof visit.booking !== "string" ? visit.booking : undefined;
  const requester = booking?.user || visit.user;
  const caregiver = booking?.provider || visit.provider;
  const service = booking?.service || visit.service;
  const address = booking?.location?.address;
  const locationText = [address?.street, address?.city, address?.state, address?.zipCode, address?.country].filter(Boolean).join(", ");
  const statusStyle = getStatusStyle(visit.status || visit.bookingStatus);
  const codeStatusValue = visit.codeStatus?.toUpperCase();
  const isUsed = Boolean(visit.accessCodeUsed || codeStatusValue === "USED");
  const isPending = !isUsed && (codeStatusValue === "PENDING" || !visit.accessCode);
  const codeStatusLabel = isUsed ? "USED" : isPending ? "NOT GENERATED" : "ACTIVE";
  const codeBadgeStyle = isUsed ? { background: "#EAF8F0", color: "#16834B" } : isPending ? { background: "#FFF6E8", color: "#B7791F" } : { background: "#EEF4FF", color: "#315EA8" };
  const startTime = visit.visitStartTime || visit.fromTime || visit.scheduledTime?.start;
  const endTime = visit.visitEndTime || visit.toTime || visit.scheduledTime?.end;
  const visitDate = visit.visitDate || visit.scheduledDate;
  const statusLabel = (visit.status || visit.bookingStatus || "UNKNOWN").replace(/[-_]/g, " ").toUpperCase();

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <div style={titleRow}><div style={headerIcon}><KeyRound size={21} /></div><div><h2 style={pageTitle}>{recordType === "visit" ? "Visit Access Code" : "Booking Access Code"}</h2><p style={pageSubtitle}>Complete access code and {recordType === "visit" ? "visit" : "booking"} information</p></div></div>
        <div style={headerActions}>
          <button onClick={handleBack} style={backButton}><ArrowLeft size={15} />Back</button>
          <span style={{ ...statusBadge, ...statusStyle }}><Activity size={13} />{statusLabel}</span>
          <span style={{ ...statusBadge, ...codeBadgeStyle }}>{isUsed ? <CheckCircle2 size={13} /> : isPending ? <Clock3 size={13} /> : <ShieldCheck size={13} />}{codeStatusLabel}</span>
        </div>
      </div>

      <div style={accessCodeCard}>
        <div><div style={heroLabel}>{recordType === "visit" ? "VISIT ACCESS CODE" : "BOOKING ACCESS CODE"}</div><div style={accessCodeText}>{visit.accessCode || (isPending ? "NOT GENERATED" : "-")}</div></div>
        <div style={codeStatusBox}>{isUsed ? <CheckCircle2 size={22} color="#65D69A" /> : isPending ? <Clock3 size={22} color="#FFD28A" /> : <ShieldCheck size={22} color="#8FC7FF" />}<div style={codeStatusContent}><strong>{isUsed ? "Used" : isPending ? "Not Generated" : "Active"}</strong><span>{isUsed ? formatDateTime(visit.providerStartedAt) : isPending ? "No access code available" : "Not used yet"}</span></div></div>
      </div>

      <Section title={recordType === "visit" ? "Visit Overview" : "Booking Overview"} icon={<CalendarDays size={17} />}>
        <div style={grid4}>
          <InfoCard label={recordType === "visit" ? "Visit Date" : "Scheduled Date"} value={formatDate(visitDate)} icon={<CalendarDays size={16} />} />
          <InfoCard label="Visit Time" value={startTime || endTime ? `${startTime || "-"} - ${endTime || "-"}` : "-"} icon={<Clock3 size={16} />} />
          <InfoCard label="Duration" value={visit.duration != null ? `${visit.duration} minutes` : "-"} icon={<Timer size={16} />} />
          <InfoCard label="Record Type" value={recordType === "visit" ? `Multi-day visit${visit.visitIndex != null ? ` #${Number(visit.visitIndex) + 1}` : ""}` : "One-day booking"} icon={<ClipboardList size={16} />} />
        </div>
      </Section>

      <Section title="Booking Information" icon={<User size={17} />}>
        <div style={peopleGrid}>
          <PersonCard role="REQUESTER" name={getUserName(requester)} email={getUserEmail(requester)} idLabel="User ID" userId={getUserId(requester)} tone="requester" />
          <PersonCard role="CAREGIVER" name={getUserName(caregiver)} email={getUserEmail(caregiver)} idLabel="Caregiver ID" userId={getUserId(caregiver)} tone="caregiver" />
          <div style={personCard}><div style={personCardHeader}><div style={{ ...personAvatar, background: "#FFF6E8", color: "#B7791F" }}><ClipboardList size={18} /></div><div style={personHeaderContent}><div style={personRole}>SERVICE</div><div style={personName}>{getServiceName(service)}</div></div></div><div style={personDetails}><DetailRow icon={<ClipboardList size={11} />} label="Service Name" value={getServiceName(service)} /></div></div>
        </div>
      </Section>

      <Section title="Visit Tasks" icon={<ClipboardList size={17} />}>
        {visit.tasks?.length ? <div style={tasksWrapper}>{visit.tasks.map((task, i) => <div key={`${task}-${i}`} style={taskBadge}><CheckCircle2 size={14} />{task}</div>)}</div> : <EmptyText text="No tasks available." />}
      </Section>

      <Section title="Service Location" icon={<MapPin size={17} />}>
        <div style={locationCard}><div style={locationIcon}><MapPin size={20} /></div><div><div style={locationTextStyle}>{locationText || "Location not available"}</div>{booking?.schedulingTimeZone && <div style={mutedText}>Time Zone: {booking.schedulingTimeZone}</div>}{booking?.location?.coordinates?.length === 2 && <div style={mutedText}>Coordinates: {booking.location.coordinates.join(", ")}</div>}</div></div>
      </Section>

      <Section title="Visit Timeline" icon={<Activity size={17} />}>
        <div style={timeline}><TimelineItem title="Caregiver En Route" date={visit.providerEnRouteAt} active={!!visit.providerEnRouteAt} /><TimelineItem title="Caregiver Arrived" date={visit.providerArrivedAt} active={!!visit.providerArrivedAt} /><TimelineItem title="Visit Started" date={visit.providerStartedAt} active={!!visit.providerStartedAt} /><TimelineItem title="Completion Requested" date={visit.completionRequestedAt} active={!!visit.completionRequestedAt} /><TimelineItem title="Visit Completed" date={visit.completedAt} active={!!visit.completedAt} last /></div>
      </Section>

      <Section title="Visit Pricing" icon={<DollarSign size={17} />}>
        <div style={grid4}><MoneyCard label="Service Price" value={visit.pricing?.servicePrice} /><MoneyCard label="Additional Charges" value={visit.pricing?.additionalCharges} /><MoneyCard label="Discount" value={visit.pricing?.discount} /><MoneyCard label="Tax" value={visit.pricing?.tax} /></div>
        <div style={totalCard}><span>Total Visit Amount</span><strong>{formatMoney(visit.pricing?.total)}</strong></div>
        <div style={grid3WithMargin}><InfoBlock label="Requestor Platform Cut" value={formatMoney(visit.pricing?.platformCutFromRequestorUsd)} /><InfoBlock label="Caregiver Platform Cut" value={formatMoney(visit.pricing?.platformCutFromProviderUsd)} /><InfoBlock label="Caregiver Estimated Payout" value={formatMoney(visit.pricing?.providerEstimatedPayoutUsd)} /></div>
      </Section>

      <Section title="Payment Information" icon={<CreditCard size={17} />}>
        <div style={grid4}><InfoBlock label="Payment Method" value={visit.payment?.method?.toUpperCase() || "-"} /><InfoBlock label="Payment Status" value={visit.payment?.status?.toUpperCase() || "-"} /><InfoBlock label="Paid At" value={formatDateTime(visit.payment?.paidAt)} /><InfoBlock label="Payment Hold" value={visit.paymentHoldRequired ? "Required" : "Not Required"} /></div>
        <div style={marginTop12}><InfoBlock label="Transaction ID" value={visit.payment?.transactionId || "-"} /></div>
      </Section>

      {booking?.specialInstructions && <Section title="Special Instructions" icon={<FileText size={17} />}><div style={notesBox}>{booking.specialInstructions}</div></Section>}

      <Section title="Additional Time Request" icon={<Clock3 size={17} />}>
        <div style={grid4}><InfoBlock label="Status" value={visit.addTimeRequest?.status?.toUpperCase() || "NONE"} /><InfoBlock label="Additional Minutes" value={visit.addTimeRequest?.additionalMinutes != null ? `${visit.addTimeRequest.additionalMinutes} min` : "-"} /><InfoBlock label="Proposed End Time" value={visit.addTimeRequest?.proposedEndTime || "-"} /><InfoBlock label="Price Delta" value={formatMoney(visit.addTimeRequest?.priceDelta)} /></div>
        {visit.addTimeRequest?.reason && <div style={marginTop12}><InfoBlock label="Reason" value={visit.addTimeRequest.reason} /></div>}
      </Section>

      <Section title="Completion Information" icon={<CheckCircle2 size={17} />}>
        <div style={grid3}><InfoBlock label="Completion Auto Approved" value={booking?.completionAutoApproved ? "Yes" : "No"} /><InfoBlock label="Completion Requested" value={formatDateTime(visit.completionRequestedAt)} /><InfoBlock label="Completed At" value={formatDateTime(visit.completedAt)} /></div>
        {visit.completionRejection?.reasons?.length ? <div style={rejectionBox}><div style={smallLabel}>REJECTION REASONS</div><ul style={rejectionList}>{visit.completionRejection.reasons.map((reason, i) => <li key={`${reason}-${i}`}>{reason}</li>)}</ul>{visit.completionRejection.comment && <div style={rejectionComment}>{visit.completionRejection.comment}</div>}</div> : null}
      </Section>

      <Section title="System Information" icon={<ShieldCheck size={17} />}>
        <div style={grid3}><InfoBlock label="Record ID" value={visit._id || id || "-"} /><InfoBlock label="Created At" value={formatDateTime(visit.createdAt)} /><InfoBlock label="Last Updated" value={formatDateTime(visit.updatedAt)} /></div>
      </Section>
    </div>
  );
};

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => <div style={sectionCard}><div style={sectionHeader}><div style={sectionTitle}><div style={sectionIcon}>{icon}</div>{title}</div></div><div>{children}</div></div>;
const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => <div style={infoCard}><div style={infoIcon}>{icon}</div><div style={{ minWidth: 0 }}><div style={smallLabel}>{label}</div><div style={infoValue}>{value}</div></div></div>;
const InfoBlock = ({ label, value }: { label: string; value: string }) => <div style={infoBlock}><div style={smallLabel}>{label}</div><div style={infoBlockValue}>{value}</div></div>;
const MoneyCard = ({ label, value }: { label: string; value?: number }) => <div style={moneyCard}><div style={smallLabel}>{label}</div><div style={moneyValue}>${Number(value || 0).toFixed(2)}</div></div>;
const DetailRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => <div style={personDetailRow}><div style={personDetailLabelRow}>{icon}<span style={personDetailLabel}>{label}</span></div><span style={personDetailValue}>{value}</span></div>;
const PersonCard = ({ role, name, email, idLabel, userId, tone }: { role: string; name: string; email: string; idLabel: string; userId: string; tone: "requester" | "caregiver" }) => <div style={personCard}><div style={personCardHeader}><div style={{ ...personAvatar, background: tone === "requester" ? "#EEF4F8" : "#EEF7F1", color: tone === "requester" ? "#14344A" : "#16834B" }}>{tone === "requester" ? <User size={18} /> : <ShieldCheck size={18} />}</div><div style={personHeaderContent}><div style={personRole}>{role}</div><div style={personName}>{name}</div></div></div><div style={personDetails}><DetailRow icon={<Mail size={11} />} label="Email" value={email} /><DetailRow icon={<Hash size={11} />} label={idLabel} value={userId} /></div></div>;
const EmptyText = ({ text }: { text: string }) => <div style={emptyText}>{text}</div>;
const TimelineItem = ({ title, date, active, last = false }: { title: string; date?: string | Date | null; active: boolean; last?: boolean }) => <div style={timelineItem}><div style={timelineLeft}><div style={{ width: 12, height: 12, borderRadius: "50%", background: active ? "#14344A" : "#D9E1E8", border: "3px solid #fff", boxShadow: active ? "0 0 0 2px #D9E5ED" : "0 0 0 1px #D9E1E8", zIndex: 2 }} />{!last && <div style={timelineLine} />}</div><div style={{ paddingBottom: last ? 0 : 22 }}><div style={{ fontSize: 13, fontWeight: 650, color: active ? "#263B4D" : "#9AA5B1" }}>{title}</div><div style={{ fontSize: 11, color: "#8995A5", marginTop: 4 }}>{date ? formatTimelineDate(String(date)) : "Not recorded"}</div></div></div>;
const formatTimelineDate = (value: string) => { const d = new Date(value); return Number.isNaN(d.getTime()) ? value : d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }); };

const pageStyle: React.CSSProperties = { marginLeft: "260px", marginTop: "70px", padding: "30px", minHeight: "calc(100vh - 70px)", background: "#F4F7FB", boxSizing: "border-box" };
const headerRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 20, flexWrap: "wrap" };
const titleRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12 };
const headerActions: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" };
const headerIcon: React.CSSProperties = { width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #14344A, #163A5F)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 6px 18px rgba(20,52,74,.18)" };
const pageTitle: React.CSSProperties = { margin: 0, fontSize: 24, fontWeight: 700, color: "#14344A" };
const pageSubtitle: React.CSSProperties = { margin: "4px 0 0", fontSize: 13, color: "#718096" };
const statusBadge: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 20, fontSize: 10, fontWeight: 700 };
const backButton: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #D8E0E8", background: "#fff", color: "#14344A", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 };
const accessCodeCard: React.CSSProperties = { background: "linear-gradient(135deg, #14344A, #163A5F)", borderRadius: 17, padding: "24px 26px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 22, boxShadow: "0 10px 30px rgba(20,52,74,.16)" };
const heroLabel: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: ".6px", color: "rgba(255,255,255,.65)" };
const accessCodeText: React.CSSProperties = { marginTop: 7, fontSize: 30, fontWeight: 800, letterSpacing: "3px", overflowWrap: "anywhere" };
const codeStatusBox: React.CSSProperties = { minWidth: 170, display: "flex", alignItems: "center", gap: 10, padding: "13px 15px", borderRadius: 11, background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.12)" };
const codeStatusContent: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 3, fontSize: 12 };
const sectionCard: React.CSSProperties = { background: "#fff", borderRadius: 15, border: "1px solid #E6EBF1", padding: 21, marginBottom: 18, boxShadow: "0 4px 16px rgba(20,52,74,.035)" };
const sectionHeader: React.CSSProperties = { marginBottom: 16 };
const sectionTitle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#14344A" };
const sectionIcon: React.CSSProperties = { width: 30, height: 30, borderRadius: 8, background: "#EEF4F8", color: "#14344A", display: "flex", alignItems: "center", justifyContent: "center" };
const grid4: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 };
const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 };
const peopleGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 };
const grid3WithMargin: React.CSSProperties = { ...grid3, marginTop: 12 };
const infoCard: React.CSSProperties = { border: "1px solid #E5EAF0", borderRadius: 10, padding: 13, display: "flex", alignItems: "center", gap: 10, background: "#FAFCFE", minWidth: 0 };
const infoIcon: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, background: "#EEF4F8", color: "#14344A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const infoValue: React.CSSProperties = { marginTop: 5, fontSize: 12, fontWeight: 650, color: "#34495A", overflowWrap: "anywhere" };
const infoBlock: React.CSSProperties = { padding: 13, border: "1px solid #E5EAF0", borderRadius: 10, background: "#FAFCFE", minWidth: 0 };
const infoBlockValue: React.CSSProperties = { marginTop: 6, fontSize: 12, fontWeight: 600, color: "#34495A", wordBreak: "break-word" };
const personCard: React.CSSProperties = { border: "1px solid #E5EAF0", borderRadius: 12, padding: 15, background: "#FAFCFE", transition: "all .2s ease", minWidth: 0 };
const personCardHeader: React.CSSProperties = { display: "flex", alignItems: "center", gap: 11, paddingBottom: 13, borderBottom: "1px solid #E9EEF3", minWidth: 0 };
const personAvatar: React.CSSProperties = { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const personHeaderContent: React.CSSProperties = { minWidth: 0 };
const personRole: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: ".7px", color: "#8995A5" };
const personName: React.CSSProperties = { marginTop: 4, fontSize: 14, fontWeight: 700, color: "#263B4D", wordBreak: "break-word" };
const personDetails: React.CSSProperties = { marginTop: 12, display: "flex", flexDirection: "column", gap: 10 };
const personDetailRow: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 };
const personDetailLabelRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 5, color: "#9AA5B1" };
const personDetailLabel: React.CSSProperties = { fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "#9AA5B1" };
const personDetailValue: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#34495A", wordBreak: "break-word", overflowWrap: "anywhere" };

const tasksWrapper: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 9 };
const taskBadge: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 11px", borderRadius: 8, background: "#F0F8F4", border: "1px solid #D6EDDF", color: "#26724A", fontSize: 11, fontWeight: 600 };
const locationCard: React.CSSProperties = { display: "flex", alignItems: "flex-start", gap: 13, padding: 15, background: "#F8FAFC", border: "1px solid #E5EAF0", borderRadius: 10 };
const locationIcon: React.CSSProperties = { width: 38, height: 38, borderRadius: 9, background: "#EEF4F8", color: "#14344A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const locationTextStyle: React.CSSProperties = { fontSize: 13, fontWeight: 650, color: "#263B4D", lineHeight: 1.6 };
const mutedText: React.CSSProperties = { fontSize: 11, color: "#8995A5", marginTop: 5 };
const timeline: React.CSSProperties = { paddingLeft: 4 };
const timelineItem: React.CSSProperties = { display: "flex", gap: 14 };
const timelineLeft: React.CSSProperties = { width: 14, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" };
const timelineLine: React.CSSProperties = { position: "absolute", top: 12, bottom: 0, width: 2, background: "#E0E7ED" };
const moneyCard: React.CSSProperties = { border: "1px solid #E5EAF0", borderRadius: 10, padding: 14, background: "#FAFCFE" };
const moneyValue: React.CSSProperties = { marginTop: 6, fontSize: 17, fontWeight: 700, color: "#14344A" };
const totalCard: React.CSSProperties = { marginTop: 14, padding: "15px 17px", borderRadius: 10, background: "#EEF4F8", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#14344A", fontSize: 13, fontWeight: 650 };
const notesBox: React.CSSProperties = { padding: 15, borderRadius: 10, background: "#FFFDF5", border: "1px solid #F1E8BD", color: "#625A35", fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap" };
const rejectionBox: React.CSSProperties = { marginTop: 12, padding: 14, borderRadius: 10, background: "#FFF5F5", border: "1px solid #F3D4D4" };
const rejectionList: React.CSSProperties = { margin: "8px 0 0", paddingLeft: 20, color: "#8D4141", fontSize: 12 };
const rejectionComment: React.CSSProperties = { marginTop: 8, fontSize: 12, color: "#8D4141" };
const emptyText: React.CSSProperties = { padding: 15, background: "#F8FAFC", borderRadius: 9, color: "#8995A5", fontSize: 12 };
const marginTop12: React.CSSProperties = { marginTop: 12 };
const smallLabel: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: ".6px", color: "#8995A5", textTransform: "uppercase" };
const loadingContainer: React.CSSProperties = { minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
const loadingText: React.CSSProperties = { color: "#718096", marginTop: 12 };
const errorCard: React.CSSProperties = { maxWidth: 500, margin: "100px auto", padding: 35, background: "#fff", borderRadius: 15, border: "1px solid #E6EBF1", textAlign: "center" };
const errorTitle: React.CSSProperties = { color: "#14344A", margin: "15px 0 5px" };
const errorText: React.CSSProperties = { color: "#718096", margin: 0 };

export default ViewAccessCode;