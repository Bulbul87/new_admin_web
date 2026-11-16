
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://api.senioramerica.us/api";

export type PaymentStatus =
  | "completed"
  | "pending"
  | "processing"
  | "authorized"
  | "held"
  | "failed"
  | "refunded"
  | "cancelled"
  | string;

export interface ReceiptUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  publicRequesterId?: string;
  publicProviderId?: string;
}

export interface ReceiptBooking {
  _id?: string;
  publicServiceId?: string;
  service?: {
    name?: string;
    serviceName?: string;
    title?: string;
  };
  provider?: ReceiptUser;
  requestor?: ReceiptUser;
  requester?: ReceiptUser;
  startDate?: string;
  scheduledDate?: string;
  status?: string;
}

export interface PaymentReceipt {
  _id: string;
  user?: ReceiptUser | string;
  booking?: ReceiptBooking | string;
  amount?: number;
  totalAmount?: number;
  currency?: string;
  status?: PaymentStatus;
  transactionId?: string;
  paymentIntentId?: string;
  paymentGateway?: {
    paymentIntentId?: string;
    transactionId?: string;
    gateway?: string;
    name?: string;
  };
  paymentMethod?: string;
  paymentType?: string;
  createdAt?: string;
  updatedAt?: string;
  receiptNumber?: string;
  receiptUrl?: string;
  receipt?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ReceiptFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReceiptPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReceiptListResponse {
  payments: PaymentReceipt[];
  pagination: ReceiptPagination;
}

function getToken(): string {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Admin token not found. Please login again.");
  }

  return token;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        `Request failed with status ${response.status}`
    );
  }

  if (result?.success === false) {
    throw new Error(result?.message || "Something went wrong.");
  }

  return result as T;
}

function extractListResponse(
  response: any,
  requestedPage: number,
  requestedLimit: number
): ReceiptListResponse {
  const root = response?.data ?? response;

  const payments =
    root?.payments ??
    root?.records ??
    root?.results ??
    root?.data?.payments ??
    [];

  const paginationData =
    root?.pagination ??
    root?.meta ??
    response?.pagination ??
    {};

  const total = Number(
    paginationData?.total ??
      paginationData?.totalRecords ??
      root?.total ??
      payments.length
  );

  const limit = Number(
    paginationData?.limit ?? requestedLimit
  );

  const page = Number(
    paginationData?.page ?? requestedPage
  );

  const totalPages = Number(
    paginationData?.totalPages ??
      Math.ceil(total / Math.max(limit, 1))
  );

  return {
    payments: Array.isArray(payments) ? payments : [],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export const paymentReceiptService = {
  async getReceipts(
    filters: ReceiptFilters = {}
  ): Promise<ReceiptListResponse> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (filters.status && filters.status !== "all") {
      params.set("status", filters.status);
    }

    if (filters.search?.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.startDate) {
      params.set("startDate", filters.startDate);
    }

    if (filters.endDate) {
      params.set("endDate", filters.endDate);
    }

    const response = await apiRequest<any>(
      `/payments/admin/receipts?${params.toString()}`
    );

    return extractListResponse(response, page, limit);
  },

  async getReceiptDetails(
    paymentId: string
  ): Promise<PaymentReceipt> {
    const response = await apiRequest<any>(
      `/payments/${encodeURIComponent(paymentId)}/receipt`
    );

    const receipt =
      response?.receipt ??
      response?.data?.receipt ??
      response?.data ??
      response?.payment ??
      response;

    return receipt as PaymentReceipt;
  },
};
