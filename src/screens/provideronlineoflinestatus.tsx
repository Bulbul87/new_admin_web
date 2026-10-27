
import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, Search, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getProviderAcceptingSessions,
  type ProviderAcceptingSession,
} from "../service/admin.service";

const ProviderOnlineOfflineStatus: React.FC = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<ProviderAcceptingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [source, setSource] = useState("");

  const [page, setPage] = useState(1);
  const limit = 20;

  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
     const response = await getProviderAcceptingSessions(
  page,
  limit,
  search,
  state,
  source
);

setSessions(Array.isArray(response) ? response : response.data || []);
setTotalRecords(response.pagination?.totalRecords || 0);
setTotalPages(response.pagination?.totalPages || 1);
    } catch (err: any) {
      setSessions([]);
      setTotalRecords(0);
      setTotalPages(0);

      setError(
        err?.response?.data?.message ||
          "Unable to fetch caregiver session records."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, state, source]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setState("");
    setSource("");
    setPage(1);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString();
  };

  const formatDuration = (seconds?: number) => {
    if (seconds == null || !Number.isFinite(seconds)) {
      return "—";
    }

    const total = Math.max(0, Math.floor(seconds));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;

    return `${secs}s`;
  };

  const getProviderName = (
    provider: ProviderAcceptingSession["provider"]
  ) => {
    if (!provider) return "Unknown Caregiver";

    if (typeof provider === "string") return provider;

    const fullName = `${provider.firstName || ""} ${
      provider.lastName || ""
    }`.trim();

    return fullName || provider.email || provider._id;
  };

  const openSessions = sessions.filter(
    (session) => session.endedAt == null
  ).length;

  const thStyle: React.CSSProperties = {
    padding: "15px 14px",
    textAlign: "left",
    color: "#fff",
    fontWeight: 600,
    fontSize: "13px",
    whiteSpace: "nowrap",
    background: "#14344A",
  };

  const tdStyle: React.CSSProperties = {
    padding: "14px",
    borderBottom: "1px solid #edf0f5",
    fontSize: "13px",
    color: "#374151",
    whiteSpace: "nowrap",
  };

  const inputStyle: React.CSSProperties = {
    padding: "11px 13px",
    border: "1px solid #dce3ec",
    borderRadius: "9px",
    background: "#fff",
    color: "#14344A",
    fontSize: "13px",
    minWidth: 0,
    outline: "none",
  };

  return (
    <div
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        padding: "30px",
        minHeight: "calc(100vh - 70px)",
        background: "#f4f7fb",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              color: "#14344A",
              fontSize: "26px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Caregiver Online/Offline Status
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#718096",
              fontSize: "13px",
            }}
          >
            View caregiver availability sessions and complete history.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="booking-back-btn"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <button
            type="button"
            onClick={fetchSessions}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px 16px",
              border: "none",
              borderRadius: "9px",
              color: "#fff",
              background: "linear-gradient(135deg, #14344A, #3977A5)",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "18px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            title: "Total Session Records",
            value: totalRecords,
            icon: <Activity size={22} />,
          },
          {
            title: "Open Sessions (Current Page)",
            value: openSessions,
            icon: <RefreshCw size={22} />,
          },
        ].map((item) => (
          <div
            key={item.title}
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "22px",
              border: "1px solid #e8edf4",
              boxShadow: "0 4px 16px rgba(20,52,74,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div>
              <p
                style={{
                  color: "#718096",
                  fontSize: "13px",
                  margin: 0,
                }}
              >
                {item.title}
              </p>
              <h2
                style={{
                  color: "#14344A",
                  fontSize: "27px",
                  fontWeight: 700,
                  margin: "8px 0 0",
                }}
              >
                {item.value}
              </h2>
            </div>

            <div
              style={{
                background: "#eaf4fc",
                color: "#24658d",
                borderRadius: "12px",
                padding: "12px",
              }}
            >
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Search and filters */}
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "20px",
          marginBottom: "22px",
          border: "1px solid #e8edf4",
          boxShadow: "0 4px 16px rgba(20,52,74,0.04)",
        }}
      >
        <form
          onSubmit={handleSearch}
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 2fr) repeat(2, minmax(145px, 1fr)) auto auto",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={17}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#8492a6",
              }}
            />

            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search caregiver name or email"
              style={{
                ...inputStyle,
                width: "100%",
                boxSizing: "border-box",
                paddingLeft: "38px",
              }}
            />
          </div>

          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setPage(1);
            }}
            style={inputStyle}
          >
            <option value="">All States</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>

          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPage(1);
            }}
            style={inputStyle}
          >
            <option value="">All Sources</option>
            <option value="toggle">Toggle</option>
            <option value="logout">Logout</option>
            <option value="admin_suspend">Admin Suspend</option>
            <option value="backfill">Backfill</option>
          </select>

          <button
            type="submit"
            style={{
              ...inputStyle,
              color: "#fff",
              background: "#14344A",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Search
          </button>

          <button
            type="button"
            onClick={clearFilters}
            style={{
              ...inputStyle,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </form>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8edf4",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(20,52,74,0.04)",
        }}
      >
        <div
          style={{
            padding: "19px 22px",
            borderBottom: "1px solid #edf0f5",
            color: "#14344A",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          Caregiver Session Records
        </div>

        {error && (
          <div
            style={{
              margin: "16px",
              padding: "13px",
              borderRadius: "8px",
              background: "#fff1f1",
              color: "#b42318",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            style={{
              width: "100%",
              minWidth: "1500px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                {[
                  "Caregiver",
                  "Provider ID",
                  "State",
                  "Started At",
                  "Ended At",
                  "Duration",
                  "Source",
                  "Created At",
                  "Updated At",
                ].map((heading) => (
                  <th key={heading} style={thStyle}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      ...tdStyle,
                      padding: "45px",
                      textAlign: "center",
                    }}
                  >
                    Loading caregiver sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      ...tdStyle,
                      padding: "45px",
                      textAlign: "center",
                      color: "#718096",
                    }}
                  >
                    No caregiver session records found.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => {
                  const provider =
                    session.provider &&
                    typeof session.provider === "object"
                      ? session.provider
                      : null;

                  const providerId =
                    provider?._id ||
                    (typeof session.provider === "string"
                      ? session.provider
                      : "—");

                  return (
                    <tr key={session._id}>
                      <td style={tdStyle}>
                        <div
                          style={{
                            color: "#14344A",
                            fontWeight: 600,
                          }}
                        >
                          {getProviderName(session.provider)}
                        </div>
                        {provider?.email && (
                          <div
                            style={{
                              color: "#8492a6",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            {provider.email}
                          </div>
                        )}
                      </td>

                      <td style={tdStyle}>{providerId}</td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "5px 11px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 700,
                            color:
                              session.state === "online"
                                ? "#16803d"
                                : "#596579",
                            background:
                              session.state === "online"
                                ? "#e5f8ec"
                                : "#edf0f4",
                          }}
                        >
                          {session.state}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {formatDate(session.startedAt)}
                      </td>

                      <td style={tdStyle}>
                        {session.endedAt
                          ? formatDate(session.endedAt)
                          : "Open Session"}
                      </td>

                      <td style={tdStyle}>
                        {formatDuration(session.durationSeconds)}
                      </td>

                      <td style={tdStyle}>{session.source}</td>

                      <td style={tdStyle}>
                        {formatDate(session.createdAt)}
                      </td>

                      <td style={tdStyle}>
                        {formatDate(session.updatedAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalRecords > 0 && (
          <div
            style={{
              padding: "16px 22px",
              borderTop: "1px solid #edf0f5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#718096" }}>
              Showing {(page - 1) * limit + 1}–
              {Math.min(page * limit, totalRecords)} of {totalRecords} records
            </span>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="booking-back-btn"
                style={{ opacity: page <= 1 ? 0.5 : 1 }}
              >
                Previous
              </button>

              <span
                style={{
                  color: "#14344A",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "0 8px",
                }}
              >
                Page {page} of {Math.max(1, totalPages)}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="booking-back-btn"
                style={{
                  opacity: page >= totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderOnlineOfflineStatus;
