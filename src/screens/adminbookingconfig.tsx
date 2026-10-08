
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock3,
  UserRound,
  BriefcaseBusiness,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Ban,
  ArrowLeft,
} from "lucide-react";

import {
  getAdminServiceResponses,
  getAdminScheduledServices,
  getAdminPastServices,
  type ServiceResponse,
  type ScheduledService,
  type PastService,
  type ServiceResponseParams,
  type PastServicesParams,
} from "../service/adminbookingservice";

import "./bookinghistory.css";

type Tab = "responses" | "scheduled" | "past";

const BookingHistoryScreen: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("responses");

  const [responses, setResponses] = useState<ServiceResponse[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledService[]>([]);
  const [pastServices, setPastServices] = useState<PastService[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [responseStatus, setResponseStatus] =
    useState<ServiceResponseParams["status"]>(undefined);

  const [pastStatus, setPastStatus] =
    useState<PastServicesParams["status"]>(undefined);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const getName = (
    person?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    } | null
  ) => {
    if (!person) return "—";

    const name = `${person.firstName || ""} ${
      person.lastName || ""
    }`.trim();

    return name || person.email || "—";
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatStatus = (status?: string) => {
    if (!status) return "—";

    return status
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === "responses") {
        const result = await getAdminServiceResponses({
          page,
          limit,
          search: search.trim() || undefined,
          status: responseStatus,
        });

        setResponses(result.data || []);

        setPagination(
          result.pagination || {
            page,
            limit,
            total: 0,
            totalPages: 1,
          }
        );
      }

      if (activeTab === "scheduled") {
        const result = await getAdminScheduledServices({
          page,
          limit,
        });

        setScheduled(result.data || []);

        setPagination(
          result.pagination || {
            page,
            limit,
            total: 0,
            totalPages: 1,
          }
        );
      }

      if (activeTab === "past") {
        const result = await getAdminPastServices({
          page,
          limit,
          status: pastStatus,
        });

        setPastServices(result.data || []);

        setPagination(
          result.pagination || {
            page,
            limit,
            total: 0,
            totalPages: 1,
          }
        );
      }
    } catch (error) {
      console.error("Failed to load admin booking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, page, responseStatus, pastStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "responses") {
        setPage(1);
        loadData();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setResponseStatus(undefined);
    setPastStatus(undefined);
  };

  const getResponseBadge = (type: string) => {
    switch (type) {
      case "accepted":
        return (
          <span className="booking-badge booking-badge--accepted">
            <CheckCircle2 size={14} />
            Accepted
          </span>
        );

      case "rejected":
        return (
          <span className="booking-badge booking-badge--rejected">
            <XCircle size={14} />
            Provider Rejected
          </span>
        );

      case "cancelled_by_requestor":
        return (
          <span className="booking-badge booking-badge--requestor-cancelled">
            <Ban size={14} />
            User Cancelled
          </span>
        );

      case "cancelled_by_provider":
        return (
          <span className="booking-badge booking-badge--provider-cancelled">
            <Ban size={14} />
            Provider Cancelled
          </span>
        );

      default:
        return (
          <span className="booking-badge booking-badge--default">
            {formatStatus(type)}
          </span>
        );
    }
  };

  const renderResponses = () => (
    <div className="booking-table-card">
      <div className="booking-table-wrapper">
        <table className="booking-table booking-table--responses">
          <thead>
            <tr>
              <th>Requestor</th>
              <th>Caregiver</th>
              <th>Service</th>
              <th>Scheduled</th>
              <th>Response</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {responses.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="booking-person">
                    <div className="booking-avatar">
                      <UserRound size={17} />
                    </div>

                    <div className="booking-person-info">
                      <p className="booking-person-name">
                        {getName(item.requestor)}
                      </p>

                      <p className="booking-person-email">
                        {item.requestor?.email || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="booking-person">
                    <div className="booking-avatar">
                      <UserRound size={17} />
                    </div>

                    <div className="booking-person-info">
                      <p className="booking-person-name">
                        {getName(item.provider)}
                      </p>

                      <p className="booking-person-email">
                        {item.provider?.email || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="booking-service">
                    <BriefcaseBusiness size={16} />

                    <span>{item.service?.name || "—"}</span>
                  </div>
                </td>

                <td>
                  <div className="booking-date-block">
                    <p>{formatDate(item.scheduledDate)}</p>

                    <span>
                      {item.scheduledTime?.start || "—"}{" "}
                      {item.scheduledTime?.end
                        ? `- ${item.scheduledTime.end}`
                        : ""}
                    </span>
                  </div>
                </td>

                <td>
                  <div className="booking-response">
                    {getResponseBadge(item.type)}

                    <span>
                      {formatDateTime(item.responseAt)}
                    </span>
                  </div>
                </td>

                <td>
                  <span className="booking-reason">
                    {item.cancellation?.reason || "—"}
                  </span>
                </td>
              </tr>
            ))}

            {!loading && responses.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="booking-empty">
                    No service responses found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderScheduled = () => (
    <div className="booking-table-card">
      <div className="booking-table-wrapper">
        <table className="booking-table booking-table--scheduled">
          <thead>
            <tr>
              <th>Caregiver</th>
              <th>Requestor</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Type</th>
            </tr>
          </thead>

          <tbody>
            {scheduled.map((item) => (
              <tr key={item.bookingId}>
                <td>
                  <div className="booking-person">
                    <div className="booking-avatar">
                      <UserRound size={17} />
                    </div>

                    <span className="booking-person-name">
                      {getName(item.provider)}
                    </span>
                  </div>
                </td>

                <td>
                  <span className="booking-table-text">
                    {getName(item.requestor)}
                  </span>
                </td>

                <td>
                  <span className="booking-service-name">
                    {item.service?.name || "—"}
                  </span>
                </td>

                <td>
                  <span className="booking-table-text">
                    {formatDate(item.scheduledDate)}
                  </span>
                </td>

                <td>
                  <span className="booking-table-text">
                    {item.scheduledTime?.start || "—"}{" "}
                    {item.scheduledTime?.end
                      ? `- ${item.scheduledTime.end}`
                      : ""}
                  </span>
                </td>

                <td>
                  <span className="booking-status booking-status--scheduled">
                    {formatStatus(item.status)}
                  </span>
                </td>

                <td>
                  {item.isMultiDay ? (
                    <span className="booking-status booking-status--multiday">
                      Multi-Day
                    </span>
                  ) : (
                    <span className="booking-status booking-status--onetime">
                      One-Time
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {!loading && scheduled.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="booking-empty">
                    No scheduled services found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPast = () => (
    <div className="booking-table-card">
      <div className="booking-table-wrapper">
        <table className="booking-table booking-table--past">
          <thead>
            <tr>
              <th>Requestor</th>
              <th>Caregiver</th>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
              <th>Completed</th>
              <th>Cancelled By</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {pastServices.map((item) => (
              <tr key={item.bookingId}>
                <td>
                  <div className="booking-person">
                    <div className="booking-avatar">
                      <UserRound size={17} />
                    </div>

                    <span className="booking-person-name">
                      {getName(item.requestor)}
                    </span>
                  </div>
                </td>

                <td>
                  <span className="booking-table-text">
                    {getName(item.provider)}
                  </span>
                </td>

                <td>
                  <span className="booking-service-name">
                    {item.service?.name || "—"}
                  </span>
                </td>

                <td>
                  <span className="booking-table-text">
                    {formatDate(item.scheduledDate)}
                  </span>
                </td>

                <td>
                  <span
                    className={`booking-status ${
                      item.status === "completed"
                        ? "booking-status--completed"
                        : item.status === "cancelled"
                        ? "booking-status--cancelled"
                        : "booking-status--noshow"
                    }`}
                  >
                    {formatStatus(item.status)}
                  </span>
                </td>

                <td>
                  <span className="booking-table-text">
                    {formatDateTime(item.completedAt)}
                  </span>
                </td>

                <td>
                  {item.cancellation?.cancelledBy ? (
                    <span
                      className={`booking-status ${
                        typeof item.cancellation.cancelledBy ===
                        "object"
                          ? getName(
                              item.cancellation.cancelledBy
                            ) === getName(item.requestor)
                            ? "booking-status--cancelled"
                            : "booking-status--provider-cancelled"
                          : item.cancellation.cancelledBy ===
                            "user"
                          ? "booking-status--cancelled"
                          : "booking-status--provider-cancelled"
                      }`}
                    >
                      {typeof item.cancellation.cancelledBy ===
                      "object"
                        ? getName(item.cancellation.cancelledBy)
                        : item.cancellation.cancelledBy ===
                          "user"
                        ? "Requestor"
                        : item.cancellation.cancelledBy ===
                          "provider"
                        ? "Caregiver"
                        : formatStatus(
                            item.cancellation.cancelledBy
                          )}
                    </span>
                  ) : (
                    <span className="booking-muted">—</span>
                  )}
                </td>

                <td>
                  {item.cancellation ? (
                    <div className="booking-cancellation">
                      <p>
                        {item.cancellation.reason || "Cancelled"}
                      </p>

                      <span>
                        {formatDateTime(
                          item.cancellation.cancelledAt
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="booking-muted">—</span>
                  )}
                </td>
              </tr>
            ))}

            {!loading && pastServices.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="booking-empty">
                    No past services found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="booking-page">
      <div className="booking-container">
        {/* Header */}
        <div className="booking-header">
          <div className="booking-header-content">
            <div>
              <div className="booking-title-row">
                <div className="booking-title-icon">
                  <CalendarDays size={21} />
                </div>

                <h1 className="booking-title">
                  Booking Management
                </h1>
              </div>

              <p className="booking-subtitle">
                Manage caregiver responses, scheduled services and
                requestor booking history.
              </p>
            </div>

            <div className="booking-header-actions">
              <button
                onClick={() => navigate("/admin-config")}
                className="booking-back-btn"
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                onClick={loadData}
                disabled={loading}
                className="booking-refresh-btn"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "booking-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="booking-tabs-card">
          <div className="booking-tabs">
            <button
              onClick={() => changeTab("responses")}
              className={`booking-tab ${
                activeTab === "responses"
                  ? "booking-tab--active"
                  : ""
              }`}
            >
              <CheckCircle2 size={17} />
              Service Responses
            </button>

            <button
              onClick={() => changeTab("scheduled")}
              className={`booking-tab ${
                activeTab === "scheduled"
                  ? "booking-tab--active"
                  : ""
              }`}
            >
              <CalendarDays size={17} />
              Scheduled Services
            </button>

            <button
              onClick={() => changeTab("past")}
              className={`booking-tab ${
                activeTab === "past"
                  ? "booking-tab--active"
                  : ""
              }`}
            >
              <Clock3 size={17} />
              Past Services
            </button>
          </div>
        </div>

        {/* Response Filters */}
        {activeTab === "responses" && (
          <div className="booking-filter-card">
            <div className="booking-search">
              <Search size={18} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requestor, caregiver or service..."
              />
            </div>

            <select
              value={responseStatus || ""}
              onChange={(e) => {
                setResponseStatus(
                  e.target.value
                    ? (e.target.value as ServiceResponseParams["status"])
                    : undefined
                );
                setPage(1);
              }}
              className="booking-select"
            >
              <option value="">All Responses</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">
                Provider Rejected
              </option>
              <option value="cancelled_by_requestor">
                User Cancelled
              </option>
              <option value="cancelled_by_provider">
                Provider Cancelled
              </option>
            </select>
          </div>
        )}

        {/* Past Filters */}
        {activeTab === "past" && (
          <div className="booking-filter-card booking-filter-card--past">
            <select
              value={pastStatus || ""}
              onChange={(e) => {
                setPastStatus(
                  e.target.value
                    ? (e.target.value as PastServicesParams["status"])
                    : undefined
                );
                setPage(1);
              }}
              className="booking-select"
            >
              <option value="">All Past Services</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="booking-loading-card">
            <RefreshCw size={22} className="booking-spin" />
            <span>Loading booking data...</span>
          </div>
        ) : (
          <div className="booking-content">
            {activeTab === "responses" && renderResponses()}
            {activeTab === "scheduled" && renderScheduled()}
            {activeTab === "past" && renderPast()}
          </div>
        )}

        {/* Pagination */}
        <div className="booking-pagination">
          <div className="booking-pagination-info">
            <span>Total</span>
            <strong>{pagination.total}</strong>
          </div>

          <div className="booking-pagination-controls">
            <button
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((current) =>
                  Math.max(current - 1, 1)
                )
              }
              className="booking-pagination-btn"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="booking-page-number">
              <span>{pagination.page}</span>
              <small>/</small>
              <span>{pagination.totalPages || 1}</span>
            </div>

            <button
              disabled={
                page >= pagination.totalPages || loading
              }
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="booking-pagination-btn"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistoryScreen;