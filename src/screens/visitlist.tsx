import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  KeyRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import "./visit.css";

import {
  getAllAccessCodeVisits,
  type AccessCodeVisit,
} from "../service/visitaccesscodeservice";

import { toast } from "react-toastify";

const PAGE_SIZE = 20;

const AccessCodeList: React.FC = () => {
  const navigate = useNavigate();

  const [visits, setVisits] = useState<AccessCodeVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Prevent stale API responses from overwriting newer results.
  const requestIdRef = useRef(0);

  // =====================================================
  // COMMON HELPERS
  // =====================================================

  const getRequesterId = (item: AccessCodeVisit): string => {
    const booking =
      item.booking && typeof item.booking !== "string"
        ? item.booking
        : undefined;

    const bookingUser =
      booking?.user && typeof booking.user !== "string"
        ? booking.user
        : undefined;

    const directUser =
      item.user && typeof item.user !== "string"
        ? item.user
        : undefined;

    return (
      item.requesterPublicId ||
      bookingUser?.requestorInfo?.publicRequesterId ||
      directUser?.requestorInfo?.publicRequesterId ||
      "-"
    );
  };

  const getVisitDate = (item: AccessCodeVisit): string => {
    return item.visitDate || item.scheduledDate || "-";
  };

  const getVisitTime = (item: AccessCodeVisit): string => {
    const start =
      item.visitStartTime ||
      item.fromTime ||
      item.scheduledTime?.start;

    const end =
      item.visitEndTime ||
      item.toTime ||
      item.scheduledTime?.end;

    if (start && end) {
      return `${start} - ${end}`;
    }

    return start || end || "-";
  };

  const getBookingStatus = (item: AccessCodeVisit): string => {
    return item.bookingStatus || item.status || "Unknown";
  };

  const getAccessCodeStatus = (item: AccessCodeVisit) => {
    const codeStatus = item.codeStatus?.toUpperCase();

    if (codeStatus === "USED" || item.accessCodeUsed) {
      return {
        text: "Used",
        bg: "#ECFDF3",
        color: "#15803D",
      };
    }

    if (codeStatus === "PENDING") {
      return {
        text: "Not Generated",
        bg: "#F3F4F6",
        color: "#6B7280",
      };
    }

    if (codeStatus === "ACTIVE" || item.accessCode) {
      return {
        text: "Active",
        bg: "#EFF6FF",
        color: "#2563EB",
      };
    }

    return {
      text: "Not Generated",
      bg: "#F3F4F6",
      color: "#6B7280",
    };
  };

  const getRecordLabel = (item: AccessCodeVisit): string => {
    if (item.recordType === "visit") {
      return `Visit #${(item.visitIndex ?? 0) + 1}`;
    }

    return "One-day Booking";
  };

  // =====================================================
  // FETCH ACCESS CODE RECORDS
  // =====================================================

  const loadVisits = async (
    page = 1,
    isRefresh = false,
    searchValue = search,
    statusValue = status
  ) => {
    const requestId = ++requestIdRef.current;

    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getAllAccessCodeVisits({
        page,
        limit: PAGE_SIZE,
        search: searchValue.trim(),
        status: statusValue === "all" ? "" : statusValue,
      });

      // Ignore responses belonging to older requests.
      if (requestId !== requestIdRef.current) {
        return;
      }

      setVisits(Array.isArray(response.data) ? response.data : []);

      setTotalRecords(
        response.pagination?.total ?? response.data.length
      );

      setTotalPages(
        Math.max(response.pagination?.totalPages ?? 1, 1)
      );

      setCurrentPage(response.pagination?.page ?? page);
    } catch (err: unknown) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load access codes.";

      setError(message);
      setVisits([]);
      setTotalRecords(0);
      setTotalPages(1);
      toast.error(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Initial load and debounced server-side search/status filtering.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadVisits(1, false, search, status);
    }, search.trim() ? 350 : 0);

    return () => {
      window.clearTimeout(timer);

      // Invalidate an in-flight request when filters change.
      requestIdRef.current += 1;
    };

    // loadVisits is intentionally invoked with current filter values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    loadVisits(page, false, search, status);
  };

  const handleRefresh = () => {
    loadVisits(currentPage, true, search, status);
  };

  // =====================================================
  // FORMATTERS
  // =====================================================

  const formatDate = (date?: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (value?: string) => {
    const currentStatus = value?.toLowerCase().replace(/_/g, "-");

    switch (currentStatus) {
      case "completed":
        return {
          bg: "#ECFDF3",
          color: "#15803D",
          icon: <CheckCircle2 size={14} />,
        };

      case "cancelled":
      case "canceled":
      case "cancelled-by-requestor":
      case "cancelled-by-provider":
        return {
          bg: "#FEF2F2",
          color: "#DC2626",
          icon: <XCircle size={14} />,
        };

      case "in-progress":
      case "active":
      case "confirmed":
      case "scheduled":
      case "arrived":
      case "en-route":
        return {
          bg: "#EFF6FF",
          color: "#2563EB",
          icon: <Clock size={14} />,
        };

      default:
        return {
          bg: "#F3F4F6",
          color: "#4B5563",
          icon: <Clock size={14} />,
        };
    }
  };

  // These stats reflect the currently loaded page, except Total Visits,
  // which comes from the server's total-record count.
  const accessCodesOnPage = visits.filter(
    (item) => Boolean(item.accessCode)
  ).length;

  const usedCodesOnPage = visits.filter(
    (item) =>
      item.codeStatus?.toUpperCase() === "USED" ||
      Boolean(item.accessCodeUsed)
  ).length;

  const pendingCodesOnPage = visits.filter(
    (item) =>
      item.codeStatus?.toUpperCase() === "PENDING" ||
      (!item.accessCode && !item.accessCodeUsed)
  ).length;

  // Backend handles search and status filtering across all pages.
  const filteredVisits = visits;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        marginLeft: 260,
        marginTop: 70,
        minHeight: "calc(100vh - 70px)",
        background: "#F5F7FB",
        padding: "28px 30px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 7,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg, #14344A, #163A5F)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(20,52,74,0.18)",
              }}
            >
              <KeyRound size={21} color="#fff" />
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 25,
                fontWeight: 700,
                color: "#14344A",
              }}
            >
              Access Codes
            </h1>
          </div>

          <p
            style={{
              margin: 0,
              color: "#6B7280",
              fontSize: 14,
            }}
          >
            Manage and monitor access codes generated for service visits.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            height: 42,
            padding: "0 16px",
            borderRadius: 10,
            border: "1px solid #D9E0E7",
            background: "#fff",
            color: "#14344A",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: refreshing ? "not-allowed" : "pointer",
            boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
          }}
        >
          <RefreshCw
            size={16}
            style={{
              animation: refreshing ? "spin 1s linear infinite" : undefined,
            }}
          />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <StatCard
          icon={<ShieldCheck size={19} />}
          title="Total Visits"
          value={totalRecords}
        />

        <StatCard
          icon={<KeyRound size={19} />}
          title="Access Codes"
          value={accessCodesOnPage}
        />

        <StatCard
          icon={<CheckCircle2 size={19} />}
          title="Used Codes"
          value={usedCodesOnPage}
        />

        <StatCard
          icon={<Clock size={19} />}
          title="Pending"
          value={pendingCodesOnPage}
        />
      </div>

      {/* Main Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #E7EBF0",
          boxShadow: "0 8px 25px rgba(20,52,74,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Filters */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #EEF1F4",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: 260,
            }}
          >
            <Search
              size={17}
              color="#9CA3AF"
              style={{
                position: "absolute",
                left: 13,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by Requester Public ID..."
              style={{
                width: "100%",
                height: 42,
                boxSizing: "border-box",
                border: "1px solid #DCE2E8",
                borderRadius: 9,
                outline: "none",
                padding: "0 14px 0 40px",
                fontSize: 13,
                color: "#1F2937",
                background: "#FAFBFC",
              }}
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={{
              height: 42,
              minWidth: 145,
              padding: "0 12px",
              border: "1px solid #DCE2E8",
              borderRadius: 9,
              background: "#FAFBFC",
              color: "#374151",
              fontSize: 13,
              outline: "none",
            }}
          >
            <option value="all">All Code Status</option>
            <option value="USED">Used</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
          </select>

          <div
            style={{
              fontSize: 13,
              color: "#6B7280",
              whiteSpace: "nowrap",
            }}
          >
            Showing{" "}
            <strong style={{ color: "#14344A" }}>
              {filteredVisits.length}
            </strong>{" "}
            {search.trim() ? "matching records on this page" : "of"}{" "}
            {!search.trim() && (
              <strong style={{ color: "#14344A" }}>
                {totalRecords}
              </strong>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              margin: 18,
              padding: "13px 15px",
              borderRadius: 10,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#B91C1C",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div
            style={{
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "#6B7280",
            }}
          >
            <RefreshCw
              size={25}
              style={{
                animation: "spin 1s linear infinite",
              }}
            />

            <span style={{ fontSize: 13 }}>
              Loading access code visits...
            </span>
          </div>
        ) : filteredVisits.length === 0 ? (
          <div
            style={{
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B7280",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "#F3F6F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <KeyRound size={23} color="#14344A" />
            </div>

            <strong
              style={{
                color: "#374151",
                fontSize: 15,
              }}
            >
              No access code records found
            </strong>

            <span style={{ fontSize: 13 }}>
              Try changing your search or filter.
            </span>
          </div>
        ) : (
          <>
            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: 1050,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#F8FAFC",
                      borderBottom: "1px solid #E9EDF2",
                    }}
                  >
                    <TableHeader>Requester ID</TableHeader>
                    <TableHeader>Access Code</TableHeader>
                    <TableHeader>Visit Date</TableHeader>
                    <TableHeader>Time</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Code Status</TableHeader>
                    <TableHeader>Created</TableHeader>
                    <TableHeader align="center">Action</TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {filteredVisits.map((visit) => {
                    const statusStyle = getStatusStyle(
                      getBookingStatus(visit)
                    );

                    const codeStatus = getAccessCodeStatus(visit);

                    return (
                      <tr
                        key={`${visit.recordType}-${visit._id}`}
                        style={{
                          borderBottom: "1px solid #EEF1F4",
                        }}
                      >
                        {/* Requester */}
                        <TableCell>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 9,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 9,
                                background: "#EEF5F9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <ShieldCheck size={16} color="#14344A" />
                            </div>

                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "#1F2937",
                                  fontSize: 12,
                                }}
                              >
                                {getRequesterId(visit)}
                              </div>

                              <div
                                style={{
                                  color: "#9CA3AF",
                                  fontSize: 11,
                                  marginTop: 2,
                                }}
                              >
                                {getRecordLabel(visit)}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Access Code */}
                        <TableCell>
                          {visit.accessCode ? (
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 7,
                                padding: "6px 10px",
                                borderRadius: 8,
                                background: "#F3F7FA",
                                color: "#14344A",
                                fontWeight: 700,
                                letterSpacing: "1.5px",
                                fontSize: 13,
                              }}
                            >
                              <KeyRound size={14} />
                              {visit.accessCode}
                            </div>
                          ) : (
                            <span style={{ color: "#9CA3AF" }}>-</span>
                          )}
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              color: "#374151",
                              fontSize: 13,
                            }}
                          >
                            <CalendarDays size={15} color="#7B8794" />
                            {formatDate(getVisitDate(visit))}
                          </div>
                        </TableCell>

                        {/* Time */}
                        <TableCell>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              color: "#4B5563",
                              fontSize: 12,
                            }}
                          >
                            <Clock size={14} color="#7B8794" />
                            {getVisitTime(visit)}
                          </div>
                        </TableCell>

                        {/* Booking Status */}
                        <TableCell>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "5px 9px",
                              borderRadius: 20,
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {statusStyle.icon}
                            {getBookingStatus(visit).replace(/[-_]/g, " ")}
                          </span>
                        </TableCell>

                        {/* Code Status */}
                        <TableCell>
                          <span
                            style={{
                              padding: "5px 9px",
                              borderRadius: 20,
                              background: codeStatus.bg,
                              color: codeStatus.color,
                              fontSize: 11,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {codeStatus.text}
                          </span>
                        </TableCell>

                        {/* Created */}
                        <TableCell>
                          <span
                            style={{
                              color: "#6B7280",
                              fontSize: 12,
                            }}
                          >
                            {formatDateTime(visit.createdAt)}
                          </span>
                        </TableCell>

                        {/* Action */}
                        <TableCell align="center">
                          <button
                            onClick={() =>
                              navigate(
                                `/access-codes/${visit._id}?type=${visit.recordType || "booking"}`
                              )
                            }
                            style={{
                              height: 34,
                              padding: "0 12px",
                              borderRadius: 8,
                              border: "1px solid #D8E1E8",
                              background: "#fff",
                              color: "#14344A",
                              fontSize: 12,
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              cursor: "pointer",
                            }}
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </TableCell>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="access-pagination-wrapper">
                <div className="access-pagination-info">
                  Showing{" "}
                  <span className="access-pagination-number">
                    {(currentPage - 1) * PAGE_SIZE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="access-pagination-number">
                    {Math.min(currentPage * PAGE_SIZE, totalRecords)}
                  </span>{" "}
                  of{" "}
                  <span className="access-pagination-number">
                    {totalRecords}
                  </span>{" "}
                  records
                </div>

                <div className="access-pagination">
                  <button
                    type="button"
                    disabled={currentPage === 1 || loading}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`access-pagination-btn ${
                      currentPage === 1
                        ? "access-pagination-btn-disabled"
                        : "access-pagination-btn-normal"
                    }`}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        disabled={loading}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`access-pagination-btn ${
                          currentPage === pageNumber
                            ? "access-pagination-btn-active"
                            : "access-pagination-btn-normal"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages || loading}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`access-pagination-btn ${
                      currentPage === totalPages
                        ? "access-pagination-btn-disabled"
                        : "access-pagination-btn-normal"
                    }`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          button:hover {
            opacity: 0.92;
          }

          input:focus,
          select:focus {
            border-color: #8FDAFA !important;
            box-shadow: 0 0 0 3px rgba(143,218,250,0.14);
          }
        `}
      </style>
    </div>
  );
};

// =====================================================
// STAT CARD
// =====================================================

const StatCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) => {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E7EBF0",
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 13,
        boxShadow: "0 5px 18px rgba(20,52,74,0.045)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: "linear-gradient(135deg, #14344A, #163A5F)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: 11,
            color: "#7B8794",
            marginBottom: 3,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 21,
            fontWeight: 700,
            color: "#14344A",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// TABLE COMPONENTS
// =====================================================

const TableHeader = ({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) => (
  <th
    style={{
      padding: "13px 16px",
      textAlign: align,
      color: "#667085",
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.4px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </th>
);

const TableCell = ({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) => (
  <td
    style={{
      padding: "13px 16px",
      textAlign: align,
      verticalAlign: "middle",
    }}
  >
    {children}
  </td>
);

export default AccessCodeList;
