
// // import { api } from "./api";

// // const STATES_ENDPOINT = "/services/states";
// // const REGULATION_ENDPOINT = "/admin/state-service-regulations";

// // export interface RegulationState {
// //   _id: string;
// //   name: string;
// //   code?: string;
// // }

// // export interface RegulationCategory {
// //   categoryId: string;
// //   categoryName: string;
// //   category?: string | null;
// //   sortOrder?: number;
// //   regulationType: "regulated" | "non-regulated" | null;
// //   configured: boolean;
// // }

// // export interface RegulationSaveItem {
// //   categoryId: string;
// //   regulationType: "regulated" | "non-regulated";
// // }

// // // Fetch states
// // export const getRegulationStates = () => {
// //   return api.get<any>(STATES_ENDPOINT);
// // };

// // // Fetch state-wise categories and saved settings
// // export const getStateRegulations = (stateId: string) => {
// //   return api.get<any>(
// //     `${REGULATION_ENDPOINT}?stateId=${encodeURIComponent(stateId)}`
// //   );
// // };

// // // Save selected state's category regulation settings
// // export const saveStateRegulations = (
// //   stateId: string,
// //   regulations: RegulationSaveItem[]
// // ) => {
// //   return api.put<any>(REGULATION_ENDPOINT, {
// //     stateId,
// //     regulations,
// //   });
// // };



// import { api } from "./api";

// const STATES_ENDPOINT = "/services/states";
// const REGULATION_ENDPOINT = "/admin/state-service-regulations";
// const LICENSE_ENDPOINT = "/admin/licenses";

// // ==============================================
// // TYPES
// // ==============================================

// export interface RegulationState {
//   _id: string;
//   name: string;
//   code?: string;
// }

// // License Master
// export interface RegulationLicense {
//   _id: string;
//   name: string;
//   code: string;
//   description?: string;
//   status: boolean;
// }

// // Selected license with requirement setting
// export interface RegulationLicenseItem {
//   licenseId: string | RegulationLicense;
//   isRequired: boolean;
// }

// export interface RegulationCategory {
//   categoryId: string;
//   categoryName: string;
//   category?: string | null;
//   sortOrder?: number;

//   regulationType: "regulated" | "non-regulated" | null;

//   // New field
//   licenses: RegulationLicenseItem[];

//   configured: boolean;
// }

// export interface RegulationSaveLicenseItem {
//   licenseId: string;
//   isRequired: boolean;
// }

// export interface RegulationSaveItem {
//   categoryId: string;
//   regulationType: "regulated" | "non-regulated";

//   // New field
//   licenses: RegulationSaveLicenseItem[];
// }

// // ==============================================
// // FETCH STATES
// // ==============================================

// export const getRegulationStates = () => {
//   return api.get<any>(STATES_ENDPOINT);
// };

// // ==============================================
// // FETCH LICENSE MASTER
// // ==============================================

// export const getRegulationLicenses = () => {
//   return api.get<any>(LICENSE_ENDPOINT);
// };

// // ==============================================
// // FETCH STATE-WISE CATEGORIES AND SETTINGS
// // ==============================================

// export const getStateRegulations = (stateId: string) => {
//   return api.get<any>(
//     `${REGULATION_ENDPOINT}?stateId=${encodeURIComponent(stateId)}`
//   );
// };

// // ==============================================
// // SAVE SELECTED STATE CATEGORY REGULATIONS
// // ==============================================

// export const saveStateRegulations = (
//   stateId: string,
//   regulations: RegulationSaveItem[]
// ) => {
//   return api.put<any>(REGULATION_ENDPOINT, {
//     stateId,
//     regulations,
//   });
// };




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
  licenses: RegulationLicenseItem[];
  configured: boolean;
}

export interface RegulationSaveItem {
  categoryId: string;
  regulationType: "regulated" | "non-regulated";
}

export interface StateLicenseSaveItem {
  licenseId: string;
  isRequired: boolean;
}

// ==============================================
// FETCH STATES
// ==============================================

export const getRegulationStates = () => {
  return api.get<any>(STATES_ENDPOINT);
};

// ==============================================
// FETCH LICENSE MASTER
// ==============================================

export const getRegulationLicenses = () => {
  return api.get<any>(LICENSE_ENDPOINT);
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


