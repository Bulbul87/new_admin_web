
import React, { useEffect, useMemo, useState } from "react";
import {
  getAllSupportTickets,
  getSupportTicketById,
  replyToSupportTicket,
  type SupportTicket as SupportTicketType,
} from "../service/supportTickets";
import "./support.css";
import { Ticket } from "lucide-react";
import { MdOutlineAirplaneTicket, MdOutlineCheckCircle, MdOutlinePendingActions } from "react-icons/md";

const SupportTicket: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketType[]>([]);
  const [selectedTicket, setSelectedTicket] =
    useState<SupportTicketType | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  const [replyMessage, setReplyMessage] = useState("");
  const [error, setError] = useState("");

  // ==============================
  // LOAD ALL TICKETS
  // ==============================

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllSupportTickets();

      // Support API can return tickets in different response shapes.
      // Normalize everything to a plain ticket array before rendering.
      let ticketList: SupportTicketType[] = [];

      if (Array.isArray(data)) {
        ticketList = data;
      } else if (Array.isArray((data as any)?.tickets)) {
        ticketList = (data as any).tickets;
      } else if (Array.isArray((data as any)?.data)) {
        ticketList = (data as any).data;
      } else if (Array.isArray((data as any)?.data?.tickets)) {
        ticketList = (data as any).data.tickets;
      }

      console.log("🎫 Support tickets received:", data);
      console.log("🎫 Normalized ticket list:", ticketList);

      setTickets(ticketList);
    } catch (err: any) {
      console.error("Failed to load support tickets:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load support tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // ==============================
  // OPEN TICKET DETAILS
  // ==============================

  const handleTicketClick = async (ticket: SupportTicketType) => {
    try {
      setDetailLoading(true);
      setError("");

      setSelectedTicket(ticket);

      const id = ticket._id || ticket.ticketId;

      if (!id) {
        setError("Ticket ID is missing.");
        return;
      }

      const data = await getSupportTicketById(String(id));

      setSelectedTicket(data);
    } catch (err: any) {
      console.error("Failed to load ticket:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load ticket details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // ==============================
  // SEND REPLY
  // ==============================

  const handleSendReply = async () => {
    if (!selectedTicket?._id) return;

    const message = replyMessage.trim();

    if (!message) return;

    try {
      setReplyLoading(true);
      setError("");

      await replyToSupportTicket(
        selectedTicket._id,
        message
      );

      setReplyMessage("");

      // Refresh ticket detail after reply
      const updatedTicket = await getSupportTicketById(
        selectedTicket._id
      );

      setSelectedTicket(updatedTicket);

      // Refresh ticket list
      await loadTickets();
    } catch (err: any) {
      console.error("Failed to send reply:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send reply."
      );
    } finally {
      setReplyLoading(false);
    }
  };

  // ==============================
  // HELPERS
  // ==============================

  const getUserName = (ticket: any) => {
    const user = ticket?.user || ticket?.requester;

    if (!user) return "Unknown User";

    const fullName = [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return fullName || user.name || user.email || "Unknown User";
  };

  const getUserEmail = (ticket: any) => {
    return (
      ticket?.user?.email ||
      ticket?.requester?.email ||
      ticket?.email ||
      "No email"
    );
  };

  const getSubject = (ticket: any) => {
    return (
      ticket?.subject ||
      ticket?.title ||
      ticket?.issue ||
      "Support Request"
    );
  };

  const getDescription = (ticket: any) => {
    return (
      ticket?.description ||
      ticket?.message ||
      ticket?.initialMessage ||
      ""
    );
  };

  const getStatus = (ticket: any) => {
    return String(ticket?.status || "open").toLowerCase();
  };

  const getPriority = (ticket: any) => {
    return String(ticket?.priority || "medium").toLowerCase();
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (ticket: any) => {
    const name = getUserName(ticket);

    const words = name
      .split(" ")
      .filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  // ==============================
  // FILTER TICKETS
  // ==============================

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        getSubject(ticket)
          .toLowerCase()
          .includes(searchText) ||
        getUserName(ticket)
          .toLowerCase()
          .includes(searchText) ||
        getUserEmail(ticket)
          .toLowerCase()
          .includes(searchText) ||
        String(ticket?._id || "")
          .toLowerCase()
          .includes(searchText) ||
        String(ticket?.ticketId || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        getStatus(ticket) === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        getPriority(ticket) === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tickets,
    search,
    statusFilter,
    priorityFilter,
  ]);

  // ==============================
  // STATS
  // ==============================

  const stats = useMemo(() => {
    const total = tickets.length;

    const open = tickets.filter(
      (ticket) => getStatus(ticket) === "open"
    ).length;

    const pending = tickets.filter(
      (ticket) => getStatus(ticket) === "pending"
    ).length;

    const resolved = tickets.filter(
      (ticket) =>
        getStatus(ticket) === "resolved" ||
        getStatus(ticket) === "closed"
    ).length;

    return {
      total,
      open,
      pending,
      resolved,
    };
  }, [tickets]);

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="support-page">
      {/* HEADER */}

      <div className="support-header">
        <div>
          <h1>Support Tickets</h1>

          <p>
            Manage customer support requests and
            conversations
          </p>
        </div>

        <button
          className="support-refresh-btn"
          onClick={loadTickets}
           style={{
       border: "none",
              background:
                "linear-gradient(to right, #FFFF6D, #8FDAFA)",
              color: "#14344A",
              fontWeight: 700,
              padding: "14px 24px",
              borderRadius: 14,
              boxShadow:
                "0 6px 20px rgba(0,0,0,0.08)",
              transition: "0.3s",
              cursor: "pointer",
             
    }}
          disabled={loading}
        >
          <span className={loading ? "spin" : ""}>
            ↻
          </span>
          Refresh
        </button>
      </div>

      {/* STATS */}

      <div className="support-stats">
        <div className="support-stat-card">
          <div className="stat-icon total-icon">
            <span><Ticket size={20}     color="#14344A"/></span>
          </div>

          <div>
            <span>Total Tickets</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="support-stat-card">
          <div className="stat-icon open-icon">
            <span><MdOutlineAirplaneTicket size={20} color="#14344A"/></span>
          </div>

          <div>
            <span>Open</span>
            <strong>{stats.open}</strong>
          </div>
        </div>

        <div className="support-stat-card">
          <div className="stat-icon pending-icon">
            <span><MdOutlinePendingActions size={20} color="#14344A"/></span>
          </div>

          <div>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
        </div>

        <div className="support-stat-card">
          <div className="stat-icon resolved-icon">
            <span><MdOutlineCheckCircle size={20} color="#14344A"/></span>
          </div>

          <div>
            <span>Resolved</span>
            <strong>{stats.resolved}</strong>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="support-error">
          <span>!</span>
          {error}

          <button onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}

      <div className="support-layout">
        {/* LEFT - TICKET LIST */}

        <div className="ticket-list-card">
          <div className="ticket-list-header">
            <div>
              <h2>All Tickets</h2>
              <span>
                {filteredTickets.length} tickets
              </span>
            </div>
          </div>

          {/* FILTERS */}

          <div className="ticket-filters">
            <div className="ticket-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="all">
                All Status
              </option>
              <option value="open">Open</option>
              <option value="pending">
                Pending
              </option>
              <option value="in_progress">
                In Progress
              </option>
              <option value="resolved">
                Resolved
              </option>
              <option value="closed">
                Closed
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
            >
              <option value="all">
                All Priority
              </option>
              <option value="urgent">
                Urgent
              </option>
              <option value="high">High</option>
              <option value="medium">
                Medium
              </option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* TICKETS */}

          <div className="tickets-container">
            {loading ? (
              <div className="ticket-loading">
                <div className="loader"></div>
                <p>Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="ticket-empty">
                <div className="empty-icon">
                  ♧
                </div>

                <h3>No tickets found</h3>

                <p>
                  There are no support tickets matching
                  your current filters.
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isSelected =
                  selectedTicket?._id ===
                  ticket._id;

                return (
                  <div
                    key={ticket._id}
                    className={`ticket-item ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleTicketClick(ticket)
                    }
                  >
                    <div className="ticket-avatar">
                      {getInitials(ticket)}
                    </div>

                    <div className="ticket-main">
                      <div className="ticket-top-row">
                        <h3>
                          {getSubject(ticket)}
                        </h3>

                        <span
                          className={`priority-badge priority-${getPriority(
                            ticket
                          )}`}
                        >
                          {getPriority(ticket)}
                        </span>
                      </div>

                      <div className="ticket-user">
                        {getUserName(ticket)}
                        <span>•</span>
                        {getUserEmail(ticket)}
                      </div>

                      <div className="ticket-bottom-row">
                        <span
                          className={`status-badge status-${getStatus(
                            ticket
                          )}`}
                        >
                          {getStatus(ticket).replace(
                            "_",
                            " "
                          )}
                        </span>

                        <span className="ticket-date">
                          {formatDate(
                            ticket.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT - DETAIL */}

        <div className="ticket-detail-card">
          {!selectedTicket ? (
            <div className="no-ticket-selected">
              <div className="detail-empty-icon">
                💬
              </div>

              <h2>Select a ticket</h2>

              <p>
                Select a support ticket from the list
                to view its details and conversation.
              </p>
            </div>
          ) : detailLoading ? (
            <div className="ticket-loading">
              <div className="loader"></div>
              <p>Loading ticket details...</p>
            </div>
          ) : (
            <>
              {/* DETAIL HEADER */}

              <div className="detail-header">
                <div className="detail-title">
                  <div className="detail-avatar">
                    {getInitials(
                      selectedTicket
                    )}
                  </div>

                  <div>
                    <h2>
                      {getSubject(
                        selectedTicket
                      )}
                    </h2>

                    <p>
                      Ticket #
                      {selectedTicket.ticketId ||
                        selectedTicket._id}
                    </p>
                  </div>
                </div>

                <div className="detail-actions">
                  <span
                    className={`status-badge status-${getStatus(
                      selectedTicket
                    )}`}
                  >
                    {getStatus(
                      selectedTicket
                    ).replace("_", " ")}
                  </span>

                  <span
                    className={`priority-badge priority-${getPriority(
                      selectedTicket
                    )}`}
                  >
                    {getPriority(
                      selectedTicket
                    )}
                  </span>
                </div>
              </div>

              {/* USER INFO */}

              <div className="customer-info">
                <div>
                  <span>Customer</span>
                  <strong>
                    {getUserName(
                      selectedTicket
                    )}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {getUserEmail(
                      selectedTicket
                    )}
                  </strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>
                    {formatDate(
                      selectedTicket.createdAt
                    )}
                  </strong>
                </div>
              </div>

              {/* CONVERSATION */}

              <div className="conversation">
                <div className="conversation-title">
                  <h3>Conversation</h3>
                </div>

                {/* INITIAL MESSAGE */}

                {getDescription(
                  selectedTicket
                ) && (
                  <div className="message-row customer-message">
                    <div className="message-avatar">
                      {getInitials(
                        selectedTicket
                      )}
                    </div>

                    <div className="message-content">
                      <div className="message-meta">
                        <strong>
                          {getUserName(
                            selectedTicket
                          )}
                        </strong>

                        <span>
                          {formatDate(
                            selectedTicket.createdAt
                          )}
                        </span>
                      </div>

                      <div className="message-bubble">
                        {getDescription(
                          selectedTicket
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* REPLIES */}

                {Array.isArray(
                  (selectedTicket as any)
                    .replies
                ) &&
                  (selectedTicket as any).replies
                    .map(
                      (
                        reply: any,
                        index: number
                      ) => {
                        const isAdmin =
                          reply?.sender ===
                            "admin" ||
                          reply?.isAdmin === true ||
                          reply?.senderType ===
                            "admin";

                        return (
                          <div
                            key={
                              reply?._id ||
                              index
                            }
                            className={`message-row ${
                              isAdmin
                                ? "admin-message"
                                : "customer-message"
                            }`}
                          >
                            <div className="message-avatar">
                              {isAdmin
                                ? "AD"
                                : getInitials(
                                    selectedTicket
                                  )}
                            </div>

                            <div className="message-content">
                              <div className="message-meta">
                                <strong>
                                  {isAdmin
                                    ? "Admin"
                                    : getUserName(
                                        selectedTicket
                                      )}
                                </strong>

                                <span>
                                  {formatDate(
                                    reply?.createdAt
                                  )}
                                </span>
                              </div>

                              <div className="message-bubble">
                                {reply?.message ||
                                  reply?.text ||
                                  ""}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}

                {getDescription(
                  selectedTicket
                ) === "" &&
                  (!Array.isArray(
                    (selectedTicket as any)
                      .replies
                  ) ||
                    (selectedTicket as any)
                      .replies.length ===
                      0) && (
                    <div className="no-messages">
                      No conversation messages yet.
                    </div>
                  )}
              </div>

              {/* REPLY BOX */}

              <div className="reply-section">
                <label>Reply to customer</label>

                <textarea
                  value={replyMessage}
                  onChange={(e) =>
                    setReplyMessage(
                      e.target.value
                    )
                  }
                  placeholder="Type your reply here..."
                  rows={4}
                  disabled={replyLoading}
                />

                <div className="reply-footer">
                  <span>
                    {replyMessage.length} characters
                  </span>

                  <button
                    className="send-reply-btn"
                    onClick={handleSendReply}
                    disabled={
                      replyLoading ||
                      !replyMessage.trim()
                    }
                  >
                    {replyLoading ? (
                      <>
                        <span className="small-loader"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <span>➤</span>
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicket;
