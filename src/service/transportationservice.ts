
import { api } from "./api"; 

export interface TransportationState {
  stateId: string;
  stateName: string;
  stateCode: string;
  distance1: number | null;
  distance2: number | null;
  d1_hours: number | null;
  d2_hours: number | null;
  price_permiles: number | null;
  configured: boolean;
  recordId?: string | null;
  updatedAt?: string | null;
}

export interface TransportationDistancePayload {
  stateId: string;
  distance1: number;
  distance2: number;
  d1_hours: number;
  d2_hours: number;
  price_permiles: number;

}

const ENDPOINT = "/admin/state-transportation-distance";

export const getAllStateDistances = () =>
  api.get<any>(ENDPOINT);

export const getStateDistanceById = (stateId: string) =>
  api.get<any>(`${ENDPOINT}/${encodeURIComponent(stateId)}`);

export const createStateDistance = (
  payload: TransportationDistancePayload
) => api.post<any>(ENDPOINT, payload);

export const updateStateDistance = (
  stateId: string,
  payload: Omit<TransportationDistancePayload, "stateId">
) => api.put<any>(`${ENDPOINT}/${encodeURIComponent(stateId)}`, payload);
