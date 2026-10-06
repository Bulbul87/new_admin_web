
import React, { useEffect, useState } from "react";

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
import './visit.css';
import {
  getAllAccessCodeVisits,
  type AccessCodeVisit,
} from "../service/visitaccesscodeservice";


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

const loadVisits = async (
  page = currentPage,
  isRefresh = false
) => {
  try {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    console.log(
      `Fetching access code visits - page: ${page}, limit: ${PAGE_SIZE}`
    );

    const data = await getAllAccessCodeVisits({
      page,
      limit: PAGE_SIZE,
      search: search.trim(),
      status: status === "all" ? "" : status,
    });

    console.log("ACCESS CODE PAGINATED RESPONSE:", data);

    // Backend records
    const pageVisits: AccessCodeVisit[] = data?.data || [];

    // Backend pagination
    const total = Number(
      data?.pagination?.total || 0
    );

  const pages = Number(
  data?.pagination?.totalPages || 1
);

    const current = Number(
      data?.pagination?.page || page
    );

console.log("🔥 PAGINATION DEBUG:", {
  total: data?.pagination?.total,
  pages: data?.pagination?.totalPages,
  page: data?.pagination?.page,
  totalPagesState: pages,
});

    setVisits(pageVisits);
    setTotalRecords(total);
    setTotalPages(Math.max(pages, 1));
    setCurrentPage(current);

  } catch (err: any) {
    console.error("Access code list error:", err);

    setError(
      err?.message || "Failed to load access code visits."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};


  useEffect(() => {
    loadVisits(1);
  }, []);

  /*
   * Search/status changes
   * Reset pagination to page 1.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        loadVisits(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    loadVisits(page);
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
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
      return "-";
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
    const currentStatus = value?.toLowerCase();

    switch (currentStatus) {
      case "completed":
        return {
          bg: "#ECFDF3",
          color: "#15803D",
          icon: <CheckCircle2 size={14} />,
        };

      case "cancelled":
      case "canceled":
        return {
          bg: "#FEF2F2",
          color: "#DC2626",
          icon: <XCircle size={14} />,
        };

      case "in-progress":
      case "active":
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

  const getAccessCodeStatus = (visit: AccessCodeVisit) => {
    if (visit.accessCodeUsed) {
      return {
        text: "Used",
        bg: "#ECFDF3",
        color: "#15803D",
      };
    }

    if (visit.accessCode) {
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

  /*
   * Page numbers
   */
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

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
                background:
                  "linear-gradient(135deg, #14344A, #163A5F)",
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
          onClick={() => loadVisits(currentPage, true)}
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
              animation: refreshing
                ? "spin 1s linear infinite"
                : undefined,
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
          value={visits.filter((v) => !!v.accessCode).length}
        />

        <StatCard
          icon={<CheckCircle2 size={19} />}
          title="Used Codes"
          value={visits.filter((v) => v.accessCodeUsed).length}
        />

        <StatCard
          icon={<Clock size={19} />}
          title="Pending"
          value={
            visits.filter(
              (v) =>
                v.status?.toLowerCase() !== "completed" &&
                v.status?.toLowerCase() !== "cancelled" &&
                v.status?.toLowerCase() !== "canceled"
            ).length
          }
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, access code, user or provider..."
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
            onChange={(e) => setStatus(e.target.value)}
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
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="active">Active</option>
            <option value="in-progress">In Progress</option>
            <option value="cancelled">Cancelled</option>
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
              {visits.length}
            </strong>{" "}
            of{" "}
            <strong style={{ color: "#14344A" }}>
              {totalRecords}
            </strong>
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
        ) : visits.length === 0 ? (
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
              No access code visits found
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
                    <TableHeader>Visit ID</TableHeader>
                    <TableHeader>Access Code</TableHeader>
                    <TableHeader>Visit Date</TableHeader>
                    <TableHeader>Time</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Code Status</TableHeader>
                    <TableHeader>Created</TableHeader>
                    <TableHeader align="center">
                      Action
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {visits.map((visit) => {
                    const statusStyle = getStatusStyle(
                      visit.status
                    );

                    const codeStatus =
                      getAccessCodeStatus(visit);

                    return (
                      <tr
                        key={visit._id}
                        style={{
                          borderBottom:
                            "1px solid #EEF1F4",
                        }}
                      >
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
                                background:
                                  "#EEF5F9",
                                display: "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                            >
                              <ShieldCheck
                                size={16}
                                color="#14344A"
                              />
                            </div>

                            <div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  color: "#1F2937",
                                  fontSize: 12,
                                }}
                              >
                                {visit._id}
                              </div>

                              <div
                                style={{
                                  color: "#9CA3AF",
                                  fontSize: 11,
                                  marginTop: 2,
                                }}
                              >
                                Visit #
                                {visit.visitIndex ?? 0}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {visit.accessCode ? (
                            <div
                              style={{
                                display:
                                  "inline-flex",
                                alignItems:
                                  "center",
                                gap: 7,
                                padding: "6px 10px",
                                borderRadius: 8,
                                background:
                                  "#F3F7FA",
                                color: "#14344A",
                                fontWeight: 700,
                                letterSpacing:
                                  "1.5px",
                                fontSize: 13,
                              }}
                            >
                              <KeyRound size={14} />
                              {visit.accessCode}
                            </div>
                          ) : (
                            <span
                              style={{
                                color: "#9CA3AF",
                              }}
                            >
                              -
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              gap: 7,
                              color: "#374151",
                              fontSize: 13,
                            }}
                          >
                            <CalendarDays
                              size={15}
                              color="#7B8794"
                            />
                            {formatDate(
                              visit.scheduledDate
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              gap: 7,
                              color: "#4B5563",
                              fontSize: 12,
                            }}
                          >
                            <Clock
                              size={14}
                              color="#7B8794"
                            />

                            {visit.fromTime || "-"}{" "}
                            -{" "}
                            {visit.toTime || "-"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: 5,
                              padding: "5px 9px",
                              borderRadius: 20,
                              background:
                                statusStyle.bg,
                              color:
                                statusStyle.color,
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform:
                                "capitalize",
                            }}
                          >
                            {statusStyle.icon}
                            {visit.status ||
                              "Unknown"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span
                            style={{
                              padding: "5px 9px",
                              borderRadius: 20,
                              background:
                                codeStatus.bg,
                              color:
                                codeStatus.color,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {codeStatus.text}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span
                            style={{
                              color: "#6B7280",
                              fontSize: 12,
                            }}
                          >
                            {formatDateTime(
                              visit.createdAt
                            )}
                          </span>
                        </TableCell>

                        <TableCell align="center">
                          <button
                            onClick={() =>
                              navigate(
                                `/access-codes/${visit._id}`
                              )
                            }
                            style={{
                              height: 34,
                              padding: "0 12px",
                              borderRadius: 8,
                              border:
                                "1px solid #D8E1E8",
                              background: "#fff",
                              color: "#14344A",
                              fontSize: 12,
                              fontWeight: 600,
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
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

{totalPages > 1 && (
  <div className="access-pagination-wrapper">
    
    {/* Total records */}
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

    {/* Pagination */}
    <div className="access-pagination">
      
      {/* Previous */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className={`access-pagination-btn ${
          currentPage === 1
            ? "access-pagination-btn-disabled"
            : "access-pagination-btn-normal"
        }`}
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page numbers */}
      {Array.from({ length: totalPages }, (_, index) => {
        const pageNumber = index + 1;

        return (
          <button
            key={pageNumber}
            type="button"
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

      {/* Next */}
      <button
        type="button"
        disabled={currentPage === totalPages}
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
        boxShadow:
          "0 5px 18px rgba(20,52,74,0.045)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background:
            "linear-gradient(135deg, #14344A, #163A5F)",
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

