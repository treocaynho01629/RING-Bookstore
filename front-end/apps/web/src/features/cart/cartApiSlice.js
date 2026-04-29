import apiSlice from "@ring/redux/apiSlice";
import { replaceCart } from "./cartReducer";

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyCart: builder.query({
      query: () => ({
        url: "/api/cart",
        validateStatus: (response, result) => response.status === 200 && !result?.isError,
      }),
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(replaceCart(data));
          }
        } catch {
          // Ignore to keep RTK Query error flow unchanged.
        }
      },
    }),
    upsertCartItem: builder.mutation({
      query: (payload) => ({
        url: "/api/cart",
        method: "POST",
        credentials: "include",
        body: payload,
      }),
    }),
    updateCartItemQuantity: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `/api/cart/${productId}?quantity=${quantity}`,
        method: "PATCH",
        credentials: "include",
      }),
    }),
    removeCartItem: builder.mutation({
      query: (productId) => ({
        url: `/api/cart/${productId}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),
    removeCartItems: builder.mutation({
      query: (productIds) => ({
        url: `/api/cart/delete-multiple?productIds=${productIds}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),
    clearCartServer: builder.mutation({
      query: () => ({
        url: "/api/cart/delete-all",
        method: "DELETE",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetMyCartQuery,
  useUpsertCartItemMutation,
  useUpdateCartItemQuantityMutation,
  useRemoveCartItemMutation,
  useRemoveCartItemsMutation,
  useClearCartServerMutation,
} = cartApiSlice;
