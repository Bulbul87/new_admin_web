import { api } from "./api";

// ==========================================
// TYPES
// ==========================================

export interface StateMilesRecord {
  _id: string;
  stateId: {
    _id: string;
    name: string;
    code: string;
  };
  miles: number;
  createdAt: string;
  updatedAt: string;
}

export interface StateMiles {
  stateId: string;
  name: string;
  code: string;
  miles: number;
  milesRecord: StateMilesRecord | null;
}

interface RawStateMilesResponse {
  success: boolean;
  message: string;
  total: number;
  configured: number;
  data: StateMiles[];
}

interface RawSetMilesResponse {
  success: boolean;
  message: string;
  data: {
    stateId: string;
    name: string;
    code: string;
    miles: number;
    milesRecord: StateMilesRecord;
  };
}

export interface StateMilesResponse {
  success: boolean;
  message: string;
  total: number;
  configured: number;
  data: StateMiles[];
}

export interface SetStateMilesResponse {
  success: boolean;
  message: string;
  data: RawSetMilesResponse["data"];
}

// ==========================================
// GET ALL STATES WITH MILES
// ==========================================

export const getStateMiles = async (): Promise<StateMilesResponse> => {
  const response = await api.get<
    StateMiles[] | RawStateMilesResponse
  >("/state-miles");

  // api.ts returns data.data || data
  // Handle both possible response structures

  if (Array.isArray(response)) {
    return {
      success: true,
      message: "State miles fetched successfully",
      total: response.length,
      configured: response.filter(
        (item) => item.milesRecord !== null
      ).length,
      data: response,
    };
  }

  return response;
};

// ==========================================
// ADD / UPDATE STATE MILES
// ==========================================

export const setStateMiles = async (
  stateId: string,
  miles: number
): Promise<SetStateMilesResponse> => {
  const response = await api.post<
    RawSetMilesResponse["data"] | RawSetMilesResponse
  >("/admin/state-miles/set", {
    stateId,
    miles,
  });

  // api.ts returns response.data directly
  if ("stateId" in response && "miles" in response) {
    return {
      success: true,
      message: "State miles saved successfully",
      data: response,
    };
  }

  return response;
};