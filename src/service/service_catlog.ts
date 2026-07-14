import { api } from "./api";

// ======================
// TYPES
// ======================

export interface StateType {
  _id: string;
  name: string;
  code?: string;
}

export interface CityType {
  _id: string;
  name: string;
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
  const res: any = await api.get("/states");
  return res?.data || [];
};

// ======================
// CITIES
// ======================

export const getCitiesByState = async (
  stateId: string
): Promise<CityType[]> => {
  const res: any = await api.get(`/cities/state/${stateId}`);
  return res?.data || [];
};

// ======================
// SERVICE CATALOG
// ======================

export const getServiceCatalog = async (): Promise<ServiceCatalog[]> => {
  const res: any = await api.get("/serviceCatalog");
  return res?.data || [];
};