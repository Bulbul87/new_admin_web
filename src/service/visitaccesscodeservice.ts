
import { api } from "../service/api";

// ==================== USER ====================

export interface PopulatedUser {
  _id: string;
  requestorInfo?: {
    publicRequesterId?: string;
  };
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  address?: unknown;
  dateOfBirth?: string;
  gender?: string;
  providerInfo?: unknown;
}

// ==================== SERVICE ====================

export interface PopulatedService {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
}

// ==================== SCHEDULE ====================

export interface AccessCodeSchedule {
  date: string;
  fromTime: string;
  toTime: string;
  duration: number;
  tasks: string[];
  startUtc?: string;
  endUtc?: string;
  _id: string;
}

// ==================== PRICING ====================

export interface AccessCodePricing {
  servicePrice?: number;
  additionalCharges?: number;
  discount?: number;
  tax?: number;
  total?: number;
  platformCutBasisUsd?: number;
  platformCutFromRequestorUsd?: number;
  platformCutFromProviderUsd?: number;
  providerEstimatedPayoutUsd?: number;
}

// ==================== PAYMENT ====================

export interface AccessCodePayment {
  method?: string;
  status?: string;
  transactionId?: string;
  paidAt?: string;
  heldAt?: string;
  authorizationExpiresAt?: string;
}

// ==================== BOOKING ====================

export interface AccessCodeBooking {
  _id: string;

  user?: PopulatedUser | string;
  provider?: PopulatedUser | string;
  service?: PopulatedService | string;

  scheduledDate?: string;
  scheduledTime?: {
    start?: string;
    end?: string;
  };

  duration?: number;
  daySchedules?: AccessCodeSchedule[];

  schedulingTimeZone?: string;
  repeatDaily?: boolean;
  isMultiDaySeries?: boolean;

  location?: {
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    coordinates?: number[];
  };

  status?: string;
  pricing?: AccessCodePricing;
  payment?: AccessCodePayment;
  paymentHoldRequired?: boolean;
  specialInstructions?: string;
  tasks?: string[];

  completionRejection?: {
    reasons?: string[];
    comment?: string;
    rejectedAt?: string;
  };

  addTimeRequest?: {
    status?: string;
    additionalMinutes?: number;
    proposedEndTime?: string;
    reasonCode?: string;
    reason?: string;
    priceDelta?: number;
    requestedAt?: string;
    resolvedAt?: string;
    rejectionComment?: string;
  };

  providerAcceptedAt?: string;
  providerEnRouteAt?: string;
  providerArrivedAt?: string;
  providerStartedAt?: string;
  completionRequestedAt?: string;
  completedAt?: string;
  completionAutoApproved?: boolean;

  accessCode?: string;
  accessCodeUsed?: boolean;
  activeVisit?: string;

  createdAt?: string;
  updatedAt?: string;
}

// ==================== ACCESS CODE TYPES ====================

export type AccessCodeRecordType = "booking" | "visit";

export type AccessCodeStatus = "USED" | "ACTIVE" | "PENDING";

// ==================== ACCESS CODE RECORD ====================

export interface AccessCodeVisit {
  _id: string;

  booking?: AccessCodeBooking | string;
  user?: PopulatedUser | string;
  provider?: PopulatedUser | string;
  service?: PopulatedService | string;

  recordType: AccessCodeRecordType;
  bookingId?: string;
  requesterPublicId?: string;

  scheduledDate?: string;
  scheduledTime?: {
    start?: string;
    end?: string;
  };

  visitDate?: string;
  visitStartTime?: string;
  visitEndTime?: string;

  visitIndex?: number;
  fromTime?: string;
  toTime?: string;
  duration?: number;

  tasks?: string[];
  daySchedules?: AccessCodeSchedule[];

  status?: string;
  bookingStatus?: string;
  codeStatus: AccessCodeStatus;

  accessCode?: string;
  accessCodeUsed?: boolean;

  pricing?: AccessCodePricing;
  payment?: AccessCodePayment;
  paymentHoldRequired?: boolean;

  location?: AccessCodeBooking["location"];
  specialInstructions?: string;
  schedulingTimeZone?: string;
  isMultiDaySeries?: boolean;

  providerAcceptedAt?: string;
  providerEnRouteAt?: string;
  providerArrivedAt?: string;
  providerStartedAt?: string;
  completionRequestedAt?: string;
  completedAt?: string;
  completionAutoApproved?: boolean;

  completionRejection?: AccessCodeBooking["completionRejection"];
  addTimeRequest?: AccessCodeBooking["addTimeRequest"];

  createdAt?: string;
  updatedAt?: string;

  [key: string]: unknown;
}

// ==================== API RESPONSE TYPES ====================

export interface AccessCodeListResponse {
  success: boolean;
  data: AccessCodeVisit[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface AccessCodeDetailsResponse {
  success: boolean;
  data: AccessCodeVisit;
  message?: string;
}

interface AccessCodeApiPayload<T> {
  success?: boolean;
  data?: T;
  pagination?: AccessCodeListResponse["pagination"];
  message?: string;
}

// ==================== ENDPOINT ====================

const ACCESS_CODES_ENDPOINT = "/admin/access-codes";

// ==================== RESPONSE NORMALIZER ====================

function normalizeApiResponse<T>(
  response: T | AccessCodeApiPayload<T>
): AccessCodeApiPayload<T> {
  if (
    response !== null &&
    typeof response === "object" &&
    "success" in response
  ) {
    return response as AccessCodeApiPayload<T>;
  }

  // api.ts already unwraps data?.data || data.
  // Therefore, a successful list may arrive directly as an array.
  return {
    success: true,
    data: response as T,
  };
}

// ==================== GET ACCESS CODE DETAILS ====================

export const getAccessCodeVisit = async (
  id: string,
  type: AccessCodeRecordType = "booking"
): Promise<AccessCodeVisit> => {
  if (!id?.trim()) {
    throw new Error("Access code record ID is required.");
  }

  const endpoint =
    `${ACCESS_CODES_ENDPOINT}/${encodeURIComponent(id)}` +
    `?type=${encodeURIComponent(type)}`;

  try {
    const response = await api.get<
      AccessCodeDetailsResponse | AccessCodeVisit
    >(endpoint);

    const result = normalizeApiResponse<AccessCodeVisit>(
      response
    );

    if (result.success === false || !result.data) {
      throw new Error(
        result.message || "Failed to fetch access code details."
      );
    }

    return result.data;
  } catch (error) {
    console.error("Get access code details failed:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unable to fetch access code details.");
  }
};

// ==================== GET ALL ACCESS CODES ====================

export const getAllAccessCodeVisits = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: AccessCodeStatus | string;
}): Promise<AccessCodeListResponse> => {
  const query = new URLSearchParams();

  const page = Math.max(1, params?.page ?? 1);
  const limit = Math.max(1, Math.min(100, params?.limit ?? 20));

  query.set("page", String(page));
  query.set("limit", String(limit));

  const search = params?.search?.trim();

  if (search) {
    query.set("search", search);
  }

  const status = params?.status?.trim().toUpperCase();

  if (status && status !== "ALL") {
    query.set("status", status);
  }

  const endpoint =
    `${ACCESS_CODES_ENDPOINT}?${query.toString()}`;

  try {
    const response = await api.get<
      AccessCodeListResponse | AccessCodeVisit[]
    >(endpoint);

    const result = normalizeApiResponse<
      AccessCodeVisit[] | AccessCodeListResponse
    >(response);

    if (result.success === false) {
      throw new Error(
        result.message || "Failed to fetch access codes."
      );
    }

    // Some API responses return the records directly as an array.
    if (Array.isArray(result.data)) {
      return {
        success: true,
        data: result.data,
        pagination: result.pagination ?? {
          page,
          limit,
          total: result.data.length,
          totalPages: 1,
        },
        message: result.message,
      };
    }

    // Support an unwrapped response where the list object itself
    // contains data and pagination.
    const listResponse = result.data as
      | AccessCodeListResponse
      | undefined;

    if (
      listResponse &&
      typeof listResponse === "object" &&
      Array.isArray(listResponse.data)
    ) {
      return {
        success: listResponse.success ?? true,
        data: listResponse.data,
        pagination:
          listResponse.pagination ?? result.pagination,
        message: listResponse.message ?? result.message,
      };
    }

    throw new Error("Invalid access codes API response.");
  } catch (error) {
    console.error("Get all access codes failed:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unable to fetch access codes.");
  }
};
