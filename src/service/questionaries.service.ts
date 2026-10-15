import { api } from "./api";

// ==================== TYPES ====================

export type CareNeedsFieldKind =
  | "text"
  | "checkbox"
  | "radio"
  | "yesNo"
  | "yesNoDontKnow"
  | "address"
  | "milesSlider"
  | "remarks";

export interface CareNeedsField {
  _id?: string;
  id: string;
  kind: CareNeedsFieldKind;
  label: string;
  hint?: string;
  placeholder?: string;
  columns?: number;
  options?: string[];
  exclusiveOptions?: string[];
  required?: boolean;
  minMiles?: number;
  maxMiles?: number;
  defaultMiles?: number;
  midMiles?: number;
}

export interface CareNeedsTemplate {
  _id: string;
  categoryId: string;
  categoryName: string;
  serviceId: string;
  serviceName: string;
  matchKeys: string[];
  parentTitle: string;
  serviceTitle: string;
  serviceNote?: string;
  intro?: string;
  fields: CareNeedsField[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareNeedsTemplatePayload {
  categoryId: string;
  serviceId: string;
  matchKeys?: string[];
  parentTitle?: string;
  serviceTitle?: string;
  serviceNote?: string;
  intro?: string;
  fields?: CareNeedsField[];
  isActive?: boolean;
}

export interface CareNeedsTemplateFilters {
  categoryId?: string;
  serviceId?: string;
  isActive?: boolean;
  search?: string;
}

export interface CareNeedsTemplatesResponse {
  success: boolean;
  count: number;
  data: CareNeedsTemplate[];
}

export interface CareNeedsTemplateResponse {
  success: boolean;
  message?: string;
  data: CareNeedsTemplate;
}

interface ApiMessageResponse {
  success: boolean;
  message: string;
}

// ==================== CONSTANTS ====================

const BASE_PATH = "/admin/questionaries";

// ==================== QUERY STRING ====================

const buildQueryString = (
  filters: CareNeedsTemplateFilters
): string => {
  const params = new URLSearchParams();

  if (filters.categoryId) {
    params.set("categoryId", filters.categoryId);
  }

  if (filters.serviceId) {
    params.set("serviceId", filters.serviceId);
  }

  if (filters.isActive !== undefined) {
    params.set("isActive", String(filters.isActive));
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  const query = params.toString();

  return query ? `?${query}` : "";
};

// ==================== GET ALL TEMPLATES ====================

export const getCareNeedsTemplates = async (
  filters: CareNeedsTemplateFilters = {}
): Promise<CareNeedsTemplatesResponse> => {
  const result = await api.get<CareNeedsTemplatesResponse>(
    `${BASE_PATH}${buildQueryString(filters)}`
  );

  return result;
};

// ==================== GET TEMPLATE BY ID ====================

export const getCareNeedsTemplateById = async (
  id: string
): Promise<CareNeedsTemplate> => {
  const result = await api.get<CareNeedsTemplate>(
    `${BASE_PATH}/${encodeURIComponent(id)}`
  );

  return result;
};

// ==================== GET TEMPLATE BY SERVICE ====================

export const getCareNeedsTemplateByService = async (
  categoryId: string,
  serviceId: string
): Promise<CareNeedsTemplate> => {
  const result = await api.get<CareNeedsTemplate>(
    `${BASE_PATH}/by-service/${encodeURIComponent(categoryId)}/${encodeURIComponent(serviceId)}`
  );

  return result;
};

// ==================== CREATE TEMPLATE ====================

export const createCareNeedsTemplate = async (
  payload: CareNeedsTemplatePayload
): Promise<CareNeedsTemplate> => {
  const result = await api.post<CareNeedsTemplate>(
    BASE_PATH,
    payload
  );

  return result;
};

// ==================== UPDATE TEMPLATE ====================

export const updateCareNeedsTemplate = async (
  id: string,
  payload: Partial<CareNeedsTemplatePayload>
): Promise<CareNeedsTemplate> => {
  const result = await api.put<CareNeedsTemplate>(
    `${BASE_PATH}/${encodeURIComponent(id)}`,
    payload
  );

  return result;
};

// ==================== DELETE TEMPLATE ====================

export const deleteCareNeedsTemplate = async (
  id: string
): Promise<ApiMessageResponse> => {
  const result = await api.delete<ApiMessageResponse>(
    `${BASE_PATH}/${encodeURIComponent(id)}`
  );

  return result;
};

// ==================== ADD QUESTION/FIELD ====================

export const addCareNeedsField = async (
  templateId: string,
  field: CareNeedsField
): Promise<CareNeedsTemplate> => {
  const result = await api.post<CareNeedsTemplate>(
    `${BASE_PATH}/${encodeURIComponent(templateId)}/fields`,
    field
  );

  return result;
};

// ==================== UPDATE QUESTION/FIELD ====================

export const updateCareNeedsField = async (
  templateId: string,
  fieldId: string,
  payload: Partial<CareNeedsField>
): Promise<CareNeedsTemplate> => {
  const result = await api.put<CareNeedsTemplate>(
    `${BASE_PATH}/${encodeURIComponent(templateId)}/fields/${encodeURIComponent(fieldId)}`,
    payload
  );

  return result;
};

// ==================== DELETE QUESTION/FIELD ====================

export const deleteCareNeedsField = async (
  templateId: string,
  fieldId: string
): Promise<CareNeedsTemplate> => {
  const result = await api.delete<CareNeedsTemplate>(
    `${BASE_PATH}/${encodeURIComponent(templateId)}/fields/${encodeURIComponent(fieldId)}`
  );

  return result;
};