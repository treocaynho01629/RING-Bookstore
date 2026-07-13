import { setAuth, clearAuth } from "./authActions";
import { AuthenticationResponse } from "@ring/shared/models/authenticationResponse";
import apiSlice from "../../lib/apiSlice";

export interface AuthResponse extends AuthenticationResponse {
  token: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface AuthenticateArgs {
  token: string;
  source: string;
  credentials: Credentials;
  persist: boolean;
}

export interface RefreshArgs {
  token: string;
}

export interface SignOutArgs {
  token: string;
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    authenticate: builder.mutation<AuthResponse, AuthenticateArgs>({
      query: ({ token, source, credentials, persist }) => ({
        url: `/api/auth/authenticate?persist=${persist}`,
        method: "POST",
        credentials: "include",
        headers: { response: token, source },
        body: { ...credentials },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          // Set new auth token after login
          const { data } = await queryFulfilled;
          const { token } = data;

          if (token) {
            dispatch(setAuth(token));
          }
        } catch (error) {
          console.error(error);
        }
      },
    }),
    refresh: builder.mutation<AuthResponse, RefreshArgs>({
      query: () => ({
        url: "/api/auth/refresh-token",
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          // Set new auth token after refresh
          const { data } = await queryFulfilled;
          const { token } = data;

          if (token) {
            dispatch(setAuth(token));
          }
        } catch (error) {
          console.error(error);
        }
      },
    }),
    signOut: builder.mutation<void, SignOutArgs>({
      query: () => ({
        url: "/api/auth/logout",
        method: "DELETE",
        credentials: "include",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log("Logged out");
        } catch (error) {
          console.error(error);
        } finally {
          // Clear auth anyway to prevent refresh loop
          dispatch(clearAuth()); // Reset auth state
          dispatch(apiSlice.util.resetApiState()); // Reset redux
        }
      },
    }),
  }),
});

export const { useAuthenticateMutation, useSignOutMutation, useRefreshMutation } = authApiSlice;
