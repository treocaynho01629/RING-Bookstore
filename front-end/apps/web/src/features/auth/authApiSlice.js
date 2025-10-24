import apiSlice from "@ring/redux/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: ({ token, source, user }) => ({
        url: "/api/auth/register",
        method: "POST",
        headers: { response: token, source },
        body: {
          ...user,
        },
        responseHandler: "text",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    forgot: builder.mutation({
      query: ({ token, source, email }) => ({
        url: `/api/auth/forgot-password?email=${email}`,
        method: "POST",
        headers: { response: token, source },
        responseHandler: "text",
      }),
    }),
    reset: builder.mutation({
      query: ({ token, source, resetToken, resetBody }) => ({
        url: `/api/auth/reset-password/${resetToken}`,
        method: "PUT",
        headers: { response: token, source },
        body: {
          ...resetBody,
        },
        responseHandler: "text",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const { useRegisterMutation, useForgotMutation, useResetMutation } =
  authApiSlice;
