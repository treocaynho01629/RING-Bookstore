import { createEntityAdapter } from "@reduxjs/toolkit";
import apiSlice from "@ring/redux/apiSlice";

const usersAdapter = createEntityAdapter({});
const initialState = usersAdapter.getInitialState({
  empty: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
});

const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["User"] });

export const usersApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (id) => ({
        url: `/api/accounts/${id}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    getUsers: builder.query({
      query: (args) => {
        const { page, size, sortBy, sortDir, keyword, role } = args || {};

        //Params
        const params = new URLSearchParams();
        if (page) params.append("pageNo", page);
        if (size) params.append("pSize", size);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (keyword) params.append("keyword", keyword);
        if (role) params.append("role", role);

        return {
          url: `/api/accounts?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (responseData) => {
        const { content, empty, page, size, totalElements, totalPages } = responseData;
        return usersAdapter.setAll(
          {
            ...initialState,
            empty,
            page,
            size,
            totalElements,
            totalPages,
          },
          content
        );
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [{ type: "User", id: "LIST" }, ...result.ids.map((id) => ({ type: "User", id }))];
        } else return [{ type: "User", id: "LIST" }];
      },
    }),
    getUserAnalytics: builder.query({
      query: () => {
        return {
          url: "/api/accounts/analytics",
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      providesTags: [{ type: "User", id: "LIST" }],
    }),
    getTopUsers: builder.query({
      query: () => ({
        url: "/api/accounts/top-accounts",
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: [{ type: "User", id: "LIST" }],
    }),
    getTopSellers: builder.query({
      query: () => ({
        url: "/api/accounts/top-sellers",
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: [{ type: "User", id: "LIST" }],
    }),
    createUser: builder.mutation({
      query: (newUser) => ({
        url: "/api/accounts",
        method: "POST",
        credentials: "include",
        body: newUser,
        formData: true,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateUser: builder.mutation({
      query: ({ id, updatedUser }) => ({
        url: `/api/accounts/${id}`,
        method: "PUT",
        credentials: "include",
        body: updatedUser,
        formData: true,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/accounts/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }],
    }),
    deleteUsers: builder.mutation({
      query: (ids) => ({
        url: `/api/accounts/delete-multiple?ids=${ids}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "User", id: "LIST" }],
    }),
    deleteUsersInverse: builder.mutation({
      query: (args) => {
        const { keyword, role, ids } = args || {};

        //Params
        const params = new URLSearchParams();
        if (keyword) params.append("keyword", keyword);
        if (role) params.append("role", role);
        if (ids?.length) params.append("ids", ids);

        return {
          url: `/api/accounts/delete-inverse?${params.toString()}`,
          method: "DELETE",
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      invalidatesTags: (result, error) => [{ type: "User", id: "LIST" }],
    }),
    deleteAllUsers: builder.mutation({
      query: () => ({
        url: "/api/accounts/delete-all",
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error) => [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetUsersQuery,
  useGetUserAnalyticsQuery,
  useGetTopUsersQuery,
  useGetTopSellersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useDeleteUsersMutation,
  useDeleteUsersInverseMutation,
  useDeleteAllUsersMutation,
  usePrefetch: usePrefetchUsers,
} = usersApiSlice;
