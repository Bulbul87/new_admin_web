
import { api } from "./api";

const STATES_ENDPOINT = "/services/states";
const REGULATION_ENDPOINT = "/admin/state-service-regulations";
const LICENSE_ENDPOINT = "/admin/licenses";

// ==============================================
// TYPES
// ==============================================

export interface RegulationState {
  _id: string;
  name: string;
  code?: string;
}

export interface RegulationLicense {
  _id: string;
  name: string;
  code: string;
  description?: string;
  status: boolean;
}

export interface RegulationLicenseItem {
  licenseId: string | RegulationLicense;
  isRequired: boolean;
}

export interface RegulationCategory {
  categoryId: string;
  categoryName: string;
  category?: string | null;
  sortOrder?: number;
  regulationType: "regulated" | "non-regulated" | null;
  configured: boolean;
}

// State-level licenses
export interface StateLicenseSaveItem {
  licenseId: string;
  isRequired: boolean;
}

// GET response
export interface StateRegulationResponse {
  stateId: string;
  stateName: string;
  categories: RegulationCategory[];
  licenses: RegulationLicenseItem[];
}

export interface RegulationSaveItem {
  categoryId: string;
  regulationType: "regulated" | "non-regulated";
}

// ==============================================
// FETCH STATES
// ==============================================

export const getRegulationStates = () => {
  return api.get<any>(STATES_ENDPOINT);
};

// ==============================================
// FETCH ALL LICENSE MASTER
// ==============================================

export const getRegulationLicenses = () => {
  return api.get<any>(`${LICENSE_ENDPOINT}?page=1&limit=100`);
};

// ==============================================
// FETCH STATE-WISE CATEGORIES + LICENSE SETTINGS
// ==============================================

export const getStateRegulations = (stateId: string) => {
  return api.get<any>(
    `${REGULATION_ENDPOINT}?stateId=${encodeURIComponent(stateId)}`
  );
};

// ==============================================
// SAVE CATEGORY + STATE LICENSE SETTINGS
// ==============================================

export const saveStateRegulations = (
  stateId: string,
  regulations: RegulationSaveItem[],
  licenses: StateLicenseSaveItem[]
) => {
  return api.put<any>(REGULATION_ENDPOINT, {
    stateId,
    regulations,
    licenses,
  });
};
