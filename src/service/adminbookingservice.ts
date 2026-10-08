/**
 * ============================================================
 * COMMON TYPES
 * ============================================================
 */

export interface Person {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
}

export interface ServiceInfo {
  _id: string;
  name?: string;
  description?: string;
  category?: string;
  icon?: string;
}

export interface ScheduledTime {
  start?: string;
  end?: string;
}

export interface CancellationInfo {
  cancelledBy?: Person | string | null;
  cancelledAt?: string | null;
  reason?: string | null;
  refundAmount?: number | null;
  refundStatus?: string | null;
}

/**
 * ============================================================
 * SERVICE RESPONSES
 * ============================================================
 */

export type ServiceResponseType =
  | "accepted"
  | "rejected"
  | "cancelled_by_requestor"
  | "cancelled_by_provider";

export interface ServiceResponse {
  id: string;
  type: ServiceResponseType;

  requestor: Person | null;
  provider: Person | null;
  service: ServiceInfo | null;

  scheduledDate?: string | null;
  scheduledTime?: ScheduledTime | null;

  responseAt?: string | null;
  bookingStatus?: string | null;

  cancellation?: CancellationInfo | null;

  source?: string;
  broadcastRequestId?: string;
}

/**
 * ============================================================
 * BOOKING VISITS
 * ============================================================
 */

export interface DaySchedule {
  date?: string;
  fromTime?: string;
  toTime?: string;
  duration?: number;
  tasks?: string[];
  startUtc?: string;
  endUtc?: string;
}

export interface BookingVisit {
  _id: string;
  booking: string;

  visitIndex: number;

  scheduledDate: string;
  fromTime: string;
  toTime: string;

  duration: number;

  tasks?: string[];
  status: string;

  startUtc?: string;
  endUtc?: string;

  providerEnRouteAt?: string;
  providerArrivedAt?: string;
  providerStartedAt?: string;

  completionRequestedAt?: string;
  completedAt?: string;

  accessCode?: string;
  accessCodeUsed?: boolean;
}

/**
 * ============================================================
 * SCHEDULED SERVICES
 * ============================================================
 */

export interface ScheduledService {
  bookingId: string;

  requestor: Person | null;
  provider: Person | null;
  service: ServiceInfo | null;

  scheduledDate?: string | null;
  scheduledTime?: ScheduledTime | null;

  duration?: number | null;

  status: string;

  isMultiDay: boolean;

  daySchedules: DaySchedule[];

  visits: BookingVisit[];
}

/**
 * ============================================================
 * PAST SERVICES
 * ============================================================
 */

export interface PastService extends ScheduledService {
  completedAt?: string | null;
  cancellation?: CancellationInfo | null;
}

/**
 * ============================================================
 * PAGINATION
 * ============================================================
 */

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * ============================================================
 * API RESPONSE TYPES
 * ============================================================
 */

export interface ServiceResponsesResponse {
  success: boolean;
  data: ServiceResponse[];
  pagination: Pagination;
}

export interface ScheduledServicesResponse {
  success: boolean;
  data: ScheduledService[];
  pagination: Pagination;
}

export interface PastServicesResponse {
  success: boolean;
  data: PastService[];
  pagination: Pagination;
}

/**
 * ============================================================
 * SERVICE RESPONSE PARAMS
 * ============================================================
 */

export interface ServiceResponseParams {
  providerId?: string;
  userId?: string;

  status?:
    | "accepted"
    | "rejected"
    | "cancelled_by_requestor"
    | "cancelled_by_provider";

  search?: string;

  page?: number;
  limit?: number;
}

/**
 * ============================================================
 * SCHEDULED SERVICES PARAMS
 * ============================================================
 */

export interface ScheduledServicesParams {
  providerId?: string;
  userId?: string;

  fromDate?: string;
  toDate?: string;

  page?: number;
  limit?: number;
}

/**
 * ============================================================
 * PAST SERVICES PARAMS
 * ============================================================
 */

export interface PastServicesParams {
  userId?: string;
  providerId?: string;

  status?: "completed" | "cancelled" | "no-show";

  fromDate?: string;
  toDate?: string;

  page?: number;
  limit?: number;
}

/**
 * ============================================================
 * ADMIN BOOKING API
 * ============================================================
 */

const ADMIN_API_BASE_URL = "https://api.senioramerica.us/api";

/**
 * ============================================================
 * GET ADMIN TOKEN
 * ============================================================
 */

const getAdminToken = (): string | null => {
  return localStorage.getItem("adminToken");
};

/**
 * ============================================================
 * BUILD QUERY STRING
 * ============================================================
 */
const buildQuery = <T extends object>(params: T): string => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  });

  return query.toString();
};

/**
 * ============================================================
 * ADMIN FETCH HELPER
 * ============================================================
 */

const adminFetch = async <T>(
  endpoint: string
): Promise<T> => {
  const token = getAdminToken();

  const response = await fetch(
    `${ADMIN_API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || "Failed to fetch admin data"
    );
  }

  return result as T;
};

/**
 * ============================================================
 * GET ADMIN SERVICE RESPONSES
 * ============================================================
 *
 * API:
 * GET /api/admin/service-responses
 *
 * Supported filters:
 * - providerId
 * - userId
 * - status
 * - search
 * - page
 * - limit
 *
 * Example:
 * /admin/service-responses?page=1&limit=20
 *
 * ============================================================
 */

export const getAdminServiceResponses =  async (
  params: ServiceResponseParams = {}
): Promise<ServiceResponsesResponse> => {
  const query = buildQuery(params);

  const endpoint = query
    ? `/admin/service-responses?${query}`
    : "/admin/service-responses";

  return adminFetch<ServiceResponsesResponse>(endpoint);
};

/**
 * ============================================================
 * GET ADMIN SCHEDULED SERVICES
 * ============================================================
 *
 * API:
 * GET /api/admin/scheduled-services
 *
 * Supported filters:
 * - providerId
 * - userId
 * - fromDate
 * - toDate
 * - page
 * - limit
 *
 * Example:
 * /admin/scheduled-services?page=1&limit=20
 *
 * ============================================================
 */

export const getAdminScheduledServices = async (
  params: ScheduledServicesParams = {}
): Promise<ScheduledServicesResponse> => {
  const query = buildQuery(params);

  const endpoint = query
    ? `/admin/scheduled-services?${query}`
    : "/admin/scheduled-services";

  return adminFetch<ScheduledServicesResponse>(endpoint);
};

/**
 * ============================================================
 * GET ADMIN PAST SERVICES
 * ============================================================
 *
 * API:
 * GET /api/admin/past-services
 *
 * Supported filters:
 * - userId
 * - providerId
 * - status
 * - fromDate
 * - toDate
 * - page
 * - limit
 *
 * Example:
 * /admin/past-services?page=15&limit=20
 *
 * ============================================================
 */

export const getAdminPastServices = async (
  params: PastServicesParams = {}
): Promise<PastServicesResponse> => {
  const query = buildQuery(params);

  const endpoint = query
    ? `/admin/past-services?${query}`
    : "/admin/past-services";

  return adminFetch<PastServicesResponse>(endpoint);
};