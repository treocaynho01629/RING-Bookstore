import apiSlice from "@ring/redux/apiSlice";

const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Profile"] });

export const usersApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => ({
        url: `/api/accounts/profile`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation({
      query: (updatedProfile) => ({
        url: "/api/accounts/profile",
        method: "PUT",
        credentials: "include",
        body: updatedProfile,
        formData: true,
      }),
      invalidatesTags: ["Profile"],
    }),
    changePassword: builder.mutation({
      query: (changeBody) => ({
        url: "/api/accounts/change-password",
        method: "PUT",
        body: {
          ...changeBody,
        },
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } = usersApiSlice;
