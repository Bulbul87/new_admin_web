/**
 * pricingService.ts
 *
 * Service Layer for Pricing Management
 */

import { api } from "../service/api";

// ================================
// Types
// ================================

export interface StateOption {
  _id: string;
  name: string;
}

export interface StateRef {
  _id: string;
  name: string;
  code?: string;
}

export interface CityOption {
  _id: string;
  name: string;
  stateId: string | StateRef;
}

export interface ServiceCatalogItem {
  _id: string;
  name: string;
  category?: string;
}

export interface PricingRule {
  _id: string;
  stateId: string;
  cityId: string;
  serviceId: string;
  requesterPrice: number;
  providerPrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingRulePayload {
  stateId: string;
  cityId: string;
  serviceId: string;
  requesterPrice: number;
  providerPrice: number;
}

// ================================
// Endpoints
// ================================

const ENDPOINTS = {
  states: "/services/states",
  cities: "/services/cities",
  serviceCatalog: "/services/service-catalog",
  pricingRules: "/pricing-rules",

  pricingRuleById: (id: string) => `/pricing-rules/${id}`,
};

// ================================
// Helpers
// ================================

export function getStateIdFromCity(city: CityOption): string {
  return typeof city.stateId === "string"
    ? city.stateId
    : city.stateId._id;
}

// ================================
// APIs
// ================================

export async function getStates(): Promise<StateOption[]> {
  return await api.get<StateOption[]>(ENDPOINTS.states);
}

export async function getCities(): Promise<CityOption[]> {
  return await api.get<CityOption[]>(ENDPOINTS.cities);
}

export async function getServiceCatalog(): Promise<ServiceCatalogItem[]> {
  return await api.get<ServiceCatalogItem[]>(ENDPOINTS.serviceCatalog);
}

export async function getPricingRules(): Promise<PricingRule[]> {
  return await api.get<PricingRule[]>(ENDPOINTS.pricingRules);
}

export async function createPricingRule(
  payload: PricingRulePayload
): Promise<PricingRule> {
  return await api.post<PricingRule>(
    ENDPOINTS.pricingRules,
    payload
  );
}

export async function updatePricingRule(
  id: string,
  payload: PricingRulePayload
): Promise<PricingRule> {
  return await api.put<PricingRule>(
    ENDPOINTS.pricingRuleById(id),
    payload
  );
}

export async function deletePricingRule(id: string): Promise<void> {
  await api.delete<void>(ENDPOINTS.pricingRuleById(id));
}

export function findMatchingRule(
  rules: PricingRule[],
  stateId: string,
  cityId: string,
  serviceId: string
): PricingRule | undefined {
  return rules.find(
    (rule) =>
      rule.stateId === stateId &&
      rule.cityId === cityId &&
      rule.serviceId === serviceId
  );
}