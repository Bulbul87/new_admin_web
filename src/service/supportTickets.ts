// import { api } from "../service/api";
import { testapi } from "../service/testapi";

// ==============================
// TYPES
// ==============================

export interface SupportTicket {
  _id: string;
  [key: string]: any;
}

export interface SupportReply {
  message: string;
}

// ==============================
// ADMIN SUPPORT TICKET APIs
// ==============================

//Get all support tickets
export const getAllSupportTickets = async () => {
  const res = await testapi.get<{
    tickets: SupportTicket[];
  }>("/admin/tickets");

  return res?.tickets || [];
};


// ==============================
// GET TICKET BY ID
// ==============================

// Get support ticket details
export const getSupportTicketById = async (
  id: string
) => {
  const res = await testapi.get<{
    ticket: SupportTicket;
  }>(`/admin/tickets/${id}`);

  return res?.ticket || res;
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