import { setAuth, clearAuth } from "./authActions";
import apiSlice from "../../lib/apiSlice";

// FIX: Add type

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    authenticate: builder.mutation({
      query: ({ token, source, credentials, persist }) => ({
        url: `/api/auth/authenticate?persist=${persist}`,
        method: "POST",
        headers: { response: token, source },
        body: { ...credentials },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          //Set new auth token after login
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
    refresh: builder.mutation({
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
    signOut: builder.mutation({
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

export const {
  useAuthenticateMutation,
  useSignOutMutation,
  useRefreshMutation,
} = authApiSlice;
