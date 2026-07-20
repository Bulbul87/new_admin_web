/**
 * pricingService.ts
 *
 * Smart Pricing Service
 * Compatible with:
 * GET  /pricing-rules
 * PUT  /pricing-rules/update
 */

import { api } from "../service/api";

// ======================================================
// State
// ======================================================

export interface StateOption {
  _id: string;
  name: string;
  code?: string;
}

export interface StateRef {
  _id: string;
  name: string;
  code?: string;
}

// ======================================================
// City
// ======================================================

export interface CityOption {
  _id: string;
  name: string;
  stateId: string | StateRef;
}

export interface CityRef {
  _id: string;
  name: string;
}

// ======================================================
// Service
// ======================================================

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

  /**
   * null = Parent Service
   * object = Child Service
   */
  parentId: ParentServiceRef | null;
}

// ======================================================
// Pricing Rule
// ======================================================

export interface PricingRule {

  _id: string;

  stateId: StateRef;

  cityId: CityRef;

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

// ======================================================
// Smart Pricing Level
// ======================================================

export type PricingLevel =
  | "state"
  | "city"
  | "parent"
  | "service";

  // ======================================================
// Smart Pricing Payload
// ======================================================

export interface SmartPricingPayload {

  level: PricingLevel;

  stateId: string;

  cityId?: string;

  parentServiceId?: string;

  serviceId?: string;

  requesterPrice: number;

  providerPrice: number;

}

// ======================================================
// API Responses
// ======================================================

export interface PricingRuleResponse {

  success: boolean;

  count: number;

  data: PricingRule[];

}

export interface SmartPricingResponse {

  success: boolean;

  message: string;

  data?: PricingRule;

  result?: unknown;

  totalCities?: number;

  totalServices?: number;

  totalRecords?: number;

  updatedServices?: number;

}

// ======================================================
// API Endpoints
// ======================================================

const ENDPOINTS = {

  states: "/services/states",

  cities: "/services/cities",

  serviceCatalog: "/services/service-catalog",

  pricingRules: "/pricing-rules",

  smartPricingUpdate: "/pricing-rules/update",

};

// ======================================================
// Helper Functions
// ======================================================

export function getStateIdFromCity(
  city: CityOption
): string {

  return typeof city.stateId === "string"
    ? city.stateId
    : city.stateId._id;

}

// ======================================================
// Service Hierarchy Helpers
// ======================================================

export function getParentServices(
  services: ServiceCatalogItem[]
): ServiceCatalogItem[] {

  return services.filter(
    service => service.parentId === null
  );

}

export function getChildServices(
  services: ServiceCatalogItem[],
  parentServiceId: string
): ServiceCatalogItem[] {

  return services.filter(
    service => service.parentId?._id === parentServiceId
  );

}

// ======================================================
// GET STATES
// ======================================================

export async function getStates(): Promise<StateOption[]> {

  return await api.get<StateOption[]>(
    ENDPOINTS.states
  );

}

// ======================================================
// GET CITIES
// ======================================================

export async function getCities(): Promise<CityOption[]> {

  return await api.get<CityOption[]>(
    ENDPOINTS.cities
  );

}

// ======================================================
// GET SERVICE CATALOG
// ======================================================

export async function getServiceCatalog(): Promise<ServiceCatalogItem[]> {

  return await api.get<ServiceCatalogItem[]>(
    ENDPOINTS.serviceCatalog
  );

}

// ======================================================
// GET ALL PRICING RULES
// ======================================================

export async function getPricingRules(): Promise<PricingRule[]> {

  const response = await api.get<any>(
    ENDPOINTS.pricingRules
  );

  console.log("Pricing Response =", response);

  return response;

}

// ======================================================
// SMART PRICING UPDATE
// PUT /pricing-rules/update
// ======================================================

export async function updatePricing(
  payload: SmartPricingPayload
): Promise<SmartPricingResponse> {

  return await api.put<SmartPricingResponse>(
    ENDPOINTS.smartPricingUpdate,
    payload
  );

}

// ======================================================
// BUILD SMART PAYLOAD
// ======================================================

interface BuildPayloadParams {

  stateId: string;

  cityId?: string;

  parentServiceId?: string;

  serviceId?: string;

  requesterPrice: number;

  providerPrice: number;

}

export function buildPricingPayload(
  params: BuildPayloadParams
): SmartPricingPayload {

  const {

    stateId,

    cityId,

    parentServiceId,

    serviceId,

    requesterPrice,

    providerPrice

  } = params;

  // -------------------------------
  // CASE 1 : STATE
  // -------------------------------

  if (!cityId) {

    return {

      level: "state",

      stateId,

      requesterPrice,

      providerPrice

    };

  }

  // -------------------------------
  // CASE 2 : CITY
  // -------------------------------

  if (!parentServiceId) {

    return {

      level: "city",

      stateId,

      cityId,

      requesterPrice,

      providerPrice

    };

  }

  // -------------------------------
  // CASE 3 : PARENT SERVICE
  // -------------------------------

  if (!serviceId) {

    return {

      level: "parent",

      stateId,

      cityId,

      parentServiceId,

      requesterPrice,

      providerPrice

    };

  }

  // -------------------------------
  // CASE 4 : SINGLE SERVICE
  // -------------------------------

  return {

    level: "service",

    stateId,

    cityId,

    parentServiceId,

    serviceId,

    requesterPrice,

    providerPrice

  };

}

// ======================================================
// Utility Helpers
// ======================================================

export function isParentService(
  service: ServiceCatalogItem
): boolean {

  return service.parentId === null;

}

export function isChildService(
  service: ServiceCatalogItem
): boolean {

  return service.parentId !== null;

}

export function getServiceName(
  services: ServiceCatalogItem[],
  serviceId: string
): string {

  return (
    services.find(
      service => service._id === serviceId
    )?.name ?? ""
  );

}

export function getParentServiceName(
  services: ServiceCatalogItem[],
  parentServiceId: string
): string {

  return (
    services.find(
      service => service._id === parentServiceId
    )?.name ?? ""
  );

}

export function getCityName(
  cities: CityOption[],
  cityId: string
): string {

  return (
    cities.find(
      city => city._id === cityId
    )?.name ?? ""
  );

}

export function getStateName(
  states: StateOption[],
  stateId: string
): string {

  return (
    states.find(
      state => state._id === stateId
    )?.name ?? ""
  );

}

// ======================================================
// Selection Helpers
// ======================================================

export function hasStateSelected(
  stateId?: string
): boolean {

  return Boolean(stateId);

}

export function hasCitySelected(
  cityId?: string
): boolean {

  return Boolean(cityId);

}

export function hasParentSelected(
  parentServiceId?: string
): boolean {

  return Boolean(parentServiceId);

}

export function hasServiceSelected(
  serviceId?: string
): boolean {

  return Boolean(serviceId);

}