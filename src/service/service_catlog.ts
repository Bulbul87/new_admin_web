
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

// ==============================
// SERVICE CATALOG TYPES
// ==============================

export interface ServiceCatalogCategory {
  _id: string;
  categoryId?: string;
  categoryName: string;
  icon?: string;
  isActive?: boolean;
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
  price?: number;
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

// ==============================
// CATEGORY REQUEST TYPES
// ==============================

export interface CreateServiceCategoryData {
  categoryId: string;
  categoryName: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateServiceCategoryData {
  categoryName?: string;
  icon?: string;
  isActive?: boolean;
}

// ==============================
// SERVICE REQUEST TYPES
// ==============================

export interface CreateCatalogServiceData {
  servId: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  duration?: number;
  minHours?: number;
  maxHours?: number;
  progressTimeMinutes?: number;
}

export interface UpdateCatalogServiceData {
  servId?: string;
  name?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
  duration?: number;
  minHours?: number;
  maxHours?: number;
  progressTimeMinutes?: number;
}

class ServiceApi {
  // ==============================
  // GET ALL SERVICES
  // ==============================

  async getAllServices(
    params?: GetAllServicesParams
  ): Promise<ServiceListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.category) {
      queryParams.append('category', params.category);
    }

    if (params?.isActive !== undefined) {
      queryParams.append('isActive', String(params.isActive));
    }

    if (params?.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }

    if (params?.order) {
      queryParams.append('order', params.order);
    }

    if (params?.page) {
      queryParams.append('page', String(params.page));
    }

    if (params?.limit) {
      queryParams.append('limit', String(params.limit));
    }

    const queryString = queryParams.toString();
    const endpoint = `/services${queryString ? `?${queryString}` : ''}`;

    return api.get<ServiceListResponse>(endpoint);
  }

  // ==============================
  // GET SERVICE CATALOG
  // ==============================

  async getServiceCatalog(
    params?: { isActive?: boolean }
  ): Promise<ServiceCatalogResponse> {
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

  // Add Category
  async createServiceCategory(
    data: CreateServiceCategoryData
  ): Promise<ServiceCatalogCategory> {
    return api.post<ServiceCatalogCategory>(
      '/service-catalog/categories',
      data
    );
  }

  // Update Category
  // categoryId example: S1
  async updateServiceCategory(
    categoryId: string,
    data: UpdateServiceCategoryData
  ): Promise<ServiceCatalogCategory> {
    return api.put<ServiceCatalogCategory>(
      `/service-catalog/categories/${encodeURIComponent(categoryId)}`,
      data
    );
  }

  // Delete Category
  // Category must have no services according to the backend controller
  async deleteServiceCategory(
    categoryId: string
  ): Promise<{ message: string }> {
    return api.delete<{ message: string }>(
      `/service-catalog/categories/${encodeURIComponent(categoryId)}`
    );
  }

  // ==============================
  // SERVICE CRUD
  // ==============================

  // Add Service to a Category
  async addServiceToCategory(
    categoryId: string,
    data: CreateCatalogServiceData
  ): Promise<ServiceCatalogCategory> {
    return api.post<ServiceCatalogCategory>(
      `/service-catalog/categories/${encodeURIComponent(categoryId)}/services`,
      data
    );
  }

  // Update Service
  // serviceId must be the embedded service MongoDB _id
  async updateServiceInCategory(
    categoryId: string,
    serviceId: string,
    data: UpdateCatalogServiceData
  ): Promise<ServiceCatalogCategory> {
    return api.put<ServiceCatalogCategory>(
      `/service-catalog/categories/${encodeURIComponent(categoryId)}/services/${encodeURIComponent(serviceId)}`,
      data
    );
  }

  // Delete Service
  async deleteServiceFromCategory(
    categoryId: string,
    serviceId: string
  ): Promise<{ message: string }> {
    return api.delete<{ message: string }>(
      `/service-catalog/categories/${encodeURIComponent(categoryId)}/services/${encodeURIComponent(serviceId)}`
    );
  }

  // ==============================
  // GET SERVICE BY ID
  // ==============================

  async getServiceById(
    id: string
  ): Promise<{ service: Service }> {
    return api.get<{ service: Service }>(`/services/${id}`);
  }

  // ==============================
  // SEARCH SERVICES
  // ==============================

  async searchServices(
    params: SearchServicesParams
  ): Promise<ServiceSearchResponse> {
    const queryParams = new URLSearchParams();

    if (params.q) {
      queryParams.append('q', params.q);
    }

    if (params.category) {
      queryParams.append('category', params.category);
    }

    if (params.tags) {
      const tagsString = Array.isArray(params.tags)
        ? params.tags.join(',')
        : params.tags;

      queryParams.append('tags', tagsString);
    }

    if (params.page) {
      queryParams.append('page', String(params.page));
    }

    if (params.limit) {
      queryParams.append('limit', String(params.limit));
    }

    const queryString = queryParams.toString();
    const endpoint = `/services/search${queryString ? `?${queryString}` : ''}`;

    return api.get<ServiceSearchResponse>(endpoint);
  }

  // ==============================
  // GET SERVICE CATEGORIES
  // ==============================

  async getCategories(): Promise<{ categories: ServiceCategory[] }> {
    return api.get<{ categories: ServiceCategory[] }>(
      '/services/categories'
    );
  }

  // ==============================
  // GET POPULAR SERVICES
  // ==============================

  async getPopularServices(
    limit: number = 10
  ): Promise<{ services: Service[] }> {
    return api.get<{ services: Service[] }>(
      `/services/popular?limit=${limit}`
    );
  }

  // ==============================
  // GET SERVICES BY CATEGORY
  // ==============================

  async getServicesByCategory(
    category: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ServiceListResponse & { category: string }> {
    return api.get<ServiceListResponse & { category: string }>(
      `/services/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`
    );
  }
}

export const serviceApi = new ServiceApi();


