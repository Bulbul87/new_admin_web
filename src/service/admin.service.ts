import { api } from "../service/api";

// ==============================
// TYPES
// ==============================

export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;


    identityData?: {
      
      ssnLast4?: string;
    };
 
}


// ==============================
// ADMIN APIs
// ==============================

// ✅ Get all requesters (users)
export const getAllUsers = async (): Promise<User[]> => {
  const res = await api.get<{ users: User[] }>(
    "/admin/users?role=user"
  );
  return res?.users || [];
};

// ✅ Get all providers
export const getAllProviders = async (): Promise<User[]> => {
  const res = await api.get<{ providers: User[] }>(
    "/admin/providers"
  );
  return res?.providers || [];
};

// ✅ Search providers
export const searchProviders = async (
  params?: any
) => {

  const query = new URLSearchParams(params).toString();

  const res: any = await api.get(
    `/providers/search${query ? `?${query}` : ""}`
  );

  return res?.data || res;
};
// ==============================
// 🔥 ACTION APIs
// ==============================

// ✅ Approve Provider
export const approveProvider = async (id: string) => {
  return api.post(`/admin/providers/${id}/approve`, {});
};

// ✅ Reject Provider
export const rejectProvider = async (id: string, reason: string) => {
  return api.post(`/admin/providers/${id}/reject`, {
    reason,
  });
};

// ✅ Suspend User
export const suspendUser = async (id: string, reason: string) => {
  return api.post(`/admin/users/${id}/suspend`, {
    reason,
  });
};

// ==============================
// 📊 EXTRA APIs
// ==============================

// ✅ Get pending providers
export const getPendingProviders = async (): Promise<User[]> => {
  const res = await api.get<{ providers: User[] }>(
    "/admin/verifications/pending"
  );
  return res?.providers || [];
};

// ✅ Get admin stats
export const getAdminStats = async () => {
  return api.get("/admin/stats");
};

// ✅ Decrypt Value By Key
export const decryptByKey = async (key: string) => {
  return api.get(`/crypto/decrypt?key=${encodeURIComponent(key)}`);
};