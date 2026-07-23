




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
// Service Catalog
// ======================================================

export interface ServiceItem {
  _id: string;
  servId: string;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ServiceCatalogItem {
  _id: string;
  categoryId: string;
  categoryName: string;
  sortOrder: number;
  isActive: boolean;
  services: ServiceItem[];
}
// ======================================================
// Pricing Rule
// ======================================================

export interface PricingRule {

  _id: string;

  stateId: StateRef;

  cityId: CityRef;

  // NOTE: the API returns `serviceId` as a plain business code string
  // (e.g. "S1A"), not a populated object. `categoryId` is similarly a
  // business code string (e.g. "S1"). Newer records also include
  // `categoryName` / `serviceName` directly on the rule; older/legacy
  // records may have these blank, in which case they need to be
  // resolved via the service catalog instead.
  serviceId: string;

  categoryId?: string;

  categoryName?: string;

  serviceName?: string;

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

  categoryId?: string;

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
// Safe Array Extractor
// ======================================================
// Handles both possible shapes coming back from `api.get`:
//   1) The raw array itself                -> [...]
//   2) A wrapped response object           -> { success, count, data: [...] }
// This prevents `undefined.map(...)` crashes in the UI no matter
// how the underlying `api` wrapper is implemented.
function extractArray<T>(response: any): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

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

  return services;

}

export function getChildServices(
  categories: ServiceCatalogItem[],
  categoryId: string
): ServiceItem[] {

  const category = categories.find(
    item => item._id === categoryId
  );

  return category?.services || [];

}

// ======================================================
// GET STATES
// ======================================================

export async function getStates(): Promise<StateOption[]> {
  const response = await api.get<any>(ENDPOINTS.states);

  console.log("States API =", response);

  return extractArray<StateOption>(response);
}

// ======================================================
// GET CITIES
// ======================================================

export async function getCities(): Promise<CityOption[]> {
  const response = await api.get<any>(ENDPOINTS.cities);

  console.log("Cities API =", response);

  return extractArray<CityOption>(response);
}

// ======================================================
// GET SERVICE CATALOG
// ======================================================

export async function getServiceCatalog(): Promise<ServiceCatalogItem[]> {
  const response = await api.get<any>(ENDPOINTS.serviceCatalog);

  console.log("Service Catalog API =", response);

  return extractArray<ServiceCatalogItem>(response);
}

// ======================================================
// GET ALL PRICING RULES
// ======================================================

export async function getPricingRules(): Promise<PricingRule[]> {
  const response = await api.get<any>(ENDPOINTS.pricingRules);

  console.log("Pricing Rules API =", response);

  return extractArray<PricingRule>(response);
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
  categoryId?: string;
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
  categoryId,
  serviceId,
  requesterPrice,
  providerPrice,
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
if (!categoryId) {

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
  categoryId,
  requesterPrice,
  providerPrice,

    };

  }

  // -------------------------------
  // CASE 4 : SINGLE SERVICE
  // -------------------------------

  return {

     level: "service",
  stateId,
  cityId,
  categoryId,
  serviceId,
  requesterPrice,
  providerPrice,

  };

}

// ======================================================
// Utility Helpers
// ======================================================





export function getServiceName(
  categories: ServiceCatalogItem[],
  serviceId: string
): string {

  for (const category of categories) {

    const service = category.services.find(
      item => item._id === serviceId
    );

    if (service) {
      return service.name;
    }

  }

  return "";

}

export function getCategoryName(
  categories: ServiceCatalogItem[],
  categoryId: string
): string {

  return (
    categories.find(
      category => category._id === categoryId
    )?.categoryName ?? ""
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

export function hasCategorySelected(
  categoryId?: string
): boolean {
  return Boolean(categoryId);
}

export function hasServiceSelected(
  serviceId?: string
): boolean {

  return Boolean(serviceId);

}