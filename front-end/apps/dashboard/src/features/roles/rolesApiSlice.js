import { createEntityAdapter } from "@reduxjs/toolkit";
import apiSlice from "@ring/redux/apiSlice";

const rolesAdapter = createEntityAdapter({});
const initialState = rolesAdapter.getInitialState({});

const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Role", "Privilege"] });

export const rolesApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getRole: builder.query({
      query: (name) => ({
        url: `/api/roles/${name}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error) => [{ type: "Role", id: result.roleName }],
    }),
    getPrivileges: builder.query({
      query: () => ({
        url: "/api/roles/privileges",
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      transformResponse: (responseData) => {
        return rolesAdapter.setAll(initialState, responseData);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [{ type: "Privilege", id: "LIST" }, ...result.ids.map((id) => ({ type: "Privilege", id }))];
        } else return [{ type: "Privilege", id: "LIST" }];
      },
    }),
    updateRole: builder.mutation({
      query: ({ name, privileges }) => {
        const formData = new FormData();
        const json = JSON.stringify(privileges);
        const blob = new Blob([json], { type: "application/json" });
        formData.append("privileges", blob);

        return {
          url: `/api/roles/${name}`,
          method: "PUT",
          credentials: "include",
          body: formData,
          formData: true,
          responseHandler: "text",
        };
      },
      invalidatesTags: (result, error, { name }) => [{ type: "Role", id: name }],
    }),
  }),
});

export const { useGetRoleQuery, useGetPrivilegesQuery, useUpdateRoleMutation } = rolesApiSlice;
