import { useSession } from "next-auth/react";
import { useCallback } from "react";

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: string;
  status?: number;
}

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
}

export function useBackendApi() {
  const { data: session, status } = useSession();

  const apiCall = useCallback(
    async <T = any>(
      endpoint: string,
      options: ApiOptions = {}
    ): Promise<ApiResponse<T>> => {
      if (status === "loading") {
        return { error: "Session is loading" };
      }

      if (!session?.accessToken) {
        return { error: "No access token - Please log in" };
      }

      try {
        const { method = "GET", body, headers = {} } = options;

        const requestOptions: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
        };

        if (body && ["POST", "PUT", "PATCH"].includes(method)) {
          requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(
          `/api/backend/${endpoint}`,
          requestOptions
        );
        const data = await response.json();

        if (!response.ok) {
          return {
            error: data.error || "Request failed",
            details: data.details,
            status: response.status,
          };
        }

        return { data, status: response.status };
      } catch (error) {
        console.error("API call error:", error);
        return {
          error: "Network error",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [session?.accessToken, status]
  );

  const get = useCallback(
    <T = any>(endpoint: string, headers?: Record<string, string>) =>
      apiCall<T>(endpoint, { method: "GET", headers }),
    [apiCall]
  );

  const post = useCallback(
    <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
      apiCall<T>(endpoint, { method: "POST", body, headers }),
    [apiCall]
  );

  const put = useCallback(
    <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
      apiCall<T>(endpoint, { method: "PUT", body, headers }),
    [apiCall]
  );

  const del = useCallback(
    <T = any>(endpoint: string, headers?: Record<string, string>) =>
      apiCall<T>(endpoint, { method: "DELETE", headers }),
    [apiCall]
  );

  const patch = useCallback(
    <T = any>(endpoint: string, body?: any, headers?: Record<string, string>) =>
      apiCall<T>(endpoint, { method: "PATCH", body, headers }),
    [apiCall]
  );

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
    patch,
    isAuthenticated: !!session?.accessToken,
    isLoading: status === "loading",
  };
}
