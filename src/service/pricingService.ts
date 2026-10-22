
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

  Tax: number;

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

  Tax: number;
}

// ======================================================
// API RESPONSES
// ======================================================

// export interface PricingRuleResponse {
//   success: boolean;
//   count: number;
//   data: PricingRule[];
// }
export interface PricingRuleResponse {
  success: boolean;
  count: number;
  data: PricingRule[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

  filterPricing: "/pricing-rules/filter",

  searchPricing: "/pricing-rules/search",
};

// ======================================================
// SAFE ARRAY EXTRACTOR
// ======================================================

function extractArray<T>(response: unknown): T[] {


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


/* ======================================================
   ADD CITY
   POST /services/cities
====================================================== */

export async function createCity(
  name: string,
  stateId: string
): Promise<CityOption> {
  const response = await api.post<any>(
    ENDPOINTS.cities,
    {
      name,
      stateId,
    }
  );

  return response.data;
}

/* ======================================================
   UPDATE CITY NAME ONLY
   PUT /services/cities/:id
====================================================== */

export async function updateCityName(
  cityId: string,
  name: string
): Promise<CityOption> {
  const response = await api.put<any>(
    `${ENDPOINTS.cities}/${cityId}`,
    {
      name,
    }
  );

  return response.data;
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

// export async function getPricingRules(): Promise<
//   PricingRule[]
// > {
//   const response = await api.get<any>(
//     ENDPOINTS.pricingRules
//   );

//   console.log(
//     "Pricing Rules API =",
//     response
//   );

//   return extractArray<PricingRule>(response);
// }

export async function getPricingRules(
  page: number = 1,
  limit: number = 20
): Promise<PricingRuleResponse> {
  const response = await fetch(
    `https://api.senioramerica.us/api/pricing-rules?page=${page}&limit=${limit}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('adminToken')
          ? {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            }
          : {}),
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch pricing rules');
  }

  return {
    success: result.success ?? true,
    count: result.count ?? 0,
    data: Array.isArray(result.data) ? result.data : [],
    pagination: {
      page: result.pagination?.page ?? page,
      limit: result.pagination?.limit ?? limit,
      total: result.pagination?.total ?? 0,
      totalPages: result.pagination?.totalPages ?? 0,
    },
  };
}


export interface PricingQueryParams {
  stateId?: string;
  cityId?: string;
  categoryId?: string;
  serviceId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

async function fetchPricingQuery(
  endpoint: string,
  params: PricingQueryParams
): Promise<PricingRuleResponse> {
  const query = new URLSearchParams();

  if (params.stateId) query.set("stateId", params.stateId);
  if (params.cityId) query.set("cityId", params.cityId);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.serviceId) query.set("serviceId", params.serviceId);
  if (params.search?.trim()) query.set("search", params.search.trim());

  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));

  const token = localStorage.getItem("adminToken");

  const response = await fetch(
    `https://api.senioramerica.us/api${endpoint}?${query.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch pricing records");
  }

  return {
    success: result.success ?? true,
    count: result.count ?? 0,
    data: Array.isArray(result.data) ? result.data : [],
    pagination: {
      page: result.pagination?.page ?? params.page ?? 1,
      limit: result.pagination?.limit ?? params.limit ?? 20,
      total: result.pagination?.total ?? 0,
      totalPages: result.pagination?.totalPages ?? 0,
    },
  };
}

// New API: selected dropdown filters
export function filterPricingRules(
  params: PricingQueryParams
): Promise<PricingRuleResponse> {
  return fetchPricingQuery(ENDPOINTS.filterPricing, params);
}

// New API: search text + optional dropdown filters
export function searchPricingRules(
  params: PricingQueryParams
): Promise<PricingRuleResponse> {
  return fetchPricingQuery(ENDPOINTS.searchPricing, params);
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

   Tax: number;
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
    Tax,
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

      Tax
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

      Tax
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

      Tax
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

     Tax
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

