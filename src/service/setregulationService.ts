
import { api } from "./api";

const STATES_ENDPOINT = "/services/states";
const REGULATION_ENDPOINT = "/admin/state-service-regulations";

export interface RegulationState {
  _id: string;
  name: string;
  code?: string;
}

export interface RegulationCategory {
  categoryId: string;
  categoryName: string;
  category?: string | null;
  sortOrder?: number;
  regulationType: "regulated" | "non-regulated" | null;
  configured: boolean;
}

export interface RegulationSaveItem {
  categoryId: string;
  regulationType: "regulated" | "non-regulated";
}

// Fetch states
export const getRegulationStates = () => {
  return api.get<any>(STATES_ENDPOINT);
};

// Fetch state-wise categories and saved settings
export const getStateRegulations = (stateId: string) => {
  return api.get<any>(
    `${REGULATION_ENDPOINT}?stateId=${encodeURIComponent(stateId)}`
  );
};

// Save selected state's category regulation settings
export const saveStateRegulations = (
  stateId: string,
  regulations: RegulationSaveItem[]
) => {
  return api.put<any>(REGULATION_ENDPOINT, {
    stateId,
    regulations,
  });
};
