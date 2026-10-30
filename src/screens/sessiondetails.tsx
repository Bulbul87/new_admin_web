import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Clock3, CalendarDays, Activity, UserRound, CircleCheck, CircleX } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getProviderAcceptingSessions, type ProviderAcceptingSession } from "../service/admin.service";

type Session = ProviderAcceptingSession & { provider?: any; startedAt?: string | null; endedAt?: string | null; state?: string; source?: string; durationSeconds?: number };
type ApiResult = Session[] | { data?: Session[]; pagination?: { totalPages?: number; totalRecords?: number } };
const FETCH_LIMIT = 100;
async function fetchAllSessionRecords(search: string): Promise<Session[]> {
  const first = await getProviderAcceptingSessions(1, FETCH_LIMIT, search, "", "") as ApiResult;
  if (Array.isArray(first)) return first;
  const records = [...(first.data || [])];
  for (let current = 2; current <= Math.max(1, Number(first.pagination?.totalPages || 1)); current += 1) {
    const result = await getProviderAcceptingSessions(current, FETCH_LIMIT, search, "", "") as ApiResult;
    records.push(...(Array.isArray(result) ? result : result.data || []));
  }
  return records;
}
const providerIdOf = (session: Session) => { const p: any = session.provider; return p && typeof p === "object" ? String(p._id || p.id || "") : typeof p === "string" ? p : ""; };
const providerNameOf = (provider: any) => !provider ? "Unknown Caregiver" : typeof provider === "string" ? provider : `${provider.firstName || ""} ${provider.lastName || ""}`.trim() || provider.email || provider._id || "Unknown Caregiver";
const timestamp = (value?: string | null) => value ? new Date(value).getTime() || 0 : 0;

const ProviderAcceptingSessionDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: encodedProviderId = "" } = useParams<{ id: string }>();
  const providerId = decodeURIComponent(encodedProviderId);
  const routeState = location.state as { provider?: any; caregiverName?: string } | null;
  const [records, setRecords] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchHistory = useCallback(async () => {
    setLoading(true); setError("");
    try {
      // The API's search is used to reduce the result set when caregiver details are available.
      const provider = routeState?.provider;
      const search = provider && typeof provider === "object" ? (provider.email || provider.firstName || "") : "";
      const all = await fetchAllSessionRecords(search);
      setRecords(all.filter((session) => providerIdOf(session) === providerId).sort((a, b) => timestamp(b.startedAt) - timestamp(a.startedAt)));
    } catch (err: any) {
      setRecords([]); setError(err?.response?.data?.message || err?.message || "Unable to fetch caregiver session history.");
    } finally { setLoading(false); }
  }, [providerId, routeState?.provider]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const caregiver = useMemo(() => routeState?.provider || records[0]?.provider, [routeState?.provider, records]);
  const caregiverName = routeState?.caregiverName || providerNameOf(caregiver);
  const totalDuration = records.reduce((sum, item) => sum + (Number(item.durationSeconds) || 0), 0);
  const totalPages = Math.max(1, Math.ceil(records.length / limit));
  const visibleRecords = records.slice((page - 1) * limit, page * limit);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const formatDate = (value?: string | null) => { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString(); };
  const formatDuration = (seconds?: number) => { if (seconds == null || !Number.isFinite(seconds)) return "—"; const n = Math.max(0, Math.floor(seconds)); const days = Math.floor(n / 86400), hours = Math.floor((n % 86400) / 3600), mins = Math.floor((n % 3600) / 60), secs = n % 60; if (days) return `${days}d ${hours}h ${mins}m`; if (hours) return `${hours}h ${mins}m ${secs}s`; if (mins) return `${mins}m ${secs}s`; return `${secs}s`; };
  const thStyle: React.CSSProperties = { padding: "15px 14px", textAlign: "left", color: "#fff", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", background: "#14344A" };
  const tdStyle: React.CSSProperties = { padding: 14, borderBottom: "1px solid #edf0f5", fontSize: 13, color: "#374151", whiteSpace: "nowrap" };

  return <div style={{ marginLeft: 260, marginTop: 70, padding: 30, minHeight: "calc(100vh - 70px)", background: "#f4f7fb", boxSizing: "border-box" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap", marginBottom: 24 }}>
      <div><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ background: "#eaf4fc", color: "#24658d", padding: 11, borderRadius: 12 }}><UserRound size={23} /></div><div><h1 style={{ color: "#14344A", fontSize: 26, fontWeight: 700, margin: 0 }}>Caregiver Session History</h1><p style={{ color: "#718096", fontSize: 13, margin: "7px 0 0" }}>Complete online/offline session records for {caregiverName}.</p></div></div></div>
      <div style={{ display: "flex", gap: 8 }}><button type="button" onClick={() => navigate(-1)} className="booking-back-btn"><ArrowLeft size={17} /> Back to List</button><button type="button" onClick={fetchHistory} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: 0, borderRadius: 9, color: "#fff", background: "linear-gradient(135deg, #14344A, #3977A5)", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button></div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 22 }}>
      {[{ title: "Total Session Records", value: records.length, icon: <Activity size={21} /> }, { title: "Currently Open Sessions", value: records.filter((r) => !r.endedAt).length, icon: <CircleCheck size={21} /> }, { title: "Combined Recorded Duration", value: formatDuration(totalDuration), icon: <Clock3 size={21} /> }, { title: "Latest Session Started", value: records.length ? formatDate(records[0].startedAt) : "—", icon: <CalendarDays size={21} /> }].map((item) => <div key={item.title} style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e8edf4", boxShadow: "0 4px 16px rgba(20,52,74,.04)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}><div style={{ minWidth: 0 }}><p style={{ color: "#718096", fontSize: 12, margin: 0 }}>{item.title}</p><div style={{ color: "#14344A", fontSize: item.title === "Latest Session Started" ? 14 : 23, fontWeight: 700, marginTop: 8, overflowWrap: "anywhere" }}>{item.value}</div></div><div style={{ flexShrink: 0, background: "#eaf4fc", color: "#24658d", borderRadius: 12, padding: 11 }}>{item.icon}</div></div>)}
    </div>

    <div style={{ background: "#fff", border: "1px solid #e8edf4", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(20,52,74,.04)" }}>
      <div style={{ padding: "19px 22px", borderBottom: "1px solid #edf0f5", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}><div><h2 style={{ color: "#14344A", fontSize: 16, fontWeight: 700, margin: 0 }}>All Session Records</h2><p style={{ color: "#718096", fontSize: 12, margin: "5px 0 0" }}>Newest sessions appear first.</p></div><span style={{ padding: "6px 11px", borderRadius: 20, background: "#eaf4fc", color: "#24658d", fontSize: 12, fontWeight: 700 }}>{records.length} records</span></div>
      {error && <div style={{ margin: 16, padding: 13, borderRadius: 8, background: "#fff1f1", color: "#b42318", fontSize: 13 }}>{error}</div>}
      <div style={{ overflowX: "auto", width: "100%" }}><table style={{ width: "100%", minWidth: 1100, borderCollapse: "collapse" }}><thead><tr>{["#", "State", "Started At", "Ended At", "Duration", "Source", "Session Status"].map((heading) => <th key={heading} style={thStyle}>{heading}</th>)}</tr></thead><tbody>
        {loading ? <tr><td colSpan={7} style={{ ...tdStyle, padding: 45, textAlign: "center" }}>Loading complete session history...</td></tr> : visibleRecords.length === 0 ? <tr><td colSpan={7} style={{ ...tdStyle, padding: 45, textAlign: "center", color: "#718096" }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}><CircleX size={25} /><span>No session history found for this caregiver.</span></div></td></tr> : visibleRecords.map((record, index) => <tr key={record._id || `${providerId}-${index}`}><td style={tdStyle}>{(page - 1) * limit + index + 1}</td><td style={tdStyle}><span style={{ display: "inline-block", padding: "5px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: record.state === "online" ? "#16803d" : "#596579", background: record.state === "online" ? "#e5f8ec" : "#edf0f4", textTransform: "capitalize" }}>{record.state || "Unknown"}</span></td><td style={tdStyle}>{formatDate(record.startedAt)}</td><td style={tdStyle}>{record.endedAt ? formatDate(record.endedAt) : <span style={{ color: "#16803d", fontWeight: 600 }}>Open Session</span>}</td><td style={tdStyle}>{formatDuration(record.durationSeconds)}</td><td style={{ ...tdStyle, textTransform: "capitalize" }}>{String(record.source || "—").replaceAll("_", " ")}</td><td style={tdStyle}><span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: record.endedAt ? "#596579" : "#16803d", fontWeight: 600 }}>{record.endedAt ? <><CircleX size={15} /> Closed</> : <><CircleCheck size={15} /> Active</>}</span></td></tr>)}
      </tbody></table></div>
      {!loading && records.length > 0 && <div style={{ padding: "16px 22px", borderTop: "1px solid #edf0f5", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}><span style={{ fontSize: 13, color: "#718096" }}>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, records.length)} of {records.length} records</span><div style={{ display: "flex", alignItems: "center", gap: 8 }}><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="booking-back-btn" style={{ opacity: page <= 1 ? .5 : 1 }}>Previous</button><span style={{ color: "#14344A", fontSize: 13, fontWeight: 600, padding: "0 8px" }}>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="booking-back-btn" style={{ opacity: page >= totalPages ? .5 : 1 }}>Next</button></div></div>}
    </div>
  </div>;
};
export default ProviderAcceptingSessionDetail;