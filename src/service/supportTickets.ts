import { testapi } from "../service/testapi";

// ==============================
// TYPES
// ==============================

export interface SupportTicket {
  _id: string;
  caseId?: string;
  user?: {
    _id?: string;
    email?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
  category?: string;
  comment?: string;
  description?: string;
  message?: string;
  subject?: string;
  title?: string;
  status?: string;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
  replies?: SupportReply[];
  [key: string]: any;
}

export interface SupportReply {
  userId?: string;
  sender?: string;
  senderRole?: string;
  senderType?: string;
  isAdmin?: boolean;
  message: string;
  attachment?: any;
  createdAt?: string;
  _id?: string;
}

// ==============================
// ADMIN SUPPORT TICKET APIs
// ==============================

// Get all support tickets
// Backend response:
// {
//   success: true,
//   data: [ ...tickets ]
// }
//
// testapi already returns data?.data || data,
// therefore `res` is the ticket array directly.
export const getAllSupportTickets = async (): Promise<SupportTicket[]> => {
  const res = await testapi.get<SupportTicket[]>("/admin/tickets");

  console.log("🟢 Support API Response:", res);

  return Array.isArray(res) ? res : [];
};

// ==============================
// GET TICKET BY ID
// ==============================

// Get support ticket details
// testapi returns the backend `data` object directly.
export const getSupportTicketById = async (
  id: string
): Promise<SupportTicket> => {
  const res = await testapi.get<SupportTicket>(
    `/admin/tickets/${id}`
  );

  console.log("🟢 Support Ticket Detail Response:", res);

  return res;
};

// ==============================
// POST REPLY
// ==============================

// Send reply to support ticket
export const replyToSupportTicket = async (
  id: string,
  message: string
) => {
  return testapi.post(
    `/admin/tickets/${id}/replies`,
    {
      message,
    }
  );
};