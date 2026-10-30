import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Search, Activity, Eye, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProviderAcceptingSessions, type ProviderAcceptingSession } from "../service/admin.service";

type Session = ProviderAcceptingSession & { provider?: any; startedAt?: string | null; endedAt?: string | null; state?: string; source?: string; durationSeconds?: number };
type ApiResult = Session[] | { data?: Session[]; pagination?: { totalPages?: number; totalRecords?: number } };
const FETCH_LIMIT = 100;

const getProviderId = (session: Session) => {
  const provider: any = session.provider;
  if (provider && typeof provider === "object") return String(provider._id || provider.id || "");
  return typeof provider === "string" ? provider : "";
};
const getProviderName = (provider: any) => {
  if (!provider) return "Unknown Caregiver";
  if (typeof provider === "string") return provider;
  return `${provider.firstName || ""} ${provider.lastName || ""}`.trim() || provider.email || provider._id || "Unknown Caregiver";
};
const dateValue = (value?: string | null) => value ? new Date(value).getTime() || 0 : 0;

async function fetchAllSessionRecords(search: string): Promise<Session[]> {
  const first = await getProviderAcceptingSessions(1, FETCH_LIMIT, search, "", "") as ApiResult;
  if (Array.isArray(first)) return first;
  const records = [...(first.data || [])];
  const pages = Math.max(1, Number(first.pagination?.totalPages || 1));
  for (let current = 2; current <= pages; current += 1) {
    const result = await getProviderAcceptingSessions(current, FETCH_LIMIT, search, "", "") as ApiResult;
    records.push(...(Array.isArray(result) ? result : result.data || []));
  }
  return records;
}

const ProviderOnlineOfflineStatus: React.FC = () => {
  const navigate = useNavigate();
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchSessions = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const records = await fetchAllSessionRecords(search);
      setAllSessions(records);
    } catch (err: any) {
      setAllSessions([]);
      setError(err?.response?.data?.message || err?.message || "Unable to fetch caregiver session records.");
    } finally { setLoading(false); }
  }, [search]);
  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Pick the latest session per caregiver from the complete result set.
  const latestByCaregiver = useMemo(() => {
    const map = new Map<string, Session>();
    allSessions.forEach((session) => {
      const id = getProviderId(session);
      if (!id) return;
      const previous = map.get(id);
      if (!previous || dateValue(session.startedAt) > dateValue(previous.startedAt)) map.set(id, session);
    });
    return [...map.values()].sort((a, b) => dateValue(b.startedAt) - dateValue(a.startedAt));
  }, [allSessions]);

  const filteredSessions = useMemo(() => latestByCaregiver.filter((session) =>
    (!state || String(session.state || "").toLowerCase() === state) &&
    (!source || String(session.source || "").toLowerCase() === source)
  ), [latestByCaregiver, state, source]);
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / limit));
  const visibleSessions = filteredSessions.slice((page - 1) * limit, page * limit);
  const openSessions = filteredSessions.filter((session) => !session.endedAt).length;

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); };
  const clearFilters = () => { setSearchInput(""); setSearch(""); setState(""); setSource(""); setPage(1); };
  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
  };
  const formatDuration = (seconds?: number) => {
    if (seconds == null || !Number.isFinite(seconds)) return "—";
    const total = Math.max(0, Math.floor(seconds));
    const days = Math.floor(total / 86400), hours = Math.floor((total % 86400) / 3600), minutes = Math.floor((total % 3600) / 60), secs = total % 60;
    if (days) return `${days}d ${hours}h ${minutes}m`;
    if (hours) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };
  const thStyle: React.CSSProperties = { padding: "15px 14px", textAlign: "left", color: "#fff", fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap", background: "#14344A" };
  const tdStyle: React.CSSProperties = { padding: "14px", borderBottom: "1px solid #edf0f5", fontSize: "13px", color: "#374151", whiteSpace: "nowrap" };
  const inputStyle: React.CSSProperties = { padding: "11px 13px", border: "1px solid #dce3ec", borderRadius: "9px", background: "#fff", color: "#14344A", fontSize: "13px", minWidth: 0, outline: "none" };

  return <div style={{ marginLeft: "260px", marginTop: "70px", padding: "30px", minHeight: "calc(100vh - 70px)", background: "#f4f7fb", boxSizing: "border-box" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap", marginBottom: 25 }}>
      <div><h1 style={{ color: "#14344A", fontSize: 26, fontWeight: 700, margin: 0 }}>Caregiver Online/Offline Status</h1><p style={{ margin: "8px 0 0", color: "#718096", fontSize: 13 }}>One latest session per caregiver. Open the eye icon to view complete session history.</p></div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => navigate("/users")} className="booking-back-btn"><ArrowLeft size={17} /> Back</button>
        <button type="button" onClick={fetchSessions} disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: 0, borderRadius: 9, color: "#fff", background: "linear-gradient(135deg, #14344A, #3977A5)", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18, marginBottom: 24 }}>
      {[{ title: "Caregivers", value: latestByCaregiver.length, icon: <Users size={22} /> }, { title: "Currently Open Sessions", value: openSessions, icon: <Activity size={22} /> }].map((item) => <div key={item.title} style={{ background: "#fff", borderRadius: 14, padding: 22, border: "1px solid #e8edf4", boxShadow: "0 4px 16px rgba(20,52,74,.04)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}><div><p style={{ color: "#718096", fontSize: 13, margin: 0 }}>{item.title}</p><h2 style={{ color: "#14344A", fontSize: 27, fontWeight: 700, margin: "8px 0 0" }}>{item.value}</h2></div><div style={{ background: "#eaf4fc", color: "#24658d", borderRadius: 12, padding: 12 }}>{item.icon}</div></div>)}
    </div>

    <div style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 22, border: "1px solid #e8edf4", boxShadow: "0 4px 16px rgba(20,52,74,.04)" }}>
      <form onSubmit={handleSearch} style={{ display: "grid", gridTemplateColumns: "minmax(220px, 2fr) repeat(2, minmax(145px, 1fr)) auto auto", gap: 12, alignItems: "center" }}>
        <div style={{ position: "relative" }}><Search size={17} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8492a6" }} /><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search caregiver name or email" style={{ ...inputStyle, width: "100%", boxSizing: "border-box", paddingLeft: 38 }} /></div>
        <select value={state} onChange={(e) => { setState(e.target.value); setPage(1); }} style={inputStyle}><option value="">All States</option><option value="online">Online</option><option value="offline">Offline</option></select>
        <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }} style={inputStyle}><option value="">All Sources</option><option value="toggle">Toggle</option><option value="logout">Logout</option><option value="admin_suspend">Admin Suspend</option><option value="backfill">Backfill</option></select>
        <button type="submit" style={{ ...inputStyle, color: "#fff", background: "#14344A", border: 0, fontWeight: 600, cursor: "pointer" }}>Search</button>
        <button type="button" onClick={clearFilters} style={{ ...inputStyle, fontWeight: 600, cursor: "pointer" }}>Clear</button>
      </form>
    </div>

    <div style={{ background: "#fff", border: "1px solid #e8edf4", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(20,52,74,.04)" }}>
      <div style={{ padding: "19px 22px", borderBottom: "1px solid #edf0f5", color: "#14344A", fontSize: 16, fontWeight: 700 }}>Latest Session per Caregiver</div>
      {error && <div style={{ margin: 16, padding: 13, borderRadius: 8, background: "#fff1f1", color: "#b42318", fontSize: 13 }}>{error}</div>}
      <div style={{ overflowX: "auto", width: "100%" }}><table style={{ width: "100%", minWidth: 1100, borderCollapse: "collapse" }}><thead><tr>{["Caregiver", "State", "Started At", "Ended At", "Duration", "Source", "View Details"].map((heading) => <th key={heading} style={thStyle}>{heading}</th>)}</tr></thead><tbody>
        {loading ? <tr><td colSpan={7} style={{ ...tdStyle, padding: 45, textAlign: "center" }}>Loading caregiver sessions...</td></tr> : visibleSessions.length === 0 ? <tr><td colSpan={7} style={{ ...tdStyle, padding: 45, textAlign: "center", color: "#718096" }}>No caregiver session records found.</td></tr> : visibleSessions.map((session) => { const provider: any = session.provider && typeof session.provider === "object" ? session.provider : null; const providerId = getProviderId(session); return <tr key={providerId || session._id}>
          <td style={tdStyle}><div style={{ color: "#14344A", fontWeight: 600 }}>{getProviderName(session.provider)}</div>{provider?.email && <div style={{ color: "#8492a6", fontSize: 12, marginTop: 4 }}>{provider.email}</div>}</td>
          <td style={tdStyle}><span style={{ display: "inline-block", padding: "5px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: session.state === "online" ? "#16803d" : "#596579", background: session.state === "online" ? "#e5f8ec" : "#edf0f4", textTransform: "capitalize" }}>{session.state || "Unknown"}</span></td>
          <td style={tdStyle}>{formatDate(session.startedAt)}</td><td style={tdStyle}>{session.endedAt ? formatDate(session.endedAt) : "Open Session"}</td><td style={tdStyle}>{formatDuration(session.durationSeconds)}</td><td style={{ ...tdStyle, textTransform: "capitalize" }}>{String(session.source || "—").replaceAll("_", " ")}</td>
          <td style={tdStyle}>
            <button type="button" title="View complete session history" aria-label={`View session history for ${getProviderName(session.provider)}`} 
            onClick={() => navigate(`/provider-status/${encodeURIComponent(providerId)}`, { state: { provider: session.provider, caregiverName: getProviderName(session.provider) } })} disabled={!providerId} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, border: 0, borderRadius: 8, padding: "8px 10px", background: "#eaf4fc", color: "#24658d", cursor: providerId ? "pointer" : "not-allowed" }}><Eye size={17} /> View</button></td>
        </tr>; })}
      </tbody></table></div>
      {!loading && filteredSessions.length > 0 && <div style={{ padding: "16px 22px", borderTop: "1px solid #edf0f5", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}><span style={{ fontSize: 13, color: "#718096" }}>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, filteredSessions.length)} of {filteredSessions.length} caregivers</span><div style={{ display: "flex", alignItems: "center", gap: 8 }}><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="booking-back-btn" style={{ opacity: page <= 1 ? .5 : 1 }}>Previous</button><span style={{ color: "#14344A", fontSize: 13, fontWeight: 600, padding: "0 8px" }}>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="booking-back-btn" style={{ opacity: page >= totalPages ? .5 : 1 }}>Next</button></div></div>}
    </div>
  </div>;
};
export default ProviderOnlineOfflineStatus;