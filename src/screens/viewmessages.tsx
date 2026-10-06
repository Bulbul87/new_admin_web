import { useEffect, useState } from "react";
import { ArrowLeft, Eye, MessageSquare, RefreshCw, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAdminConversations,
  getUserFullName,
  type Conversation,
} from "../service/messageService";

const ViewMessages = () => {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalConversations: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const loadConversations = async (page = 1) => {
    try {
      setLoading(true);

      const result = await getAdminConversations(page, 20);

      setConversations(result.conversations || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const result = await getAdminConversations(
        pagination.currentPage,
        pagination.limit
      );

      setConversations(result.conversations || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Failed to refresh conversations:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getParticipants = (conversation: Conversation) => {
    return conversation.participants || [];
  };

  const getUnreadCount = (conversation: Conversation) => {
    if (!conversation.unreadCount) return 0;

    return Object.values(conversation.unreadCount).reduce(
      (total, count) => total + Number(count || 0),
      0
    );
  };

  const filteredConversations = conversations.filter((conversation) => {
    if (!search.trim()) return true;

    const searchText = search.toLowerCase();

    const participantText = (conversation.participants || [])
      .map((user) =>
        `${user.firstName || ""} ${user.lastName || ""} ${
          user.email || ""
        } ${user.role || ""}`
      )
      .join(" ")
      .toLowerCase();

    const messageText =
      conversation.lastMessage?.content?.toLowerCase() || "";

    return (
      participantText.includes(searchText) ||
      messageText.includes(searchText)
    );
  });

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
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>

             <button
            onClick={() => navigate("/provider-status")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              border: "none",
              background: "transparent",
              color: "#14344A",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              marginBottom: "12px",
            }}
          >
            <ArrowLeft size={17} />
            Back 
          </button>
          <h1
            style={{
              color: "#14344A",
              fontSize: "26px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            View Messages
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
              marginTop: "6px",
            }}
          >
            View conversations between users and providers
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            background: "#14344A",
            color: "#fff",
            cursor: refreshing ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          <RefreshCw
            size={17}
            style={{
              animation: refreshing ? "spin 1s linear infinite" : "none",
            }}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "18px",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Total Conversations
              </p>

              <h2
                style={{
                  margin: "6px 0 0",
                  color: "#14344A",
                  fontSize: "25px",
                }}
              >
                {pagination.totalConversations}
              </h2>
            </div>

            <MessageSquare
              size={30}
              color="#14344A"
            />
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Current Page
          </p>

          <h2
            style={{
              margin: "6px 0 0",
              color: "#14344A",
              fontSize: "25px",
            }}
          >
            {pagination.currentPage} / {pagination.totalPages}
          </h2>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Showing
          </p>

          <h2
            style={{
              margin: "6px 0 0",
              color: "#14344A",
              fontSize: "25px",
            }}
          >
            {filteredConversations.length}
          </h2>
        </div>
      </div>

      {/* SEARCH */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "15px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            position: "relative",
            maxWidth: "500px",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "13px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />

          <input
            type="text"
            placeholder="Search by name, email or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "11px 14px 11px 40px",
              border: "1px solid #dbe3ec",
              borderRadius: "8px",
              outline: "none",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* CONVERSATIONS */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        {/* TABLE HEADER */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.3fr 2fr 1.2fr 100px",
            gap: "15px",
            padding: "16px 20px",
            background: "#f8fafc",
            borderBottom: "1px solid #e5e7eb",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          <div>Participants</div>
          <div>Roles</div>
          <div>Last Message</div>
          <div>Last Activity</div>
          <div>Action</div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <MessageSquare
              size={42}
              style={{ marginBottom: "10px", opacity: 0.5 }}
            />

            <p style={{ margin: 0 }}>
              No conversations found.
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const participants = getParticipants(conversation);

            const unreadCount = getUnreadCount(conversation);

            const lastMessage = conversation.lastMessage;

            return (
              <div
                key={conversation._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.3fr 2fr 1.2fr 100px",
                  gap: "15px",
                  padding: "18px 20px",
                  alignItems: "center",
                  borderBottom: "1px solid #edf0f4",
                }}
              >
                {/* PARTICIPANTS */}
                <div>
                  {participants.length === 0 ? (
                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: "13px",
                      }}
                    >
                      No participants
                    </span>
                  ) : (
                    participants.map((user) => (
                      <div
                        key={user._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "8px",
                        }}
                      >
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={getUserFullName(user)}
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              borderRadius: "50%",
                              background: "#e8eef3",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <User size={17} color="#14344A" />
                          </div>
                        )}

                        <div>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#14344A",
                            }}
                          >
                            {getUserFullName(user)}
                          </div>

                          <div
                            style={{
                              fontSize: "11px",
                              color: "#94a3b8",
                            }}
                          >
                            {user.email || "-"}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* ROLES */}
                <div>
                  {participants.map((user) => (
                    <div
                      key={user._id}
                      style={{
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 9px",
                          borderRadius: "20px",
                          background:
                            user.role === "provider"
                              ? "#e8f5e9"
                              : "#e8f1fb",
                          color:
                            user.role === "provider"
                              ? "#2e7d32"
                              : "#1769aa",
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}
                      >
                        {user.role || "user"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* LAST MESSAGE */}
                <div>
                  {!lastMessage ? (
                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: "13px",
                      }}
                    >
                      No messages
                    </span>
                  ) : (
                    <>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#334155",
                          fontWeight: 500,
                          maxWidth: "300px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lastMessage.messageType === "text"
                          ? lastMessage.content || "-"
                          : `[${lastMessage.messageType}]`}
                      </div>

                      {unreadCount > 0 && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "5px",
                            padding: "3px 8px",
                            borderRadius: "20px",
                            background: "#ef4444",
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: 700,
                          }}
                        >
                          {unreadCount} unread
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* LAST ACTIVITY */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  {formatDate(
                    lastMessage?.createdAt ||
                      conversation.lastMessageAt
                  )}
                </div>

                {/* ACTION */}
                <div>
                  <button
                    onClick={() =>
                      navigate(
                        `/messages/${conversation._id}`
                      )
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      border: "none",
                      borderRadius: "7px",
                      padding: "8px 11px",
                      background: "#14344A",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    <Eye size={15} />
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION */}
      {!loading && pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
            padding: "15px 20px",
            background: "#fff",
            borderRadius: "10px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Page {pagination.currentPage} of{" "}
            {pagination.totalPages}
          </span>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() =>
                loadConversations(
                  pagination.currentPage - 1
                )
              }
              style={{
                padding: "8px 14px",
                borderRadius: "7px",
                border: "1px solid #dbe3ec",
                background: pagination.hasPrevPage
                  ? "#fff"
                  : "#f1f5f9",
                color: pagination.hasPrevPage
                  ? "#14344A"
                  : "#94a3b8",
                cursor: pagination.hasPrevPage
                  ? "pointer"
                  : "not-allowed",
              }}
            >
              Previous
            </button>

            <button
              disabled={!pagination.hasNextPage}
              onClick={() =>
                loadConversations(
                  pagination.currentPage + 1
                )
              }
              style={{
                padding: "8px 14px",
                borderRadius: "7px",
                border: "1px solid #dbe3ec",
                background: pagination.hasNextPage
                  ? "#fff"
                  : "#f1f5f9",
                color: pagination.hasNextPage
                  ? "#14344A"
                  : "#94a3b8",
                cursor: pagination.hasNextPage
                  ? "pointer"
                  : "not-allowed",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

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
        `}
      </style>
    </div>
  );
};

export default ViewMessages;