import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import apiSlice from "@ring/redux/apiSlice";
import { setStateDefaultAddress } from "./addressReducer";

const addressesAdapter = createEntityAdapter({});
const initialState = addressesAdapter.getInitialState();

const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Address"] });

const normalizeAddressPayload = (address, fallback = {}) => {
  if (!address && !fallback) return null;

  const normalizedAddress = { ...(fallback ?? {}), ...(address ?? {}) };
  const companyName = normalizedAddress.companyName ?? normalizedAddress.company;

  if (companyName != null) {
    normalizedAddress.companyName = companyName;
    normalizedAddress.company = companyName;
  }

  return normalizedAddress;
};

const getListAddressMatch = (entityState, currentDefault) => {
  if (!entityState?.ids?.length) return null;

  const allAddresses = entityState.ids.map((id) => entityState.entities[id]).filter(Boolean);
  const serverDefault = allAddresses.find((item) => item?.isDefault);
  if (serverDefault) return serverDefault;

  if (currentDefault?.id == null) return null;
  return allAddresses.find((item) => `${item?.id}` === `${currentDefault.id}`) ?? null;
};

export const addressesApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getMyAddress: builder.query({
      query: () => ({
        url: "/api/addresses",
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, _error) => [{ type: "Address", id: result?.id }],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const normalizedAddress = normalizeAddressPayload(data, { isDefault: true });
          if (normalizedAddress) {
            dispatch(setStateDefaultAddress(normalizedAddress));
          }
        } catch {
          // Ignore to keep default RTK Query error flow unchanged.
        }
      },
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
      providesTags: (result, _error, _arg) => {
        if (result?.ids) {
          return [{ type: "Address", id: "LIST" }, ...result.ids.map((id) => ({ type: "Address", id }))];
        } else return [{ type: "Address", id: "LIST" }];
      },
      onQueryStarted: async (arg, { dispatch, getState, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const currentDefault = getState()?.address?.defaultAddress;
          const matchedAddress = getListAddressMatch(data, currentDefault);
          const normalizedAddress = normalizeAddressPayload(matchedAddress, currentDefault);

          if (normalizedAddress) {
            dispatch(setStateDefaultAddress(normalizedAddress));
          }
        } catch {
          // Ignore to keep default RTK Query error flow unchanged.
        }
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
      onQueryStarted: async (newAddress, { dispatch, getState, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const currentDefault = getState()?.address?.defaultAddress;
          const shouldSetAsDefault = Boolean(newAddress?.isDefault) || !currentDefault;
          if (!shouldSetAsDefault) return;

          const fallbackAddress = { ...newAddress, isDefault: true };
          const normalizedAddress = normalizeAddressPayload(data, fallbackAddress);

          if (normalizedAddress) {
            dispatch(setStateDefaultAddress({ ...normalizedAddress, isDefault: true }));
          }
        } catch {
          // Ignore to keep default RTK Query error flow unchanged.
        }
      },
    }),
    updateAddress: builder.mutation({
      query: ({ id, updatedAddress }) => ({
        url: `/api/addresses/${id}`,
        method: "PUT",
        credentials: "include",
        body: updatedAddress,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Address", id }],
      onQueryStarted: async ({ id, updatedAddress }, { dispatch, getState, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const currentDefault = getState()?.address?.defaultAddress;
          const isCurrentDefault = `${currentDefault?.id}` === `${id}`;
          const shouldSetAsDefault = Boolean(updatedAddress?.isDefault);

          if (!isCurrentDefault && !shouldSetAsDefault) return;

          const fallbackAddress = { ...currentDefault, ...updatedAddress, id };
          const normalizedAddress = normalizeAddressPayload(data, fallbackAddress);

          if (normalizedAddress) {
            dispatch(
              setStateDefaultAddress({
                ...normalizedAddress,
                isDefault: shouldSetAsDefault ? true : normalizedAddress.isDefault ?? currentDefault?.isDefault,
              })
            );
          }
        } catch {
          // Ignore to keep default RTK Query error flow unchanged.
        }
      },
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
