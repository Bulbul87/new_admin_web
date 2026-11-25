
import { api } from "./api";

export interface License {
  _id: string;
  name: string;
  code: string;
  description: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LicensePayload {
  name?: string;
  code?: string;
  description?: string;
  status?: boolean;
}

export interface LicensePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface LicenseListResponse {
  success: boolean;
  message: string;
  data: License[];
  pagination: LicensePagination;
}

export interface LicenseListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const getLicenses = async (
  params: LicenseListParams = {}
): Promise<LicenseListResponse> => {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.status !== undefined && params.status !== "") {
    query.set("status", params.status);
  }

  query.set("page", String(params.page || 1));
  query.set("limit", String(params.limit || 10));

  return api.getFullResponse<LicenseListResponse>(
    `/admin/licenses?${query.toString()}`
  );
};

// ======================================
// CREATE LICENSE
// ======================================
export const createLicense = async (
  payload: LicensePayload
) => {
  return api.post<{
    success: boolean;
    message: string;
    data: License;
  }>("/admin/licenses", payload);
};

// ======================================
// UPDATE LICENSE
// ======================================
export const updateLicense = async (
  id: string,
  payload: Partial<LicensePayload>
) => {
  return api.put<{
    success: boolean;
    message: string;
    data: License;
  }>(`/admin/licenses/${id}`, payload);
};

// ======================================
// DELETE / DEACTIVATE LICENSE
// ======================================
export const deleteLicense = async (id: string) => {
  return api.delete<{
    success: boolean;
    message: string;
    data: License;
  }>(`/admin/licenses/${id}`);
};
