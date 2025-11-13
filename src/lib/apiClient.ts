// API client for LSBA Vercel Functions
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, errorData.error || 'Request failed');
  }

  return response.json();
}

export const apiClient = {
  // Simple HTTP methods for direct endpoint access
  async get(endpoint: string): Promise<any> {
    return apiRequest(endpoint);
  },

  async put(endpoint: string, data: any): Promise<any> {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async post(endpoint: string, data: any): Promise<any> {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Generic CRUD operations
  async create<T>(containerName: string, item: T & { id?: string }): Promise<T> {
    return apiRequest(`/api/${containerName}`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async read<T = any>(containerName: string, id: string): Promise<T | null> {
    try {
      return await apiRequest(`/api/${containerName}/${id}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async update<T = any>(containerName: string, id: string, item: Partial<T>): Promise<T> {
    return apiRequest(`/api/${containerName}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  },

  async delete(containerName: string, id: string): Promise<void> {
    await apiRequest(`/api/${containerName}/${id}`, {
      method: 'DELETE',
    });
  },

  async list<T = any>(containerName: string, maxItemCount?: number): Promise<T[]> {
    const params = maxItemCount ? `?limit=${maxItemCount}` : '';
    return apiRequest(`/api/${containerName}${params}`);
  },

  async createBatch<T>(containerName: string, items: (T & { id?: string })[]): Promise<T[]> {
    const response = await apiRequest(`/api/${containerName}/batch`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    return response.items;
  },

  // Bulk sync for auto-persistence
  async sync(syncData: { [containerName: string]: any[] }): Promise<{ success: boolean; results: any }> {
    return apiRequest('/api/sync', {
      method: 'POST',
      body: JSON.stringify(syncData),
    });
  },

  // Health check
  async health(): Promise<{ status: string; timestamp: string }> {
    return apiRequest('/health');
  },

  // Query support (for complex queries)
  async query<T = any>(containerName: string, querySpec: string | { query: string; parameters?: any[] }): Promise<T[]> {
    return apiRequest(`/api/${containerName}/query`, {
      method: 'POST',
      body: JSON.stringify({ querySpec }),
    });
  }
};

export { ApiError };