
import { api } from "./api"; 

const BASE = "/admin/service-status-templates";

export type TemplateApp = "provider" | "requestor";

export interface ServiceStatusTemplate {
  _id: string;
  key: string;
  event: string;
  app: TemplateApp;
  title: string;
  message: string;
  subMessage?: string;
  buttonLabel?: string;
  openScreen: string;
  priority: number;
  sendPush: boolean;
  showBanner: boolean;
  isActive: boolean;
  pushTitle?: string;
  pushBody?: string;
  description?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StatusEvent {
  key: string;
  label?: string;
  name?: string;
  [key: string]: any;
}

export interface StatusVariable {
  name: string;
  label?: string;
  description?: string;
  [key: string]: any;
}

export interface StatusMeta {
  events: StatusEvent[];
  apps: string[];
  openScreens: Record<string, string[]> | any;
  variables: StatusVariable[] | string[];
}

export interface TemplatePayload {
  key: string;
  event: string;
  app: TemplateApp;
  title: string;
  message: string;
  subMessage: string;
  buttonLabel: string;
  openScreen: string;
  priority: number;
  sendPush: boolean;
  showBanner: boolean;
  isActive: boolean;
  pushTitle: string;
  pushBody: string;
  description: string;
}

export const getTemplateMeta = () =>
  api.get<any>(`${BASE}/meta`);

export const getTemplates = (filters?: {
  app?: TemplateApp | "";
  event?: string;
}) => {
  const params = new URLSearchParams();

  if (filters?.app) params.set("app", filters.app);
  if (filters?.event) params.set("event", filters.event);

  const query = params.toString();

  return api.get<any>(`${BASE}/${query ? `?${query}` : ""}`);
};

export const getTemplateById = (id: string) =>
  api.get<any>(`${BASE}/${encodeURIComponent(id)}`);

export const createTemplate = (payload: TemplatePayload) =>
  api.post<any>(BASE, payload);

export const updateTemplate = (
  id: string,
  payload: Partial<TemplatePayload>
) => api.put<any>(`${BASE}/${encodeURIComponent(id)}`, payload);

export const toggleTemplateActive = (
  id: string,
  isActive: boolean
) =>
  api.patch<any>(`${BASE}/${encodeURIComponent(id)}/active`, {
    isActive,
  });

export const deleteTemplate = (id: string) =>
  api.delete<any>(`${BASE}/${encodeURIComponent(id)}`);
