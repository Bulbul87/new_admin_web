
import { api } from "../service/api";
import { getAllProviders,type User } from "../service/admin.service";

// ==============================
// TYPES
// ==============================

export interface Caregiver {
  _id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  providerInfo?: {
    publicProviderId?: string;
    [key: string]: any;
  };
}

export interface CaregiverService {
  _id?: string;
  servId: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  globalIsActive: boolean;
  isAvailable: boolean;
  price?: number;
  duration?: number;
  progressTimeMinutes?: number;
  minHours?: number;
  maxHours?: number;
}

export interface CaregiverServiceCategory {
  categoryId: string;
  categoryName: string;
  sortOrder?: number;
  globalIsActive: boolean;
  isActive: boolean;
  services: CaregiverService[];
}

export interface CaregiverServiceResponse {
  caregiver: {
    _id: string;
    name: string;
    email: string;
    publicCaregiverId: string;
  };
  data: CaregiverServiceCategory[];
}

export interface UpdateCaregiverCategoryPayload {
  categoryId: string;
  isActive: boolean;
}

// ==============================
// GET ALL CAREGIVERS
// ==============================

export const getCaregivers = async (): Promise<Caregiver[]> => {
  const response = await getAllProviders(1, 1000);

  return (response.users || []).filter(
    (provider: User) => provider.role === "provider"
  ) as Caregiver[];
};

// ==============================
// GET CAREGIVER CATEGORIES
// ==============================

export const getCaregiverServiceCategories = async (
  caregiverId: string
): Promise<CaregiverServiceResponse> => {
  return api.get<CaregiverServiceResponse>(
    `/admin/caregiver-service-categories/${encodeURIComponent(
      caregiverId
    )}`
  );
};

// ==============================
// UPDATE CAREGIVER CATEGORIES
// ==============================

export const updateCaregiverServiceCategories = async (
  caregiverId: string,
  categories: UpdateCaregiverCategoryPayload[]
) => {
  return api.put(
    `/admin/caregiver-service-categories/${encodeURIComponent(
      caregiverId
    )}`,
    { categories }
  );
};
