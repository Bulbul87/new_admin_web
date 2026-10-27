import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Mic,
  RefreshCw,
  User,
} from "lucide-react";

import {
 type Conversation,
 type LastMessage,
  getAdminConversation,
  getUserFullName,
} from "../service/messageService";

import { maskAbusiveWords } from "../utils/maskwords";

const MessageDetail: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<LastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
    limit: 50,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const loadConversation = async (
    currentPage: number = page,
    isRefresh = false
  ) => {
    if (!conversationId) {
      setError("Conversation ID is missing.");
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAdminConversation(
        conversationId,
        currentPage,
        50
      );

      setConversation(response.conversation || null);
      setMessages(response.messages || []);
      setPagination(response.pagination);

    } catch (err: any) {
      console.error("Error loading conversation:", err);
      setError(
        err?.message || "Failed to load conversation."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversation(1);
  }, [conversationId]);

  const participants = useMemo(() => {
    return conversation?.participants || [];
  }, [conversation]);

  const getParticipantRole = (role?: string) => {
    if (role?.toLowerCase() === "provider") return "Caregiver";
    if (role?.toLowerCase() === "user" || role?.toLowerCase() === "requester") {
      return "Requester";
    }
    return role || "User";
  };

  const formatDateTime = (date?: string) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatTime = (date?: string) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getMessageIcon = (messageType?: string) => {
    switch (messageType) {
      case "image":
        return <ImageIcon size={17} />;

      case "audio":
        return <Mic size={17} />;

      case "file":
        return <FileText size={17} />;

      default:
        return <MessageCircle size={17} />;
    }
  };

  const getMessageContent = (message: LastMessage) => {
    if (message.isDeleted) {
      return "This message was deleted";
    }

    if (message.messageType === "text") {
      return message.content || "";
    }

    if (message.messageType === "image") {
      return "Image";
    }

    if (message.messageType === "audio") {
      return "Audio message";
    }

    if (message.messageType === "file") {
      return "File attachment";
    }

    if (message.messageType === "sticker") {
      return "Sticker";
    }

    return message.content || message.messageType || "Message";
  };

  const handlePageChange = (newPage: number) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === page
    ) {
      return;
    }

    setPage(newPage);
    loadConversation(newPage);
  };

  if (loading) {
    return (
      <div
        style={{
          marginLeft: "260px",
          marginTop: "70px",
          minHeight: "calc(100vh - 70px)",
          background: "#f4f7fb",
          padding: "30px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "60px",
            textAlign: "center",
            color: "#667085",
          }}
        >
          Loading conversation...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          marginLeft: "260px",
          marginTop: "70px",
          minHeight: "calc(100vh - 70px)",
          background: "#f4f7fb",
          padding: "30px",
        }}
      >
        <button
          onClick={() => navigate("/messages")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            background: "transparent",
            color: "#14344A",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          <ArrowLeft size={18} />
          Back to Messages
        </button>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "50px",
            textAlign: "center",
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        marginLeft: "260px",
        marginTop: "70px",
        minHeight: "calc(100vh - 70px)",
        background: "#f4f7fb",
        padding: "30px",
        boxSizing: "border-box",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
        

          <h1
            style={{
              color: "#14344A",
              fontSize: "28px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Conversation Details
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#667085",
              fontSize: "14px",
            }}
          >
            View complete conversation history
          </p>
        </div>
        <div className="d-flex gap-2">

  <button
            onClick={() => navigate("/messages")}
              className="booking-back-btn "
           
          >
            <ArrowLeft size={17} />
            Back 
          </button>
        <button
          onClick={() => loadConversation(page, true)}
          disabled={refreshing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid #d9e1e8",
            background: "#14344A",
            color: "#fff",
            borderRadius: "8px",
            padding: "9px 16px",
            fontWeight: 600,
            cursor: refreshing ? "not-allowed" : "pointer",
          }}
        >
          <RefreshCw
            size={17}
            style={{
              animation: refreshing
                ? "spin 1s linear infinite"
                : "none",
            }}
          />
          Refresh
        </button>
        </div>
      </div>

      {/* ================= PARTICIPANTS ================= */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid #e7edf2",
          padding: "22px",
          marginBottom: "20px",
          boxShadow: "0 4px 18px rgba(20,52,74,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "18px",
          }}
        >
          <MessageCircle size={19} color="#14344A" />

          <h2
            style={{
              margin: 0,
              fontSize: "17px",
              fontWeight: 700,
              color: "#14344A",
            }}
          >
            Participants
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              participants.length > 1
                ? "repeat(2, minmax(0, 1fr))"
                : "1fr",
            gap: "16px",
          }}
        >
          {participants.map((user) => (
            <div
              key={user._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "13px",
                border: "1px solid #edf1f4",
                borderRadius: "13px",
                padding: "14px",
                background: "#fafbfd",
              }}
            >
              {/* ICON ONLY - NO PROFILE IMAGE */}
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#e8eef3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User size={21} color="#14344A" />
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#14344A",
                  }}
                >
                  {getUserFullName(user)}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#667085",
                    marginTop: "3px",
                  }}
                >
                  {getParticipantRole(user.role)}
                  {user.email ? ` • ${user.email}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= CHAT ================= */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid #e7edf2",
          boxShadow: "0 4px 18px rgba(20,52,74,0.04)",
          overflow: "hidden",
        }}
      >
        {/* CHAT HEADER */}

        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid #edf1f4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#14344A",
                fontSize: "17px",
                fontWeight: 700,
              }}
            >
              Messages
            </h2>

            <div
              style={{
                marginTop: "4px",
                color: "#98A2B3",
                fontSize: "12px",
              }}
            >
              {pagination.totalMessages} total messages
            </div>
          </div>

          {conversation?.lastMessageAt && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#667085",
                fontSize: "12px",
              }}
            >
              <Clock3 size={14} />
              Last activity{" "}
              {formatDateTime(conversation.lastMessageAt)}
            </div>
          )}
        </div>

        {/* CHAT AREA */}

        <div
          className="message-detail-chat-area"
          style={{
            padding: "28px",
            minHeight: "420px",
            maxHeight: "650px",
            overflowY: "auto",
            background: "#f8fafc",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                height: "350px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                color: "#98A2B3",
                gap: "10px",
              }}
            >
              <MessageCircle size={35} />
              <span>No messages found</span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {messages.map((message) => {
                const sender = message.sender;
                const senderName = getUserFullName(sender);
                const isCaregiver = sender?.role?.toLowerCase() === "provider";

                return (
                  <div
                    key={message._id}
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: isCaregiver ? "flex-end" : "flex-start",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "72%",
                        display: "flex",
                        flexDirection: isCaregiver ? "row-reverse" : "row",
                        gap: "10px",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* SENDER ICON */}
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          minWidth: "36px",
                          borderRadius: "50%",
                          background: isCaregiver ? "#d9ecfb" : "#e8eef3",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: "2px",
                        }}
                      >
                        <User
                          size={17}
                          color={isCaregiver ? "#1769aa" : "#14344A"}
                        />
                      </div>

                      {/* MESSAGE CONTENT */}
                      <div
                        style={{
                          minWidth: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isCaregiver ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: isCaregiver ? "flex-end" : "flex-start",
                            gap: "8px",
                            marginBottom: "5px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#14344A",
                            }}
                          >
                            {senderName}
                          </span>

                          {sender?.role && (
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "3px 7px",
                                borderRadius: "20px",
                                background: isCaregiver ? "#e8f4ff" : "#eefbf2",
                                color: isCaregiver ? "#1671b9" : "#16803c",
                                fontWeight: 600,
                              }}
                            >
                              {getParticipantRole(sender.role)}
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            background: isCaregiver ? "#ddf3e7" : "#ffffff",
                            border: isCaregiver
                              ? "1px solid #c7e7d5"
                              : "1px solid #e1e8f0",
                            borderRadius: isCaregiver
                              ? "14px 4px 14px 14px"
                              : "4px 14px 14px 14px",
                            padding: "12px 14px",
                            boxShadow: "0 2px 6px rgba(20,52,74,0.04)",
                            overflowWrap: "anywhere",
                            minWidth: "70px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "7px",
                              color: "#14344A",
                              fontSize: "14px",
                              lineHeight: 1.5,
                            }}
                          >
                            {message.messageType !== "text" &&
                              getMessageIcon(message.messageType)}

                            <span
                              style={{
                                fontStyle: message.isDeleted ? "italic" : "normal",
                                color: message.isDeleted ? "#98A2B3" : "#344054",
                                whiteSpace: "pre-wrap",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {/* {getMessageContent(message)} */}
                            {maskAbusiveWords(
  String(getMessageContent(message) ?? "")
)}
                            </span>
                          </div>

                          {/* MEDIA URL */}
                          {message.media?.url && (
                            <div
                              style={{
                                marginTop: "8px",
                                fontSize: "11px",
                                color: "#667085",
                                wordBreak: "break-all",
                              }}
                            >
                              {message.media.url}
                            </div>
                          )}

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: "6px",
                              marginTop: "7px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "10px",
                                color: "#8290a0",
                              }}
                            >
                              {formatTime(message.createdAt)}
                            </span>

                            {message.isRead && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: "#3b82f6",
                                  fontWeight: 600,
                                }}
                              >
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= PAGINATION ================= */}

        <div
          style={{
            padding: "15px 22px",
            borderTop: "1px solid #edf1f4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              color: "#667085",
              fontSize: "12px",
            }}
          >
            Page {pagination.currentPage} of{" "}
            {pagination.totalPages}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() =>
                handlePageChange(pagination.currentPage - 1)
              }
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                border: "1px solid #d9e1e8",
                background: pagination.hasPrevPage
                  ? "#fff"
                  : "#f5f6f7",
                color: pagination.hasPrevPage
                  ? "#14344A"
                  : "#98A2B3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: pagination.hasPrevPage
                  ? "pointer"
                  : "not-allowed",
              }}
            >
              <ChevronLeft size={17} />
            </button>

            <button
              disabled={!pagination.hasNextPage}
              onClick={() =>
                handlePageChange(pagination.currentPage + 1)
              }
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                border: "1px solid #d9e1e8",
                background: pagination.hasNextPage
                  ? "#fff"
                  : "#f5f6f7",
                color: pagination.hasNextPage
                  ? "#14344A"
                  : "#98A2B3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: pagination.hasNextPage
                  ? "pointer"
                  : "not-allowed",
              }}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
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

          @media (max-width: 700px) {
            .message-detail-chat-area {
              padding: 16px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MessageDetail;