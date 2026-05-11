import { api } from "../service/api";

export interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  duration?: number | { value: number; unit: string };
  icon?: string;
  isActive: boolean;
  popularity?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceListResponse {
  services: Service[];
  pagination: {
    currentPage: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class ServiceApi {

  // ✅ GET ALL
  async getAllServices(params?: any): Promise<ServiceListResponse> {
    const query = new URLSearchParams(params).toString();
    return api.get(`/services${query ? `?${query}` : ""}`);
  }

  // ✅ GET BY ID
  async getServiceById(id: string) {
    return api.get(`/services/${id}`);
  }

  // ✅ SEARCH
  async searchServices(params: any) {
    const query = new URLSearchParams(params).toString();
    return api.get(`/services/search?${query}`);
  }

  // ✅ CREATE
  async createService(data: Partial<Service>) {
    return api.post("/services", data);
  }

  // ✅ UPDATE
  async updateService(id: string, data: Partial<Service>) {
    return api.put(`/services/${id}`, data);
  }

  // ✅ DELETE
  async deleteService(id: string) {
    return api.delete(`/services/${id}`);
  }

  // ✅ CATEGORIES
  async getCategories() {
    return api.get("/services/categories");
  }

  // ✅ POPULAR
  async getPopularServices(limit: number = 10) {
    return api.get(`/services/popular?limit=${limit}`);
  }
}

export const serviceApi = new ServiceApi();