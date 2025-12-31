import { couponsApiSlice as initialsApiSlice } from "@ring/redux";

export const couponsApiSlice = initialsApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCoupon: builder.query({
      query: (id) => ({
        url: `/api/coupons/${id}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error) => [
        result ? { type: "Coupon", id: result.id } : { type: "Coupon" },
      ],
    }),
    getCouponAnalytics: builder.query({
      query: ({ shopId, userId }) => {
        //Params
        const params = new URLSearchParams();
        if (shopId) params.append("shopId", shopId);
        if (userId) params.append("userId", userId);

        return {
          url: `/api/coupons/analytics?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      providesTags: [{ type: "Coupon", id: "LIST" }],
    }),
    createCoupon: builder.mutation({
      query: (newCoupon) => ({
        url: "/api/coupons",
        method: "POST",
        credentials: "include",
        body: {
          ...newCoupon,
        },
      }),
      invalidatesTags: [{ type: "Coupon", id: "LIST" }],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, updatedCoupon }) => ({
        url: `/api/coupons/${id}`,
        method: "PUT",
        credentials: "include",
        body: {
          ...updatedCoupon,
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Coupon", id }],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/api/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Coupon", id }],
    }),
    deleteCoupons: builder.mutation({
      query: (ids) => ({
        url: `/api/coupons/delete-multiple?ids=${ids}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Coupon", id: "LIST" }],
    }),
    deleteCouponsInverse: builder.mutation({
      query: (args) => {
        const { types, shopId, userId, byShop, showExpired, codes, code, ids } =
          args || {};

        //Params
        const params = new URLSearchParams();
        if (types) params.append("types", types);
        if (shopId) params.append("shopId", shopId);
        if (userId) params.append("userId", userId);
        if (byShop != null) params.append("byShop", byShop);
        if (showExpired) params.append("showExpired", showExpired);
        if (codes?.length > 0) params.append("codes", codes);
        if (code) params.append("code", code);
        if (ids?.length) params.append("ids", ids);

        return {
          url: `/api/coupons/delete-multiple?${params.toString()}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (result, error) => [{ type: "Coupon", id: "LIST" }],
    }),
    deleteAllCoupons: builder.mutation({
      query: (shopId) => ({
        url: `/api/coupons/delete-all?shopId=${shopId}`,
        method: "DELETE",
        responseHandler: "text",
      }),
      invalidatesTags: (result, error) => [{ type: "Coupon", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCouponQuery,
  useGetCouponsQuery,
  useGetCouponAnalyticsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useDeleteCouponsMutation,
  useDeleteCouponsInverseMutation,
  useDeleteAllCouponsMutation,
} = couponsApiSlice;
