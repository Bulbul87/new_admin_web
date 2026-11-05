
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
  address?: any;

  // Public IDs
  publicProviderId?: string | null;
  publicRequesterId?: string | null;

  // Requester information
  requestorInfo?: {
    publicRequesterId?: string | null;
    [key: string]: any;
  } | null;

  // Provider information
  providerInfo?: {
    publicProviderId?: string | null;
    [key: string]: any;
  } | null;

  // Preserve all additional User fields
  [key: string]: any;
}

export interface ServiceInfo {
  _id: string;

  // Public Service ID
  publicServiceId?: string | null;

  name?: string;
  description?: string;
  category?: string;
  icon?: string;
  price?: number;
  duration?: number;

  [key: string]: any;
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

  [key: string]: any;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
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

  [key: string]: any;
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

  [key: string]: any;
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

  // Public IDs
  publicServiceId?: string | null;
  publicProviderId?: string | null;
  publicRequesterId?: string | null;

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

  [key: string]: any;
}

/**
 * ============================================================
 * BOOKING
 * ============================================================
 */

export interface Booking {
  _id: string;

  // Internal MongoDB booking ID
  bookingId: string;

  // Public IDs
  publicServiceId?: string | null;
  publicProviderId?: string | null;
  publicRequesterId?: string | null;

  // Original booking references
  user?: Person | null;
  provider?: Person | null;
  service?: ServiceInfo | null;

  requestor?: Person | null;

  // Requester information
  requestorInfo?: {
    publicRequesterId?: string | null;
    [key: string]: any;
  } | null;

  scheduledDate?: string | null;
  scheduledTime?: ScheduledTime | null;

  status: string;

  duration?: number | null;

  payment?: any;
  location?: any;
  cancellation?: CancellationInfo | null;

  daySchedules?: DaySchedule[];

  visits?: BookingVisit[];
  allVisits?: BookingVisit[];

  isMultiDay?: boolean;
  isMultiDaySeries?: boolean;

  createdAt?: string;
  updatedAt?: string;

  // All other Booking database fields
  [key: string]: any;
}

export interface BookingDetails extends Booking {
  visits: BookingVisit[];
}

/**
 * ============================================================
 * SCHEDULED SERVICES
 * ============================================================
 */

export interface ScheduledService extends Booking {
  requestor: Person | null;
  provider: Person | null;
  service: ServiceInfo | null;

  isMultiDay: boolean;

  daySchedules: DaySchedule[];

  visits: BookingVisit[];
  allVisits?: BookingVisit[];

  upcomingDaySchedules?: DaySchedule[];

  nextScheduledDate?: string | null;
  hasUpcomingVisits?: boolean;
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
 * BROADCAST RECORDS
 * ============================================================
 */

export interface ProviderDecline {
  provider: Person | null;
  declinedAt?: string | null;

  [key: string]: any;
}

export interface BroadcastRecord {
  _id: string;

  user?: Person | null;
  service?: ServiceInfo | null;

  providerDeclines?: ProviderDecline[];

  scheduledDate?: string | null;
  scheduledTime?: ScheduledTime | null;

  status?: string;

  createdAt?: string;
  updatedAt?: string;

  [key: string]: any;
}

/**
 * ============================================================
 * API RESPONSE TYPES
 * ============================================================
 */

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export interface ServiceResponsesResponse
  extends ApiResponse<ServiceResponse[]> {
  pagination: Pagination;
}

export interface ScheduledServicesResponse
  extends ApiResponse<ScheduledService[]> {
  pagination: Pagination;
}

export interface PastServicesResponse
  extends ApiResponse<PastService[]> {
  pagination: Pagination;
}

export interface AdminBookingsResponse
  extends ApiResponse<Booking[]> {
  pagination: Pagination;
}

export interface BookingDetailsResponse
  extends ApiResponse<BookingDetails> { }

export interface BroadcastsResponse
  extends ApiResponse<BroadcastRecord[]> {
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

  status?: ServiceResponseType;

  search?: string;

  page?: number;
  limit?: number;
}

/**
 * ============================================================
 * ADMIN BOOKINGS PARAMS
 * ============================================================
 */

export interface AdminBookingsParams {
  userId?: string;
  providerId?: string;
  serviceId?: string;

  status?: string;
  paymentStatus?: string;

  search?: string;

  fromDate?: string;
  toDate?: string;

  sort?: "asc" | "desc";

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
  serviceId?: string;

  status?: string;

  fromDate?: string;
  toDate?: string;

  search?: string;

  period?: "today" | "tomorrow" | "week";

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
  serviceId?: string;

  status?: "completed" | "cancelled" | "no-show";

  fromDate?: string;
  toDate?: string;

  search?: string;

  page?: number;
  limit?: number;
}

/**
 * ============================================================
 * BROADCAST PARAMS
 * ============================================================
 */

export interface BroadcastParams {
  userId?: string;
  serviceId?: string;

  status?: string;

  search?: string;

  fromDate?: string;
  toDate?: string;

  sort?: "asc" | "desc";

  page?: number;
  limit?: number;
}

/**
 * ============================================================
 * ADMIN BOOKING API CONFIGURATION
 * ============================================================
 */

const ADMIN_API_BASE_URL = "https://api.senioramerica.us/api";

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
 * 1. GET ADMIN SERVICE RESPONSES
 * ============================================================
 *
 * GET /api/admin/service-responses
 *
 * Filters:
 * providerId, userId, status, search, page, limit
 */

export const getAdminServiceResponses = async (
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
 * 2. GET ALL ADMIN BOOKINGS
 * ============================================================
 *
 * GET /api/admin/bookings
 *
 * Filters:
 * userId, providerId, serviceId, status,
 * paymentStatus, search, fromDate, toDate,
 * sort, page, limit
 */

export const getAdminBookings = async (
  params: AdminBookingsParams = {}
): Promise<AdminBookingsResponse> => {
  const query = buildQuery(params);

  const endpoint = query
    ? `/admin/bookings?${query}`
    : "/admin/bookings";

  return adminFetch<AdminBookingsResponse>(endpoint);
};

/**
 * ============================================================
 * 3. GET ADMIN BOOKING DETAILS BY ID
 * ============================================================
 *
 * GET /api/admin/bookings/:id
 */

export const getAdminBookingById = async (
  id: string
): Promise<BookingDetailsResponse> => {
  if (!id) {
    throw new Error("Booking ID is required");
  }

  return adminFetch<BookingDetailsResponse>(
    `/admin/bookings/${encodeURIComponent(id)}`
  );
};

/**
 * ============================================================
 * 4. GET ADMIN SCHEDULED SERVICES
 * ============================================================
 *
 * GET /api/admin/scheduled-services
 *
 * Filters:
 * providerId, userId, serviceId, status,
 * fromDate, toDate, search, period, page, limit
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
 * 5. GET ADMIN PAST SERVICES
 * ============================================================
 *
 * GET /api/admin/past-services
 *
 * Filters:
 * userId, providerId, serviceId, status,
 * fromDate, toDate, search, page, limit
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

/**
 * ============================================================
 * 6. GET ALL ADMIN BROADCAST RECORDS
 * ============================================================
 *
 * GET /api/admin/broadcasts
 *
 * By default all historical broadcast records are fetched.
 *
 * Filters:
 * userId, serviceId, status, search,
 * fromDate, toDate, sort, page, limit
 */

export const getAdminBroadcasts = async (
  params: BroadcastParams = {}
): Promise<BroadcastsResponse> => {
  const query = buildQuery(params);

  const endpoint = query
    ? `/admin/broadcasts?${query}`
    : "/admin/broadcasts";

  return adminFetch<BroadcastsResponse>(endpoint);
};
