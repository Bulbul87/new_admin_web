// api.ts (React Web)
const BASE_URL = 'https://api.senioramerica.us/api';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

class ApiService {
  // ✅ Get token from localStorage (WEB)
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('adminToken');

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    try {
      const headers = this.getAuthHeaders();

      const config: RequestInit = {
        method: options.method || 'GET',
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      if (options.body) {
        config.body = JSON.stringify(options.body);
      }

      console.log(`🌐 API: ${config.method} ${BASE_URL}${endpoint}`);

      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }

      return data?.data || data;

    } catch (error) {
      console.log('❌ API ERROR:', error);
      throw error;
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();