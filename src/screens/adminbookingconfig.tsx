
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
  Eye,
  Ban,
  Radio,
  ClipboardList,
} from "lucide-react";

import {
  getAdminBookings,
  getAdminServiceResponses,
  getAdminScheduledServices,
  getAdminPastServices,
  getAdminBroadcasts,

  type Booking,
  type BroadcastRecord,
  type ServiceResponse,
  type ScheduledService,
  type PastService,
  type ServiceResponseParams,
  type PastServicesParams,
} from "../service/adminbookingservice";

import "./bookinghistory.css";

type Tab =
  | "bookings"
  | "responses"
  | "scheduled"
  | "past"
  | "broadcasts";

const BookingHistoryScreen: React.FC = () => {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [activeTab, setActiveTab] = useState<Tab>("bookings");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [responses, setResponses] = useState<ServiceResponse[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledService[]>([]);
  const [pastServices, setPastServices] = useState<PastService[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [responseStatus, setResponseStatus] =
    useState<ServiceResponseParams["status"]>(undefined);

  const [pastStatus, setPastStatus] =
    useState<PastServicesParams["status"]>(undefined);

  const [scheduledPeriod, setScheduledPeriod] = useState<
    "today" | "tomorrow" | "week" | ""
  >("");

  const [page, setPage] = useState(1);
  const limit = 20;

  const [refreshKey, setRefreshKey] = useState(0);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // =====================================================
  // HELPERS
  // =====================================================

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

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string | null) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleString("en-US", {
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

  const getTimeLabel = (time?: any) => {
    if (!time) return "—";

    if (typeof time === "string") return time;

    const start = time.start || time.fromTime || "";
    const end = time.end || time.toTime || "";

    if (start && end) return `${start} - ${end}`;

    return start || end || "—";
  };

  const getBookingId = (booking: Booking) => {
    return booking.bookingId || booking._id;
  };

  const openBooking = (id?: string) => {
    if (!id) return;

    navigate(
      `/booking-history/${encodeURIComponent(id)}`
    );
  };

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "completed":
        return "booking-status--completed";

      case "cancelled":
        return "booking-status--cancelled";

      case "no-show":
        return "booking-status--noshow";

      case "confirmed":
        return "booking-status--confirmed";

      case "in-progress":
        return "booking-status--scheduled";

      default:
        return "booking-status--scheduled";
    }
  };

  const updatePagination = (result: any) => {
    setPagination(
      result.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      }
    );
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const commonSearch = search.trim() || undefined;

        if (activeTab === "bookings") {
          const result = await getAdminBookings({
            page,
            limit,
            search: commonSearch,
          });

          if (!isMounted) return;

          setBookings(result.data || []);
          updatePagination(result);
        }

        if (activeTab === "responses") {
          const result = await getAdminServiceResponses({
            page,
            limit,
            search: commonSearch,
            status: responseStatus,
          });

          if (!isMounted) return;

          setResponses(result.data || []);
          updatePagination(result);
        }

        if (activeTab === "scheduled") {
          const result = await getAdminScheduledServices({
            page,
            limit,
            search: commonSearch,
            period: scheduledPeriod || undefined,
          });

          if (!isMounted) return;

          setScheduled(result.data || []);
          updatePagination(result);

          console.log("Scheduled API response:", result);
        }

        if (activeTab === "past") {
          const result = await getAdminPastServices({
            page,
            limit,
            search: commonSearch,
            status: pastStatus,
          });

          if (!isMounted) return;

          setPastServices(result.data || []);
          updatePagination(result);
        }

        if (activeTab === "broadcasts") {
          const result = await getAdminBroadcasts({
            page,
            limit,
            search: commonSearch,
          });

          if (!isMounted) return;

          setBroadcasts(result.data || []);
          updatePagination(result);
        }
      } catch (err) {
        console.error("Failed to load booking data:", err);

        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load data"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Debounce search requests.
    const timer = setTimeout(() => {
      loadData();
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    activeTab,
    page,
    limit,
    search,
    responseStatus,
    pastStatus,
    scheduledPeriod,
    refreshKey,
  ]);

  // =====================================================
  // TAB CHANGE
  // =====================================================

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");

    setResponseStatus(undefined);
    setPastStatus(undefined);
    setScheduledPeriod("");
  };

  const handleRefresh = () => {
    setRefreshKey((current) => current + 1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // =====================================================
  // RESPONSE BADGE
  // =====================================================

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
            Caregiver Rejected
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
            Caregiver Cancelled
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

  // =====================================================
  // ALL BOOKINGS TABLE
  // =====================================================

  const renderBookings = () => (
    <div className="booking-table-card">
      <div className="booking-table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Requestor</th>
              <th>Care giver</th>
              <th>Service</th>
              <th>Scheduled Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((item) => (
              <tr key={getBookingId(item)}>
                <td>
                  <div className="booking-person">
                    <div className="booking-avatar">
                      <UserRound size={17} />
                    </div>

                    <div className="booking-person-info">
                      <p className="booking-person-name">
                        {getName(item.requestor || item.user)}
                      </p>

                      <p className="booking-person-email">
                        {(item.requestor || item.user)?.email || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="booking-table-text">
                    {getName(item.provider)}
                  </span>
                </td>

                <td>
                  <div className="booking-service">
                    <BriefcaseBusiness size={16} />
                    <span>{item.service?.name || "—"}</span>
                  </div>
                </td>

                <td>
                  {formatDate(item.scheduledDate)}
                </td>

                <td>
                  {getTimeLabel(item.scheduledTime)}
                </td>

                <td>
                  <span
                    className={`booking-status ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {formatStatus(item.status)}
                  </span>
                </td>

                <td>
                  {formatDate(item.createdAt)}
                </td>

                <td>
                  <button
                    type="button"
                    className="booking-view-btn"
                    title="View Booking Details"
                    onClick={() => openBooking(getBookingId(item))}
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="booking-empty">
                    No bookings found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // =====================================================
  // SERVICE RESPONSES TABLE
  // =====================================================

  const renderResponses = () => (
    <div className="booking-table-card">
      <div className="booking-table-wrapper">
        <table className="booking-table booking-table--responses">
          <thead>
            <tr>
              <th>Requestor</th>
              <th>Care giver</th>
              <th>Service</th>
              <th>Scheduled</th>
              <th>Response</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {responses.map((item, index) => (
              <tr key={`${item.id}-${index}`}>
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
                      {getTimeLabel(item.scheduledTime)}
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

                <td>
                  <button
                    type="button"
                    className="booking-view-btn"
                    title="View Details"
                    onClick={() => openBooking(item.id)}
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {!loading && responses.length === 0 && (
              <tr>
                <td colSpan={7}>
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

  // =====================================================
  // SCHEDULED SERVICES TABLE
  // =====================================================

  const renderScheduled = () => (
    <div className="booking-table-card">
      <div className="booking-table-wrapper">
        <table className="booking-table booking-table--scheduled">
          <thead>
            <tr>
              <th>Care giver</th>
              <th>Requestor</th>
              <th>Service</th>
              <th>Next Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Type</th>
              <th>Visits</th>
              <th>Action</th>
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
                    {formatDate(
                      item.nextScheduledDate || item.scheduledDate
                    )}
                  </span>
                </td>

                <td>
                  <span className="booking-table-text">
                    {getTimeLabel(item.scheduledTime)}
                  </span>
                </td>

                <td>
                  <span
                    className={`booking-status ${getStatusClass(
                      item.status
                    )}`}
                  >
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

                <td>
                  <span className="booking-table-text">
                    {item.visits?.length || 0}
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    className="booking-view-btn"
                    title="View Booking Details"
                    onClick={() => openBooking(item.bookingId)}
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {!loading && scheduled.length === 0 && (
              <tr>
                <td colSpan={9}>
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

  // =====================================================
  // PAST SERVICES TABLE
  // =====================================================

  const renderPast = () => (
    <div className="booking-table-card">
      <div className="booking-table-wrapper">
        <table className="booking-table booking-table--past">
          <thead>
            <tr>
              <th>Requestor</th>
              <th>Care giver</th>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
              <th>Completed</th>
              <th>Cancelled</th>
              <th>Reason</th>
              <th>Action</th>
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
                    className={`booking-status ${getStatusClass(
                      item.status
                    )}`}
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
                  <span className="booking-table-text">
                    {formatDateTime(
                      item.cancellation?.cancelledAt
                    )}
                  </span>
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

                <td>
                  <button
                    type="button"
                    className="booking-view-btn"
                    title="View Booking Details"
                    onClick={() => openBooking(item.bookingId)}
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {!loading && pastServices.length === 0 && (
              <tr>
                <td colSpan={9}>
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

  // =====================================================
  // BROADCAST HISTORY TABLE
  // =====================================================

  const renderBroadcasts = () => (
    <div className="booking-table-card">
      <div className="booking-table-wrapper">
        <table className="booking-table">
          <thead>
            <tr>
              <th>Requestor</th>
              <th>Service</th>
              <th>Scheduled Date</th>
              <th>Broadcast Status</th>
              <th>Care giver Declines</th>
              <th>Created At</th>
              <th>Broadcast ID</th>
            </tr>
          </thead>

          <tbody>
            {broadcasts.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="booking-person">
                    <div className="booking-avatar">
                      <UserRound size={17} />
                    </div>

                    <div className="booking-person-info">
                      <p className="booking-person-name">
                        {getName(item.user)}
                      </p>

                      <p className="booking-person-email">
                        {item.user?.email || "—"}
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
                      {getTimeLabel(item.scheduledTime)}
                    </span>
                  </div>
                </td>

                <td>
                  <span
                    className={`booking-status ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {formatStatus(item.status)}
                  </span>
                </td>

                <td>
                  <span className="booking-table-text">
                    {item.providerDeclines?.length || 0}
                  </span>
                </td>

                <td>
                  {formatDateTime(item.createdAt)}
                </td>

                <td>
                  <span className="booking-table-text">
                    {item._id}
                  </span>
                </td>
              </tr>
            ))}

            {!loading && broadcasts.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="booking-empty">
                    No broadcast records found.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="booking-page">
      <div className="booking-container">

        {/* HEADER */}

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
                Manage bookings, caregiver responses, scheduled
                services, past services and broadcast history.
              </p>
            </div>

            <div className="booking-header-actions">
              <button
                type="button"
                onClick={handleRefresh}
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

        {/* TABS */}

        <div className="booking-tabs-card">
          <div className="booking-tabs">

            <button
              onClick={() => changeTab("bookings")}
              className={`booking-tab ${
                activeTab === "bookings"
                  ? "booking-tab--active"
                  : ""
              }`}
            >
              <ClipboardList size={17} />
              All Bookings
            </button>

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

            <button
              onClick={() => changeTab("broadcasts")}
              className={`booking-tab ${
                activeTab === "broadcasts"
                  ? "booking-tab--active"
                  : ""
              }`}
            >
              <Radio size={17} />
              Broadcast History
            </button>

          </div>
        </div>

        {/* SEARCH AND FILTERS */}

        <div className="booking-filter-card">

          <div className="booking-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={
                activeTab === "broadcasts"
                  ? "Search broadcast records..."
                  : "Search requestor, caregiver or service..."
              }
            />
          </div>

          {activeTab === "responses" && (
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
              <option value="rejected">Caregiver Rejected</option>
              <option value="cancelled_by_requestor">
                User Cancelled
              </option>
              <option value="cancelled_by_provider">
                Care giver Cancelled
              </option>
            </select>
          )}

          {activeTab === "scheduled" && (
            <select
              value={scheduledPeriod}
              onChange={(e) => {
                setScheduledPeriod(
                  e.target.value as
                    | "today"
                    | "tomorrow"
                    | "week"
                    | ""
                );

                setPage(1);
              }}
              className="booking-select"
            >
              <option value="">All Upcoming</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
            </select>
          )}

          {activeTab === "past" && (
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
          )}

        </div>

        {/* ERROR */}

        {error && (
          <div className="booking-empty">
            {error}
          </div>
        )}

        {/* CONTENT */}

        {loading ? (
          <div className="booking-loading-card">
            <RefreshCw size={22} className="booking-spin" />
            <span>Loading booking data...</span>
          </div>
        ) : (
          <div className="booking-content">
            {activeTab === "bookings" && renderBookings()}
            {activeTab === "responses" && renderResponses()}
            {activeTab === "scheduled" && renderScheduled()}
            {activeTab === "past" && renderPast()}
            {activeTab === "broadcasts" && renderBroadcasts()}
          </div>
        )}

        {/* PAGINATION */}

        <div className="booking-pagination">
          <div className="booking-pagination-info">
            <span>Total</span>
            <strong>{pagination.total}</strong>
          </div>

          <div className="booking-pagination-controls">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((current) => Math.max(current - 1, 1))
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
              type="button"
              disabled={
                page >= pagination.totalPages || loading
              }
              onClick={() => setPage((current) => current + 1)}
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
