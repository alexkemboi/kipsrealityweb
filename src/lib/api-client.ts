/**
 * Centralized API Client with authentication handling
 * Uses httpOnly cookies set by the backend - no localStorage token management needed
 * Cookies are automatically included by the browser in all requests
 */

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
  auth?: boolean;
  retryOnAuthFailure?: boolean;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Clear authentication data on the server side
 */
async function clearAuthData(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies
    });
  } catch (error) {
    console.error('Failed to logout:', error);
  }
  
  // Also clear localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('rentflow_tokens');
      localStorage.removeItem('rentflow_user');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

/**
 * Make an authenticated API request
 * Credentials are automatically included via cookies
 */
async function apiRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    headers = {},
    auth = true,
    retryOnAuthFailure = true,
    ...fetchOptions
  } = options;

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      // Include cookies in all requests (httpOnly token cookie)
      credentials: 'include',
      headers: requestHeaders,
    });

    // Handle 401 Unauthorized
    if (response.status === 401 && auth && retryOnAuthFailure) {
      // Try to refresh token using the httpOnly refresh cookie
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (refreshResponse.ok) {
          // Retry the original request with refreshed token
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            credentials: 'include',
            headers: requestHeaders,
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            return { data, status: retryResponse.status };
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }

      // Refresh failed - clear auth and redirect
      await clearAuthData();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return {
        error: 'Session expired. Please log in again.',
        status: 401
      };
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Ignore JSON parsing errors
      }

      throw new ApiError(response.status, errorMessage, response);
    }

    // For 204 No Content responses
    if (response.status === 204) {
      return { status: response.status };
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        error: error.message,
        status: error.status
      };
    }

    console.error('API request error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500
    };
  }
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  /**
   * GET request
   */
  get: <T = unknown>(url: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(url, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  post: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PUT request
   */
  put: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PATCH request
   */
  patch: <T = unknown>(url: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * DELETE request
   */
  delete: <T = unknown>(url: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(url, { ...options, method: 'DELETE' }),

  /**
   * Logout - clears session on server and client
   */
  logout: clearAuthData,

  /**
   * Check if user is authenticated by attempting to fetch /api/auth/me
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

export default api;