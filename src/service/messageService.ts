import { api } from "../service/api";

/* =========================
   USER
========================= */

export interface MessageUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  profileImage?: string;
}


/* =========================
   LAST MESSAGE
========================= */

export interface LastMessage {
  _id: string;

  sender: MessageUser;
  receiver: MessageUser;

  messageType:
    | "text"
    | "image"
    | "audio"
    | "sticker"
    | "file"
    | string;

  content?: string;

  media?: {
    url?: string;
    type?: string;
    size?: number;
    duration?: number;
  };

  isRead: boolean;
  isDeleted: boolean;

  createdAt: string;
  updatedAt?: string;
}


/* =========================
   CONVERSATION
========================= */

export interface Conversation {
  _id: string;

  participants: MessageUser[];

  lastMessage?: LastMessage | null;

  lastMessageAt?: string;

  createdAt: string;
  updatedAt: string;

  unreadCount: Record<string, number>;

  isActive: boolean;
}


/* =========================
   PAGINATION
========================= */

export interface ConversationsPagination {
  currentPage: number;
  totalPages: number;
  totalConversations: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MessagesPagination {
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}


/* =========================
   SERVICE RESPONSE TYPES
========================= */

export interface AdminConversationsData {
  conversations: Conversation[];
  pagination: ConversationsPagination;
}

export interface AdminConversationData {
  conversation: Conversation;
  messages: LastMessage[];
  pagination: MessagesPagination;
}


/* =========================================================
   GET ALL ADMIN CONVERSATIONS
   GET /api/admin/conversations
========================================================= */

export const getAdminConversations = async (
  page: number = 1,
  limit: number = 20
): Promise<AdminConversationsData> => {
  try {
    const response = await api.get<AdminConversationsData>(
      `/admin/conversations?page=${page}&limit=${limit}`
    );

    console.log("ADMIN CONVERSATIONS:", response);

    return {
      conversations: response?.conversations || [],
      pagination: response?.pagination || {
        currentPage: page,
        totalPages: 1,
        totalConversations: 0,
        limit,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  } catch (error) {
    console.error("Error fetching admin conversations:", error);
    throw error;
  }
};


/* =========================================================
   GET SINGLE ADMIN CONVERSATION
   GET /api/admin/conversation/:conversationId
========================================================= */

export const getAdminConversation = async (
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<AdminConversationData> => {
  try {
    const response = await api.get<AdminConversationData>(
      `/admin/conversation/${conversationId}?page=${page}&limit=${limit}`
    );

    console.log("ADMIN CONVERSATION DETAIL:", response);

    return {
      conversation: response?.conversation || ({} as Conversation),
      messages: response?.messages || [],
      pagination: response?.pagination || {
        currentPage: page,
        totalPages: 1,
        totalMessages: 0,
        limit,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  } catch (error) {
    console.error("Error fetching admin conversation:", error);
    throw error;
  }
};


/* =========================================================
   HELPERS
========================================================= */

export const getUserFullName = (
  user?: MessageUser
): string => {
  if (!user) return "Unknown User";

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user.email || "Unknown User";
};


export const getConversationParticipants = (
  conversation: Conversation
): MessageUser[] => {
  return conversation?.participants || [];
};


export const getOtherParticipant = (
  conversation: Conversation,
  userId?: string
): MessageUser | undefined => {
  if (!conversation?.participants?.length) {
    return undefined;
  }

  if (!userId) {
    return conversation.participants[0];
  }

  return conversation.participants.find(
    (participant) => participant._id !== userId
  );
};