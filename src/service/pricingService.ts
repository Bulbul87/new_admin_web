
import { api } from "../service/api";

// ======================================================
// STATE
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
// CITY
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
// SERVICE CATALOG
// ======================================================

export interface ServiceItem {
  _id: string;

  // Business service ID
  servId: string;

  // Backend ServiceCatalog field
  name: string;

  description: string;

  icon?: string;

  sortOrder: number;

  isActive: boolean;

  price?: number;

  duration?: number;

  progressTimeMinutes?: number;
}

export interface ServiceCatalogItem {
  _id: string;

  // Business category ID
  categoryId: string;

  categoryName: string;

  sortOrder: number;

  isActive: boolean;

  category?: string;

  careTier?: "simple" | "advanced";

  basePrice?: number;

  serviceBookingFee?: number;

  progressTimeMinutes?: number;

  duration?: {
    value?: number;
    unit?: "minutes" | "hours" | "days";
  };

  icon?: string;

  services: ServiceItem[];
}

// ======================================================
// PRICING RULE
// ======================================================

export interface PricingRule {
  _id: string;

  stateId: StateRef;

  cityId: CityRef;

  // Business service ID
  serviceId: string;

  // Business category ID
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
// SMART PRICING LEVEL
// ======================================================

export type PricingLevel =
  | "state"
  | "city"
  | "parent"
  | "service";

// ======================================================
// SMART PRICING PAYLOAD
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
// API RESPONSES
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
// ENDPOINTS
// ======================================================

const ENDPOINTS = {
  states: "/services/states",

  cities: "/services/cities",

  serviceCatalog: "/service-catalog",

  pricingRules: "/pricing-rules",

  smartPricingUpdate: "/pricing-rules/update",
};

// ======================================================
// SAFE ARRAY EXTRACTOR
// ======================================================

function extractArray<T>(response: unknown): T[] {
  // api.ts already returns data.data when backend response
  // contains a data property.

  if (Array.isArray(response)) {
    return response;
  }

  if (
    response &&
    typeof response === "object" &&
    Array.isArray((response as any).data)
  ) {
    return (response as any).data;
  }

  return [];
}

// ======================================================
// STATE ID FROM CITY
// ======================================================

export function getStateIdFromCity(
  city: CityOption
): string {
  if (typeof city.stateId === "string") {
    return city.stateId;
  }

  return city.stateId?._id || "";
}

// ======================================================
// GET PARENT SERVICES / CATEGORIES
// ======================================================

export function getParentServices(
  categories: ServiceCatalogItem[]
): ServiceCatalogItem[] {
  return categories || [];
}

// ======================================================
// GET CHILD SERVICES OF CATEGORY
// ======================================================

export function getChildServices(
  categories: ServiceCatalogItem[],
  categoryId: string
): ServiceItem[] {
  const category = (categories || []).find(
    item => item.categoryId === categoryId
  );

  return category?.services || [];
}

// ======================================================
// GET ALL ACTIVE CHILD SERVICES
// ======================================================

export function getAllServiceChildren(
  categories: ServiceCatalogItem[]
): Array<{
  categoryId: string;
  serviceId: string;
  name: string;
}> {
  const services: Array<{
    categoryId: string;
    serviceId: string;
    name: string;
  }> = [];

  for (const category of categories || []) {
    const activeServices = (category.services || []).filter(
      service => service.isActive !== false
    );

    services.push(
      ...activeServices.map(service => ({
        categoryId: category.categoryId,
        serviceId: service.servId,
        name: service.name,
      }))
    );
  }

  return services;
}

// ======================================================
// GET STATES
// ======================================================

export async function getStates(): Promise<StateOption[]> {
  const response = await api.get<any>(
    ENDPOINTS.states
  );

  console.log("States API =", response);

  return extractArray<StateOption>(response);
}

// ======================================================
// GET CITIES
// ======================================================

export async function getCities(): Promise<CityOption[]> {
  const response = await api.get<any>(
    ENDPOINTS.cities
  );

  console.log("Cities API =", response);

  return extractArray<CityOption>(response);
}

// ======================================================
// GET CITIES BY STATE
// ======================================================

export async function getCitiesByState(
  stateId: string,
  cities?: CityOption[]
): Promise<CityOption[]> {
  const allCities =
    cities || (await getCities());

  return allCities.filter(city => {
    const cityStateId =
      typeof city.stateId === "string"
        ? city.stateId
        : city.stateId?._id;

    return cityStateId === stateId;
  });
}

// ======================================================
// GET SERVICE CATALOG
// ======================================================

export async function getServiceCatalog(): Promise<ServiceCatalogItem[]> {
  const response = await api.get<any>(
    ENDPOINTS.serviceCatalog
  );

  console.log("Service Catalog API =", response);

  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.categories)) {
    return response.categories;
  }

  if (
    response &&
    response.data &&
    Array.isArray(response.data.categories)
  ) {
    return response.data.categories;
  }

  return [];
}

// ======================================================
// GET ALL PRICING RULES
// ======================================================

export async function getPricingRules(): Promise<
  PricingRule[]
> {
  const response = await api.get<any>(
    ENDPOINTS.pricingRules
  );

  console.log(
    "Pricing Rules API =",
    response
  );

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
// BUILD SMART PRICING PAYLOAD
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

  // ====================================================
  // CASE 1: STATE LEVEL
  // ====================================================

  if (!cityId) {
    return {
      level: "state",

      stateId,

      requesterPrice,

      providerPrice,
    };
  }

  // ====================================================
  // CASE 2: CITY LEVEL
  // ====================================================

  if (!categoryId) {
    return {
      level: "city",

      stateId,

      cityId,

      requesterPrice,

      providerPrice,
    };
  }

  // ====================================================
  // CASE 3: CATEGORY / PARENT LEVEL
  // ====================================================

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

  // ====================================================
  // CASE 4: SINGLE SERVICE LEVEL
  // ====================================================

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
// GET SERVICE NAME
// IMPORTANT:
// PricingRule.serviceId stores servId,
// NOT ServiceCatalog subdocument _id.
// ======================================================

export function getServiceName(
  categories: ServiceCatalogItem[],
  serviceId: string
): string {
  for (const category of categories || []) {
    const service = (category.services || []).find(
      item => item.servId === serviceId
    );

    if (service) {
      return service.name;
    }
  }

  return "";
}

// ======================================================
// GET CATEGORY NAME
// IMPORTANT:
// PricingRule.categoryId stores categoryId,
// NOT MongoDB _id.
// ======================================================

export function getCategoryName(
  categories: ServiceCatalogItem[],
  categoryId: string
): string {
  return (
    (categories || []).find(
      category =>
        category.categoryId === categoryId
    )?.categoryName || ""
  );
}

// ======================================================
// GET CITY NAME
// ======================================================

export function getCityName(
  cities: CityOption[],
  cityId: string
): string {
  return (
    (cities || []).find(
      city => city._id === cityId
    )?.name || ""
  );
}

// ======================================================
// GET STATE NAME
// ======================================================

export function getStateName(
  states: StateOption[],
  stateId: string
): string {
  return (
    (states || []).find(
      state => state._id === stateId
    )?.name || ""
  );
}

// ======================================================
// FIND CATEGORY
// ======================================================

export function findCategory(
  categories: ServiceCatalogItem[],
  categoryId: string
): ServiceCatalogItem | undefined {
  return (categories || []).find(
    category =>
      category.categoryId === categoryId
  );
}

// ======================================================
// FIND SERVICE
// ======================================================

export function findService(
  categories: ServiceCatalogItem[],
  serviceId: string
): ServiceItem | undefined {
  for (const category of categories || []) {
    const service = (category.services || []).find(
      item => item.servId === serviceId
    );

    if (service) {
      return service;
    }
  }

  return undefined;
}

// ======================================================
// SELECTION HELPERS
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

