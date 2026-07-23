import { api } from "./api";

// ======================
// TYPES
// ======================

export interface StateType {
  _id: string;
  name: string;
  code: string;
}

export interface CityType {
  _id: string;
  name: string;
  stateId: StateType;
}

export interface ServiceItem {
  _id: string;
  servId: string;
  name: string;
  description: string;
  icon: string;
    // Future fields
  duration?: string;
  tooltip?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ServiceCategory {
  _id: string;
  categoryId: string;
  categoryName: string;
  sortOrder: number;
  isActive: boolean;
  services: ServiceItem[];
}

interface ServiceCatalogResponse {
  success: boolean;
  message: string;
  count: number;
  data: ServiceCategory[];
}

// ======================
// STATES
// ======================

export const getStates = async (): Promise<StateType[]> => {
  return await api.get<StateType[]>("/services/states");
};

// ======================
// CITIES
// ======================

export const getCitiesByState = async (
  stateId: string
): Promise<CityType[]> => {
  const cities = await api.get<CityType[]>("/services/cities");

  if (!stateId) {
    return cities;
  }

  return cities.filter((city) => city.stateId?._id === stateId);
};

export const getServiceCatalog = async (): Promise<ServiceCategory[]> => {
  return await api.get<ServiceCategory[]>("/services/service-catalog");
};