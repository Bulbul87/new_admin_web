import { api } from "../service/api";

export interface AccessCodeVisit {
  _id: string;

  booking: {
    _id: string;
  user?: PopulatedUser | string; 
  provider?: PopulatedUser | string; 
  service?: PopulatedService | string;

    scheduledDate: string;

    scheduledTime?: {
      start?: string;
      end?: string;
    };

    duration?: number;

    daySchedules?: Array<{
      date: string;
      fromTime: string;
      toTime: string;
      duration: number;
      tasks: string[];
      startUtc?: string;
      endUtc?: string;
      _id: string;
    }>;

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

    pricing?: {
      servicePrice?: number;
      additionalCharges?: number;
      discount?: number;
      tax?: number;
      total?: number;
      platformCutBasisUsd?: number;
      platformCutFromRequestorUsd?: number;
      platformCutFromProviderUsd?: number;
      providerEstimatedPayoutUsd?: number;
    };

    payment?: {
      method?: string;
      status?: string;
      transactionId?: string;
      paidAt?: string;
      heldAt?: string;
      authorizationExpiresAt?: string;
    };

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
  };

  visitIndex: number;

  scheduledDate: string;
  fromTime: string;
  toTime: string;
  duration: number;

  tasks: string[];

  startUtc?: string;
  endUtc?: string;

  status: string;

  pricing?: {
    servicePrice?: number;
    additionalCharges?: number;
    discount?: number;
    tax?: number;
    total?: number;
    platformCutBasisUsd?: number;
    platformCutFromRequestorUsd?: number;
    platformCutFromProviderUsd?: number;
    providerEstimatedPayoutUsd?: number;
  };

  payment?: {
    method?: string;
    status?: string;
    transactionId?: string;
    paidAt?: string;
    heldAt?: string;
    authorizationExpiresAt?: string;
  };

  paymentHoldRequired?: boolean;

  accessCode?: string;
  accessCodeUsed?: boolean;

  providerEnRouteAt?: string;
  providerArrivedAt?: string;
  providerStartedAt?: string;
  completionRequestedAt?: string;
  completedAt?: string;

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

  createdAt?: string;
  updatedAt?: string;
}

export interface PopulatedUser { _id: string; firstName?: string; lastName?: string; email?: string; }

export interface PopulatedService { _id: string; name?: string; }


// =====================================================
// GET SINGLE ACCESS CODE VISIT
// =====================================================

export const getAccessCodeVisit = async (
  id: string
): Promise<AccessCodeVisit> => {
  const response = await api.get<AccessCodeVisit>(
    `/admin/access-codes/${id}`
  );

  return response;
};


// =====================================================
// GET ALL ACCESS CODE VISITS
// =====================================================

export interface AccessCodeListResponse {
  success?: boolean;
  data?: AccessCodeVisit[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  totalPages: number;
  };
  message?: string;
}



export const getAllAccessCodeVisits = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<AccessCodeListResponse> => {
  const token = localStorage.getItem("adminToken");

  const query = new URLSearchParams();

  if (params?.page) {
    query.append("page", String(params.page));
  }

  if (params?.limit) {
    query.append("limit", String(params.limit));
  }

  if (params?.search) {
    query.append("search", params.search);
  }

  if (params?.status) {
    query.append("status", params.status);
  }

  const response = await fetch(
    `'https://api.senioramerica.us/api/admin/access-codes?${query.toString()}`,
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

  const data = await response.json();

  console.log("🚀 RAW ACCESS CODE RESPONSE:", data);


console.log(
  "RAW FIRST VISIT:",
  data?.data?.[0]
);

console.log(
  "RAW BOOKING:",
  data?.data?.[0]?.booking
);

console.log(
  "RAW USER:",
  data?.data?.[0]?.booking?.user
);

console.log(
  "RAW PROVIDER:",
  data?.data?.[0]?.booking?.provider
);

console.log(
  "RAW SERVICE:",
  data?.data?.[0]?.booking?.service
);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch access code visits");
  }

  return data;
};
