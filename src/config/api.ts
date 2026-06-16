export const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

export class ApiError extends Error {
  status: number;
  details: any;
  constructor(message: string, status: number, details: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const apiClient = {
  /**
   * Helper to perform HTTP GET requests to the backend.
   */
  async get<T = any>(path: string): Promise<T> {
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${BASE_URL}${formattedPath}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {
          // fallback if response is not JSON
        }
        const msg = errorData?.message || `Request failed with status ${response.status}`;
        throw new ApiError(msg, response.status, errorData);
      }

      return await response.json() as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new Error(err.message || 'Network request failed. Please check backend connection.');
    }
  },

  /**
   * Helper to perform HTTP POST requests to the backend.
   */
  async post<T = any>(path: string, body: any): Promise<T> {
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${BASE_URL}${formattedPath}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {
          // fallback if response is not JSON
        }
        const msg = errorData?.message || `Request failed with status ${response.status}`;
        throw new ApiError(msg, response.status, errorData);
      }

      return await response.json() as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new Error(err.message || 'Network request failed. Please check backend connection.');
    }
  }
};
