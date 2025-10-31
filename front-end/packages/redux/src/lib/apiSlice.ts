import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAuth, setAuth } from "../features/auth/authActions";
import type {
  FetchArgs,
  BaseQueryApi,
  BaseQueryFn,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  FetchBaseQueryArgs,
} from "@reduxjs/toolkit/query";
import type { RootState } from "./store";
import { Mutex } from "async-mutex";

// Base url
let baseUrl: string = "";
export function setBaseUrl(newBaseUrl: string) {
  if (newBaseUrl) baseUrl = newBaseUrl;
}

// Mutex for preventing multiple requests
const mutex = new Mutex();

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  let baseQueryParams: FetchBaseQueryArgs = {};

  // Get base url
  if (baseUrl) baseQueryParams.baseUrl = baseUrl;

  baseQueryParams.prepareHeaders = (headers) => {
    // Accept-Language header with current language
    const language = (api.getState() as RootState).app.lang;
    if (language) headers.set("Accept-Language", language);

    // Common headers
    headers.set("Content-Type", "application/json");

    // Authorization Bearer token
    const token = (api.getState() as RootState).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);

    return headers;
  };

  return fetchBaseQuery(baseQueryParams)(args, api, extraOptions);
};

const baseQueryWithRefresh = async (
  args: FetchArgs,
  api: BaseQueryApi,
  extraOptions: {}
) => {
  // Wait until the mutex is available without locking it
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  // Token expired
  if (result?.meta?.response?.status === 401) {
    // Checking whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // Auto refresh
        const refreshResult = await baseQuery(
          {
            url: "/api/auth/refresh-token",
            method: "GET",
            credentials: "include",
          },
          api,
          extraOptions
        );
        const { data, error } = refreshResult;

        // Refresh succeed
        if (data) {
          // Set new auth token
          const { token } = data as { token: string };
          api.dispatch(setAuth(token));
          result = await baseQuery(args, api, extraOptions); // Refetch

          // Refresh failed
        } else if (error) {
          // Logout
          await baseQuery(
            {
              url: "/api/auth/logout",
              method: "DELETE",
              credentials: "include",
            },
            api,
            extraOptions
          );
          api.dispatch(clearAuth());
          api.dispatch(apiSlice.util.resetApiState());

          return refreshResult;
        }
      } finally {
        // Release must be called once the mutex should be released again.
        release();
      }
    } else {
      // Wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

const apiSlice = createApi({
  baseQuery: baseQueryWithRefresh,
  tagTypes: [],
  endpoints: (builder) => ({}),
});

export default apiSlice;
