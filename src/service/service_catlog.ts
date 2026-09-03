import { api } from './api';

export type ServiceCareTier = 'simple' | 'advanced';

export interface ServiceSubService {
  _id?: string;
  name: string;
  description?: string;
  /** Grid icon key from catalog seed (e.g. "10"). */
  icon?: string;
  /** service_catalog servId (e.g. S1A). */
  servId?: string;
  price?: number;
  duration?: number;
  progressTimeMinutes?: number;
  isActive?: boolean;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  /** Flat once-per-booking fee from catalog (USD), in addition to hourly labor — see backend Service.serviceBookingFee */
  serviceBookingFee?: number;
  /** Nested duration from Mongo when present */
  duration?: { value: number; unit: string } | number;
  /** Requestor Home time progress bar (minutes) */
  progressTimeMinutes?: number;
  icon?: string;
  isActive: boolean;
  popularity?: number;
  tags?: string[];
  subCategory?: string;
  careTier?: ServiceCareTier;
  subServices?: ServiceSubService[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  name: string;
  serviceCount: number;
  averagePrice: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalServices?: number;
  totalResults?: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ServiceListResponse {
  services: Service[];
  pagination: PaginationInfo;
}

export interface ServiceSearchResponse extends ServiceListResponse {
  searchQuery: string;
}

export interface GetAllServicesParams {
  category?: string;
  isActive?: boolean;
  sortBy?: 'popularity' | 'price' | 'name' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchServicesParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string | string[];
  page?: number;
  limit?: number;
}

export interface ServiceCatalogItem {
  _id?: string;
  servId: string;
  name: string;
  description: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  price?: number;
  duration?: number;
  progressTimeMinutes?: number;
  operationalSubServiceId?: string;
}

export interface ServiceCatalogCategory {
  _id: string;
  categoryId: string;
  categoryName: string;
  sortOrder?: number;
  isActive?: boolean;
  basePrice?: number;
  serviceBookingFee?: number;
  progressTimeMinutes?: number;
  careTier?: string;
  category?: string;
  operationalServiceId?: string;
  services: ServiceCatalogItem[];
}

export interface ServiceCatalogResponse {
  categories: ServiceCatalogCategory[];
  totalCategories: number;
  totalServices: number;
}

class ServiceApi {
  /**
   * Get all services with filters and pagination
   */
  async getAllServices(params?: GetAllServicesParams): Promise<ServiceListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.category) queryParams.append('category', params.category);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.order) queryParams.append('order', params.order);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    const queryString = queryParams.toString();
    const endpoint = `/services${queryString ? `?${queryString}` : ''}`;

    return api.get<ServiceListResponse>(endpoint);
  }

  /** Senior Care catalog — categories, service names, descriptions, icons. */
  async getServiceCatalog(params?: { isActive?: boolean }): Promise<ServiceCatalogResponse> {
    const queryParams = new URLSearchParams();
    if (params?.isActive !== undefined) {
      queryParams.append('isActive', String(params.isActive));
    }
    const queryString = queryParams.toString();
    const endpoint = `/service-catalog${queryString ? `?${queryString}` : ''}`;
    return api.get<ServiceCatalogResponse>(endpoint);
  }


  // ==============================
// CATEGORY CRUD
// ==============================

async createServiceCategory(data: {
  categoryName: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  return api.post<ServiceCatalogCategory>('/service-catalog', data);
}

async updateServiceCategory(
  categoryId: string,
  data: {
    categoryName?: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  return api.put<ServiceCatalogCategory>(
    `/service-catalog/${categoryId}`,
    data
  );
}

async deleteServiceCategory(categoryId: string) {
  return api.delete<{ message: string }>(
    `/service-catalog/${categoryId}`
  );
}


// ==============================
// SERVICE CRUD
// ==============================

async addServiceToCategory(
  categoryId: string,
  data: {
    servId?: string | null;
    serviceName: string;
    description?: string;
    isActive?: boolean;
  }
) {
  return api.post<ServiceCatalogCategory>(
    `/service-catalog/${categoryId}/services`,
    data
  );
}

async updateServiceInCategory(
  categoryId: string,
  serviceId: string,
  data: {
    serviceName?: string;
    description?: string;
    servId?: string | null;
    isActive?: boolean;
  }
) {
  return api.put<ServiceCatalogCategory>(
    `/service-catalog/${categoryId}/services/${serviceId}`,
    data
  );
}

async deleteServiceFromCategory(
  categoryId: string,
  serviceId: string
) {
  return api.delete<ServiceCatalogCategory>(
    `/service-catalog/${categoryId}/services/${serviceId}`
  );
}

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<{ service: Service }> {
    return api.get<{ service: Service }>(`/services/${id}`);
  }

  /**
   * Search services
   */
  async searchServices(params: SearchServicesParams): Promise<ServiceSearchResponse> {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append('q', params.q);
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('minPrice', String(params.minPrice));
    if (params.maxPrice) queryParams.append('maxPrice', String(params.maxPrice));
    if (params.tags) {
      const tagsString = Array.isArray(params.tags) ? params.tags.join(',') : params.tags;
      queryParams.append('tags', tagsString);
    }
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));

    const queryString = queryParams.toString();
    const endpoint = `/services/search${queryString ? `?${queryString}` : ''}`;

    return api.get<ServiceSearchResponse>(endpoint);
  }

  /**
   * Get all service categories
   */
  async getCategories(): Promise<{ categories: ServiceCategory[] }> {
    return api.get<{ categories: ServiceCategory[] }>('/services/categories');
  }

  /**
   * Get popular services
   */
  async getPopularServices(limit: number = 10): Promise<{ services: Service[] }> {
    return api.get<{ services: Service[] }>(`/services/popular?limit=${limit}`);
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(
    category: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ServiceListResponse & { category: string }> {
    return api.get<ServiceListResponse & { category: string }>(
      `/services/category/${category}?page=${page}&limit=${limit}`
    );
  }



}

export const serviceApi = new ServiceApi();

