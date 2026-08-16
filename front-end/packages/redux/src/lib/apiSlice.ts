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

// Base url
let baseUrl: string = "";
export function setBaseUrl(newBaseUrl: string) {
  if (newBaseUrl) baseUrl = newBaseUrl;
}

type BaseQueryResult = Awaited<ReturnType<typeof baseQuery>>;
type RefreshOutcome = { ok: true } | { ok: false; result: BaseQueryResult };

let refreshPromise: Promise<RefreshOutcome> | null = null;

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta> = async (
  args,
  api,
  extraOptions
) => {
  const baseQueryParams: FetchBaseQueryArgs = {};

  // Get base url
  if (baseUrl) baseQueryParams.baseUrl = baseUrl;
  const isFormDataRequest =
    typeof args !== "string" &&
    (args.body instanceof FormData || Boolean((args as FetchArgs & { formData?: boolean }).formData));

  baseQueryParams.prepareHeaders = (headers) => {
    // Accept-Language header with current language
    const language = (api.getState() as RootState).app?.lang;
    if (language) headers.set("Accept-Language", language);

    // Common headers
    if (isFormDataRequest) {
      // Let browser set multipart boundary automatically for FormData.
      headers.delete("Content-Type");
    } else {
      headers.set("Content-Type", "application/json");
    }

    // Authorization Bearer token
    const token = (api.getState() as RootState).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);

    return headers;
  };

  return fetchBaseQuery(baseQueryParams)(args, api, extraOptions);
};

// Prevent multiple refresh token requests
const ensureTokenRefreshed = async (
  api: BaseQueryApi,
  extraOptions: {}
): Promise<RefreshOutcome> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
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

        if (data) {
          const { token } = data as { token: string };
          api.dispatch(setAuth(token));
          return { ok: true };
        }

        if (error) {
        // Logout user
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
          return { ok: false, result: refreshResult };
        }

        return { ok: false, result: refreshResult };
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

const baseQueryWithRefresh = async (args: FetchArgs, api: BaseQueryApi, extraOptions: {}) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.meta?.response?.status === 401) {
    const refresh = await ensureTokenRefreshed(api, extraOptions);
    if (!refresh.ok) {
      return refresh.result;
    }

    result = await baseQuery(args, api, extraOptions);
  }

  return result;
};

const apiSlice = createApi({
  baseQuery: baseQueryWithRefresh,
  tagTypes: [],
  endpoints: (builder) => ({}),
});

export default apiSlice;
