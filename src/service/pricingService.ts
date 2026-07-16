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
export interface PricingRuleResponse {
  success: boolean;
  count: number;
  data: PricingRule[];
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



export interface ParentServiceRef {
  _id: string;
  name: string;
  code?: string;
}

export interface ServiceCatalogItem {
  _id: string;
  code: string;
  name: string;
  category?: string;

  // null => Parent Service
  // object => Child Service
  parentId: ParentServiceRef | null;
}

export interface PricingRule {
  _id: string;

  stateId: StateRef;
  cityId: {
    _id: string;
    name: string;
  };

  serviceId: {
    _id: string;
    name: string;
  };

  requesterPrice: number;
  providerPrice: number;

  status?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface PricingRulePayload {
  stateId: string;
  cityId: string;

  // Child service id
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

  pricingRuleById: (id: string) =>
    `/pricing-rules/${id}`,
};


// ================================
// Helpers
// ================================

export function getStateIdFromCity(
  city: CityOption
): string {

  return typeof city.stateId === "string"
    ? city.stateId
    : city.stateId._id;
}



// ================================
// Service Hierarchy Helpers
// ================================


/**
 * Get only parent services
 *
 * Example:
 * Cleaning
 * Plumbing
 * Electrician
 */
export function getParentServices(
  services: ServiceCatalogItem[]
): ServiceCatalogItem[] {
  return services.filter(
    service => service.parentId === null
  );
}



/**
 * Get child services of selected parent
 *
 * Example:
 *
 * Cleaning
 *   |
 *   |-- Home Cleaning
 *   |-- Deep Cleaning
 */
export function getChildServices(
  services: ServiceCatalogItem[],
  parentId: string
): ServiceCatalogItem[] {

  return services.filter(
    service =>
      service.parentId?._id === parentId
  );

}



// ================================
// APIs
// ================================


export async function getStates()
: Promise<StateOption[]> {

  return await api.get<StateOption[]>(
    ENDPOINTS.states
  );
}



export async function getCities()
: Promise<CityOption[]> {

  return await api.get<CityOption[]>(
    ENDPOINTS.cities
  );
}



export async function getServiceCatalog()
: Promise<ServiceCatalogItem[]> {

  return await api.get<ServiceCatalogItem[]>(
    ENDPOINTS.serviceCatalog
  );
}



export async function getPricingRules(): Promise<PricingRule[]> {
  const response = await api.get<PricingRuleResponse>(
    ENDPOINTS.pricingRules
  );

  console.log("Pricing Response:", response);

  if (!response) return [];

  if (Array.isArray(response)) {
    return response as PricingRule[];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
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
  id:string,
  payload:PricingRulePayload
): Promise<PricingRule> {


  return await api.put<PricingRule>(
    ENDPOINTS.pricingRuleById(id),
    payload
  );
}




export async function deletePricingRule(
  id:string
): Promise<void> {


  await api.delete<void>(
    ENDPOINTS.pricingRuleById(id)
  );
}



// ================================
// Find Existing Pricing Rule
// ================================


export function findMatchingRule(
  rules: PricingRule[] = [],
  stateId: string,
  cityId: string,
  serviceId: string
): PricingRule | undefined {

  if (!Array.isArray(rules)) {
    return undefined;
  }

  return rules.find((rule) => {
    return (
      rule?.stateId?._id === stateId &&
      rule?.cityId?._id === cityId &&
      rule?.serviceId?._id === serviceId
    );
  });

}