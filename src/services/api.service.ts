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
  name?: string;
  originalError?: any;
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

      // Handle 429 Too Many Requests - rate limit exceeded
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : null;
        const retryAfterMs = retryAfterSeconds ? retryAfterSeconds * 1000 : null;
        
        // Add retry information to error
        (error as any).retryAfter = retryAfterMs;
        (error as any).retryAfterSeconds = retryAfterSeconds;
        (error as any).isRateLimit = true;
        
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
   * @param timeout - Timeout in milliseconds (default: 30s, OTP requests: 45s)
   */
  private createFetchWithTimeout(
    url: string, 
    options: RequestInit, 
    timeout: number = 30000
  ): Promise<Response> {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const fetchPromise = fetch(url, {
      ...options,
      signal: controller.signal,
    }).catch((error: any) => {
      // If fetch fails due to abort, ensure it's properly identified
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        const abortError = new Error('Request timeout');
        abortError.name = 'AbortError';
        throw abortError;
      }
      throw error;
    });
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        const abortError = new Error('Request timeout');
        abortError.name = 'AbortError';
        reject(abortError);
      }, timeout);
    });
    
    return Promise.race([fetchPromise, timeoutPromise]).finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
      
      // Check if it's a rate limit error (429)
      const isRateLimit = error.status === 429 || error.isRateLimit;
      
      // Only retry on network errors, timeouts, or rate limits
      // Don't retry on 4xx client errors (like 404) - these are not transient errors
      // Check both name and message for better compatibility
      const isAbortError = error.name === 'AbortError' || error.originalError?.name === 'AbortError';
      const isTimeout = error.message?.includes('aborted') || 
                       error.message?.includes('timeout') ||
                       error.message?.includes('Request timeout');
      const isNetworkError = error.message?.includes('Failed to fetch') || 
                            error.message?.includes('Network request failed') ||
                            error.status === 0;
      const isClientError = error.status >= 400 && error.status < 500; // 4xx errors
      
      const shouldRetry = (isAbortError || isTimeout || isNetworkError || isRateLimit) && !isClientError;
      
      if (!shouldRetry) {
        throw error;
      }
      
      // For rate limit errors, use Retry-After header if available, otherwise use exponential backoff
      let retryDelay = delay;
      if (isRateLimit && error.retryAfter) {
        // Use Retry-After header value, but cap it at 60 seconds to avoid long waits
        retryDelay = Math.min(error.retryAfter, 60000);
        console.log(`[API] Rate limit exceeded. Retrying after ${retryDelay / 1000} seconds...`);
      } else {
        console.log(`[API] Retrying request... (${retries} attempts left)`, {
          errorType: error.name,
          errorMessage: error.message,
          errorStatus: error.status,
        });
        retryDelay = delay;
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // For rate limit errors, don't use exponential backoff on subsequent retries
      // Use the same delay or a smaller fixed delay
      const nextDelay = isRateLimit ? Math.min(retryDelay, 10000) : delay * 2;
      return this.retryRequest(fn, retries - 1, nextDelay);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const makeRequest = async (): Promise<ApiResponse<T>> => {
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
        // Only log unexpected errors (5xx, network, timeout) as errors
        // Log 4xx client errors (like 404, 400) as warnings since they're expected business logic responses
        const isClientError = error.status >= 400 && error.status < 500;
        
        if (isClientError) {
          // 4xx errors are expected business logic responses (e.g., order not found, validation errors)
          // Log as warning to avoid triggering React Native LogBox
          console.warn('[API] GET Client Error (expected):', error.message || error);
        } else {
          // 5xx errors, network errors, and timeouts are unexpected - log as errors
          console.error('[API] GET Error:', error);
        }
        
        // Handle timeout (check both name and message for better compatibility)
        if (error.name === 'AbortError' || 
            error.message?.includes('aborted') || 
            error.message?.includes('timeout') ||
            error.message === 'Request timeout') {
          throw {
            message: 'Request timeout. Please check your network connection and try again.',
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
        
        // Handle rate limit errors (429)
        if (error.status === 429 || error.isRateLimit) {
          const retryAfter = error.retryAfterSeconds || 15;
          throw {
            message: error.message || `Too many requests. Please try again in ${retryAfter} seconds.`,
            status: 429,
            isRateLimit: true,
            retryAfter: error.retryAfter,
            retryAfterSeconds: error.retryAfterSeconds,
          } as ApiError;
        }
        
        throw {
          message: error.message || 'Network error. Please check your connection.',
          status: error.status,
        } as ApiError;
      }
    };

    // Retry GET requests on rate limit or network errors
    return this.retryRequest(makeRequest, 2, 1000);
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
    const timeout = isOTPEndpoint ? 45000 : 30000; // Increased OTP timeout to 45s for slow networks
    const shouldRetry = isOTPEndpoint; // Retry OTP requests on failure
    
    const makeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        const url = this.getUrl(endpoint);
        const headers = await this.getHeaders(includeAuth);

        console.log('[API] POST Request to:', url);
        console.log('[API] POST Data:', data);
        console.log('[API] Base URL:', this.baseURL);
        console.log('[API] Timeout:', timeout, 'ms');
        
        const response = await this.createFetchWithTimeout(url, {
          method: 'POST',
          headers,
          body: data ? JSON.stringify(data) : undefined,
        }, timeout);

        console.log('[API] Response status:', response.status);
        return await this.handleResponse<T>(response);
      } catch (error: any) {
        // Only log unexpected errors (5xx, network, timeout) as errors
        // Log 4xx client errors (like 400 Bad Request) as warnings since they're expected business logic responses
        const isClientError = error.status >= 400 && error.status < 500;
        
        if (isClientError) {
          // 4xx errors are expected business logic responses (e.g., rack not available)
          // Log as warning to avoid triggering React Native LogBox
          console.warn('[API] POST Client Error (expected):', error.message || error);
        } else {
          // 5xx errors, network errors, and timeouts are unexpected - log as errors
          console.error('[API] POST Error:', error);
          console.error('[API] Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
          });
        }
        
        // Preserve original error information for retry logic
        const isAbortError = error.name === 'AbortError';
        const isTimeout = error.message?.includes('aborted') || 
                         error.message?.includes('timeout') ||
                         error.message === 'Request timeout';
        const isNetworkError = error.message?.includes('Failed to fetch') || 
                              error.message?.includes('Network request failed') ||
                              error.name === 'TypeError';
        
        // Handle network errors with more specific messages
        // Preserve error name and original error for retry logic
        if (isAbortError || isTimeout) {
          const apiError: ApiError = {
            message: 'Request timeout. Please check your network connection and try again.',
            status: 0,
            name: 'AbortError',
            originalError: error,
          };
          throw apiError;
        }
        
        if (isNetworkError) {
          const errorMsg = `Cannot connect to backend server at ${this.baseURL}.\n\nPlease ensure:\n1. Backend is running: cd HHD-APP-Backend && npm run dev\n2. Server is accessible at the configured URL\n3. Check if you're using the correct URL for your platform (web/Android/iOS)\n4. Verify both devices are on the same WiFi network\n5. Check Windows Firewall allows Node.js`;
          const apiError: ApiError = {
            message: errorMsg,
            status: 0,
            name: error.name || 'NetworkError',
            originalError: error,
          };
          throw apiError;
        }
        
        // Handle rate limit errors (429)
        if (error.status === 429 || error.isRateLimit) {
          const retryAfter = error.retryAfterSeconds || 15;
          const apiError: ApiError = {
            message: error.message || `Too many requests. Please try again in ${retryAfter} seconds.`,
            status: 429,
            name: error.name,
            originalError: error,
          };
          (apiError as any).isRateLimit = true;
          (apiError as any).retryAfter = error.retryAfter;
          (apiError as any).retryAfterSeconds = error.retryAfterSeconds;
          throw apiError;
        }
        
        const apiError: ApiError = {
          message: error.message || 'Network error. Please check your connection.',
          status: error.status,
          name: error.name,
          originalError: error,
        };
        throw apiError;
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
    const makeRequest = async (): Promise<ApiResponse<T>> => {
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
        // Handle timeout (check both name and message for better compatibility)
        if (error.name === 'AbortError' || 
            error.message?.includes('aborted') || 
            error.message?.includes('timeout') ||
            error.message === 'Request timeout') {
          throw {
            message: 'Request timeout. Please check your network connection and try again.',
            status: 0,
          } as ApiError;
        }
        
        // Handle rate limit errors (429)
        if (error.status === 429 || error.isRateLimit) {
          const retryAfter = error.retryAfterSeconds || 15;
          throw {
            message: error.message || `Too many requests. Please try again in ${retryAfter} seconds.`,
            status: 429,
            isRateLimit: true,
            retryAfter: error.retryAfter,
            retryAfterSeconds: error.retryAfterSeconds,
          } as ApiError;
        }
        
        throw {
          message: error.message || 'Network error. Please check your connection.',
          status: error.status,
        } as ApiError;
      }
    };

    // Retry PUT requests on rate limit or network errors
    return this.retryRequest(makeRequest, 2, 1000);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const makeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        const url = this.getUrl(endpoint);
        const headers = await this.getHeaders(includeAuth);

        const response = await this.createFetchWithTimeout(url, {
          method: 'DELETE',
          headers,
        });

        return await this.handleResponse<T>(response);
      } catch (error: any) {
        // Handle timeout (check both name and message for better compatibility)
        if (error.name === 'AbortError' || 
            error.message?.includes('aborted') || 
            error.message?.includes('timeout') ||
            error.message === 'Request timeout') {
          throw {
            message: 'Request timeout. Please check your network connection and try again.',
            status: 0,
          } as ApiError;
        }
        
        // Handle rate limit errors (429)
        if (error.status === 429 || error.isRateLimit) {
          const retryAfter = error.retryAfterSeconds || 15;
          throw {
            message: error.message || `Too many requests. Please try again in ${retryAfter} seconds.`,
            status: 429,
            isRateLimit: true,
            retryAfter: error.retryAfter,
            retryAfterSeconds: error.retryAfterSeconds,
          } as ApiError;
        }
        
        throw {
          message: error.message || 'Network error. Please check your connection.',
          status: error.status,
        } as ApiError;
      }
    };

    // Retry DELETE requests on rate limit or network errors
    return this.retryRequest(makeRequest, 2, 1000);
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

      // Use timeout wrapper for file uploads too (with longer timeout)
      const response = await this.createFetchWithTimeout(url, {
        method: 'POST',
        headers,
        body: formData,
      }, 60000); // 60 second timeout for file uploads

      return await this.handleResponse<T>(response);
    } catch (error: any) {
      // Handle timeout for file uploads
      if (error.name === 'AbortError' || 
          error.message?.includes('aborted') || 
          error.message?.includes('timeout') ||
          error.message === 'Request timeout') {
        throw {
          message: 'Upload timeout. Please check your network connection and try again.',
          status: 0,
        } as ApiError;
      }
      throw {
        message: error.message || 'File upload failed. Please try again.',
        status: error.status,
      } as ApiError;
    }
  }
}

export const apiService = new ApiService();
