


import { api } from "../service/api";

// ==============================
// TYPES
// ==============================

export interface User {
  _id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  phone: string;
  role?: string;
  profileImage?: string;
  dateOfBirth?: string;
  address?: Record<string, any>;
  location?: Record<string, any>;
  liveLocation?: Record<string, any>;
  requestorInfo?: Record<string, any>;
  providerInfo?: {
    identityData?: {
      ssn?: string;
      ssnLast4?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

// ==============================
// PAGINATION TYPES
// ==============================

export interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

export interface PaginatedUsersResponse {
  users: User[];
  pagination: Pagination;
}

// ==============================
// ADMIN APIs
// ==============================

   export  const getProfileImage = (profileImage?: string) => {
  if (!profileImage || profileImage === "undefined") {
    return "/default-profile.png";
  }

  if (profileImage.startsWith("http")) {
    return profileImage;
  }

  return `https://api.senioramerica.us${
    profileImage.startsWith("/") ? "" : "/"
  }${profileImage}`;
};

// Get all requesters (users)
export const getAllUsers = async (
  page = 1,
  limit = 20
): Promise<PaginatedUsersResponse> => {
  const res = await api.get<{
    users?: User[];
    pagination?: Pagination;
  }>(`/admin/users?role=user&page=${page}&limit=${limit}`);

  return {
    users: res?.users || [],
    pagination: res?.pagination || {
      page,
      totalPages: 0,
      total: 0,
    },
  };
};

// Get all providers
export const getAllProviders = async (
  page = 1,
  limit = 20
): Promise<PaginatedUsersResponse> => {
  const res = await api.get<{
    users?: User[];
    providers?: User[];
    pagination?: Pagination;
  }>(`/admin/providers?page=${page}&limit=${limit}`);

  return {
    users: res?.providers || res?.users || [],
    pagination: res?.pagination || {
      page,
      totalPages: 0,
      total: 0,
    },
  };
};

// Search providers
export const searchProviders = async (params?: any) => {
  const query = new URLSearchParams(params).toString();

  const res: any = await api.get(
    `/providers/search${query ? `?${query}` : ""}`
  );

  return res?.data || res;
};

// ==============================
// ACTION APIs
// ==============================

// Approve Provider
export const approveProvider = async (id: string) => {
  return api.post(`/admin/providers/${id}/approve`, {});
};

// Reject Provider
export const rejectProvider = async (
  id: string,
  reason: string
) => {
  return api.post(`/admin/providers/${id}/reject`, {
    reason,
  });
};

// Suspend User
export const suspendUser = async (
  id: string,
  reason: string
) => {
  return api.post(`/admin/users/${id}/suspend`, {
    reason,
  });
};

// Activate User
export const activateUser = async (id: string) => {
  return api.patch(`/admin/users/${id}/activate`);
};

// ==============================
// EXTRA APIs
// ==============================

// Get pending providers
export const getPendingProviders = async (): Promise<User[]> => {
  const res = await api.get<{ providers?: User[] }>(
    "/admin/verifications/pending"
  );

  return res?.providers || [];
};

// Get admin stats
export const getAdminStats = async () => {
  return api.get("/admin/stats");
};

// Decrypt Value By Key
export const decryptByKey = async (key: string) => {
  return api.get(
    `/crypto/decrypt?key=${encodeURIComponent(key)}`
  );
};

export interface ProviderAcceptingSession {
  _id: string;
  provider:
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      }
    | string
    | null;
  state: "online" | "offline";
  startedAt: string;
  endedAt: string | null;
  durationSeconds?: number;
  source: "toggle" | "logout" | "admin_suspend" | "backfill";
  createdAt: string;
  updatedAt: string;
}

export interface ProviderAcceptingSessionsResponse {
  success: boolean;
  message: string;
  data: ProviderAcceptingSession[];
  pagination: {
    currentPage: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}

export const getProviderAcceptingSessions = async (
  page = 1,
  limit = 20,
  search = "",
  state = "",
  source = ""
): Promise<ProviderAcceptingSessionsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search,
    state,
    source,
  });

  const response = await api.get<ProviderAcceptingSessionsResponse>(
    `/admin/provider-acceptingsessions?${params.toString()}`
  );

  return response;
};




export interface AdminReview {
  _id: string;

  reviewer: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  } | null;

  rating: number | null;
  comment: string;

  categories?: {
    professionalism?: number;
    punctuality?: number;
    quality?: number;
    communication?: number;
  };

  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;

  response?: {
    comment?: string;
    respondedAt?: string;
  } | null;

  booking?: {
    _id: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } | null;
}

export interface AdminReviewsResponse {
  success: boolean;
  message: string;

  profile: {
    _id: string;
    name: string;
    role: string;
  };

  summary: {
    totalReviews: number;
    totalRatings: number;
    totalComments: number;
    averageRating: number | null;
  };

  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };

  data: AdminReview[];
}

export const getAdminUserReviews = async (
  userId: string,
  profileType: "provider" | "requester",
  page: number = 1,
  limit: number = 10
): Promise<AdminReviewsResponse> => {
  const endpoint =
    `/admin/users/${encodeURIComponent(userId)}/reviews` +
    `?profileType=${profileType}` +
    `&page=${page}` +
    `&limit=${limit}`;

  return api.get<AdminReviewsResponse>(endpoint);
};
