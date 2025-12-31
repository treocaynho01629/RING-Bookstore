import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import apiSlice from "@ring/redux/apiSlice";

const addressesAdapter = createEntityAdapter({});
const initialState = addressesAdapter.getInitialState();

const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Address"] });

export const addressesApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getAddress: builder.query({
      query: (id) => ({
        url: `/api/addresses/${id}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error, id) => [{ type: "Address", id }],
    }),
    getMyAddress: builder.query({
      query: () => ({
        url: "/api/addresses",
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error) => [{ type: "Address", id: result?.id }],
    }),
    getMyAddresses: builder.query({
      query: () => ({
        url: "/api/addresses/saved",
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      transformResponse: (responseData) => {
        return addressesAdapter.setAll(initialState, responseData ?? {});
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [{ type: "Address", id: "LIST" }, ...result.ids.map((id) => ({ type: "Address", id }))];
        } else return [{ type: "Address", id: "LIST" }];
      },
    }),
    createAddress: builder.mutation({
      query: (newAddress) => ({
        url: "/api/addresses",
        method: "POST",
        credentials: "include",
        body: { ...newAddress },
      }),
      invalidatesTags: [{ type: "Address", id: "LIST" }],
    }),
    updateAddress: builder.mutation({
      query: ({ id, updatedAddress }) => ({
        url: `/api/addresses/${id}`,
        method: "PUT",
        credentials: "include",
        body: updatedAddress,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Address", id }],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/api/addresses/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Address", id }],
    }),
  }),
});

export const {
  useGetAddressQuery,
  useGetMyAddressQuery,
  useGetMyAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApiSlice;

export const selectAddressesResult = addressesApiSlice.endpoints.getMyAddresses.select();

const selectAddressesData = createSelector(selectAddressesResult, (addressesResult) => addressesResult.data);

export const {
  selectAll: selectAllAddresses,
  selectById: selectAddressById,
  selectIds: selectAddressIds,
  selectEntities: selectAddressEntities,
} = addressesAdapter.getSelectors((state) => selectAddressesData(state) ?? initialState);
