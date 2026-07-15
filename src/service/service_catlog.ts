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

export interface ChildService {
  _id: string;
  name: string;
}

export interface ServiceCatalog {
  _id: string;
  name: string;
  children: ChildService[];
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

// ======================
// SERVICE CATALOG
// ======================

export const getServiceCatalog = async (): Promise<ServiceCatalog[]> => {
  return await api.get<ServiceCatalog[]>("/services/service-catalog");
};