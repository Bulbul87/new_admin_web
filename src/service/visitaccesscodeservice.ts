import { api } from "../service/api";

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

export interface PopulatedService {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
}

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

export interface AccessCodePayment {
  method?: string;
  status?: string;
  transactionId?: string;
  paidAt?: string;
  heldAt?: string;
  authorizationExpiresAt?: string;
}

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

export type AccessCodeRecordType = "booking" | "visit";
export type AccessCodeStatus = "USED" | "ACTIVE" | "PENDING";

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

const ACCESS_CODES_ENDPOINT = "/admin/access-codes";

export const getAccessCodeVisit = async (
  id: string,
  type: AccessCodeRecordType = "booking"
): Promise<AccessCodeVisit> => {
  const response = await api.get<AccessCodeDetailsResponse>(
    `${ACCESS_CODES_ENDPOINT}/${id}?type=${type}`
  );

  if (!response?.success || !response?.data) {
    const message =
      typeof response?.message === "string"
        ? response.message
        : "Failed to fetch access code details";

    throw new Error(message);
  }

  return response.data;
};

export const getAllAccessCodeVisits = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: AccessCodeStatus | string;
}): Promise<AccessCodeListResponse> => {
  const query = new URLSearchParams();

  query.set("page", String(params?.page ?? 1));
  query.set("limit", String(params?.limit ?? 20));

  if (params?.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params?.status && params.status !== "all") {
    query.set("status", params.status.toUpperCase());
  }

  const response = await api.get<AccessCodeListResponse>(
    `${ACCESS_CODES_ENDPOINT}?${query.toString()}`
  );

  if (!response?.success || !Array.isArray(response.data)) {
    const message =
      typeof response?.message === "string"
        ? response.message
        : "Failed to fetch access codes";

    throw new Error(message);
  }

  return response;
};