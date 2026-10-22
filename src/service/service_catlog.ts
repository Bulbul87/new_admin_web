import { api } from './api';

export type ServiceCareTier = 'simple' | 'advanced';

export interface ServiceSubService {
  _id?: string;
  name: string;
  description?: string;
  icon?: string;
  servId?: string;
  duration?: number;
  progressTimeMinutes?: number;
  isActive?: boolean;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  serviceBookingFee?: number;
  duration?: { value: number; unit: string } | number;
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
  tags?: string | string[];
  page?: number;
  limit?: number;
}



export interface ServiceCatalogCategory {
  _id: string;
  categoryId?: string;
  categoryName: string;
  category?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  careTier?: string;
  serviceBookingFee?: number;
  progressTimeMinutes?: number;
  duration?: {
    value: number;
    unit: "minutes" | "hours" | "days";
  };
  services?: ServiceCatalogItem[];
}

export interface ServiceCatalogItem {
  _id?: string;
  servId?: string | null;
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  duration?: number;
  progressTimeMinutes?: number;
  minHours?: number;
  maxHours?: number;
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
  categoryId?: string;
  categoryName: string;
  category?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  careTier?: string;
  serviceBookingFee?: number;
  progressTimeMinutes?: number;
  duration?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };
}) {
  return api.post<ServiceCatalogCategory>(
    '/service-catalog',
    data
  );
}

async updateServiceCategory(
  id: string,
  data: {
    categoryId?: string;
    categoryName?: string;
    category?: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
    careTier?: string;
    serviceBookingFee?: number;
    progressTimeMinutes?: number;
    duration?: {
      value: number;
      unit: 'minutes' | 'hours' | 'days';
    };
  }
) {
  return api.put<ServiceCatalogCategory>(
    `/service-catalog/${id}`,
    data
  );
}

async deleteServiceCategory(id: string) {
  return api.delete<{ message: string }>(
    `/service-catalog/${id}`
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
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
    duration?: number;
    progressTimeMinutes?: number;
    minHours?: number;
    maxHours?: number;
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
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
    duration?: number;
    progressTimeMinutes?: number;
    minHours?: number;
    maxHours?: number;
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

