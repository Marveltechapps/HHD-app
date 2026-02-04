/**
 * API Service
 * Base HTTP client with authentication and error handling
 */

import { API_BASE_URL } from '../config/api';
import { storage } from '../utils/storage';

const TOKEN_KEY = '@hhd_app_token';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get stored authentication token
   */
  async getToken(): Promise<string | null> {
    return await storage.getItem(TOKEN_KEY);
  }

  /**
   * Store authentication token
   */
  async setToken(token: string): Promise<void> {
    await storage.setItem(TOKEN_KEY, token);
  }

  /**
   * Remove authentication token
   */
  async removeToken(): Promise<void> {
    await storage.removeItem(TOKEN_KEY);
  }

  /**
   * Build full URL
   */
  private getUrl(endpoint: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseURL}/${cleanEndpoint}`;
  }

  /**
   * Build headers with authentication
   */
  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        await this.removeToken();
        throw error;
      }

      throw error;
    }

    return data;
  }

  /**
   * Create fetch with timeout
   * @param url - Request URL
   * @param options - Fetch options
   * @param timeout - Timeout in milliseconds (default: 30s, OTP requests: 20s)
   */
  private createFetchWithTimeout(
    url: string, 
    options: RequestInit, 
    timeout: number = 30000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    return fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
    });
  }

  /**
   * Retry a request with exponential backoff
   * @param fn - Function to retry
   * @param retries - Number of retries (default: 2)
   * @param delay - Initial delay in ms (default: 1000)
   */
  private async retryRequest<T>(
    fn: () => Promise<T>,
    retries: number = 2,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries === 0) {
        throw error;
      }
      
      // Only retry on network errors or timeouts
      const shouldRetry = 
        error.name === 'AbortError' ||
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('Network request failed') ||
        error.status === 0;
      
      if (!shouldRetry) {
        throw error;
      }
      
      console.log(`[API] Retrying request... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryRequest(fn, retries - 1, delay * 2); // Exponential backoff
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const url = this.getUrl(endpoint);
      const headers = await this.getHeaders(includeAuth);

      console.log('[API] GET Request:', url);

      const response = await this.createFetchWithTimeout(url, {
        method: 'GET',
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      console.error('[API] GET Error:', error);
      
      // Handle timeout
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout. Please check your network connection.',
          status: 0,
        } as ApiError;
      }
      
      // Handle network errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network request failed')) {
        throw {
          message: `Cannot connect to server at ${this.baseURL}. Please ensure the backend is running on port 5000.`,
          status: 0,
        } as ApiError;
      }
      
      throw {
        message: error.message || 'Network error. Please check your connection.',
        status: error.status,
      } as ApiError;
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const isOTPEndpoint = endpoint.includes('/auth/send-otp') || endpoint.includes('/auth/verify-otp');
    const timeout = isOTPEndpoint ? 30000 : 30000; // Increased OTP timeout to 30s
    const shouldRetry = isOTPEndpoint; // Retry OTP requests on failure
    
    const makeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        const url = this.getUrl(endpoint);
        const headers = await this.getHeaders(includeAuth);

        console.log('[API] POST Request to:', url);
        console.log('[API] POST Data:', data);
        console.log('[API] Base URL:', this.baseURL);
        
        const response = await this.createFetchWithTimeout(url, {
          method: 'POST',
          headers,
          body: data ? JSON.stringify(data) : undefined,
        }, timeout);

        console.log('[API] Response status:', response.status);
        return await this.handleResponse<T>(response);
      } catch (error: any) {
        console.error('[API] POST Error:', error);
        console.error('[API] Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        
        // Handle network errors with more specific messages
        if (error.name === 'AbortError') {
          throw {
            message: 'Request timeout. Please check your network connection and try again.',
            status: 0,
          } as ApiError;
        }
        
        if (error.message?.includes('Failed to fetch') || 
            error.message?.includes('Network request failed') ||
            error.name === 'TypeError') {
          const errorMsg = `Cannot connect to backend server at ${this.baseURL}.\n\nPlease ensure:\n1. Backend is running: cd HHD-APP-Backend && npm run dev\n2. Server is accessible at the configured URL\n3. Check if you're using the correct URL for your platform (web/Android/iOS)\n4. Verify both devices are on the same WiFi network\n5. Check Windows Firewall allows Node.js`;
          throw {
            message: errorMsg,
            status: 0,
          } as ApiError;
        }
        
        throw {
          message: error.message || 'Network error. Please check your connection.',
          status: error.status,
        } as ApiError;
      }
    };

    // Retry OTP requests up to 2 times with exponential backoff
    if (shouldRetry) {
      return this.retryRequest(makeRequest, 2, 1000);
    }
    
    return makeRequest();
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.getUrl(endpoint);
      const headers = await this.getHeaders(includeAuth);

      const response = await this.createFetchWithTimeout(url, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout. Please check your network connection.',
          status: 0,
        } as ApiError;
      }
      throw {
        message: error.message || 'Network error. Please check your connection.',
        status: error.status,
      } as ApiError;
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const url = this.getUrl(endpoint);
      const headers = await this.getHeaders(includeAuth);

      const response = await this.createFetchWithTimeout(url, {
        method: 'DELETE',
        headers,
      });

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout. Please check your network connection.',
          status: 0,
        } as ApiError;
      }
      throw {
        message: error.message || 'Network error. Please check your connection.',
        status: error.status,
      } as ApiError;
    }
  }

  /**
   * Upload file (multipart/form-data)
   */
  async uploadFile<T = any>(
    endpoint: string,
    fileUri: string,
    fieldName: string = 'photo',
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.getUrl(endpoint);
      const token = await this.getToken();

      const formData = new FormData();
      
      // Add file
      const fileType = fileUri.split('.').pop() || 'jpg';
      const fileName = fileUri.split('/').pop() || `photo.${fileType}`;
      
      formData.append(fieldName, {
        uri: fileUri,
        type: `image/${fileType}`,
        name: fileName,
      } as any);

      // Add additional data
      if (additionalData) {
        Object.keys(additionalData).forEach((key) => {
          formData.append(key, String(additionalData[key]));
        });
      }

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      throw {
        message: error.message || 'File upload failed. Please try again.',
        status: error.status,
      } as ApiError;
    }
  }
}

export const apiService = new ApiService();
