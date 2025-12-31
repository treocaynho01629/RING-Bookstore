import { bannersApiSlice as initialsApiSlice } from "@ring/redux";

export const bannersApiSlice = initialsApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBanner: builder.mutation({
      query: (newBanner) => ({
        url: `/api/banners/${id}`,
        method: "POST",
        credentials: "include",
        body: newBanner,
        formData: true,
      }),
      invalidatesTags: [{ type: "Banner", id: "LIST" }],
    }),
    updateBanner: builder.mutation({
      query: ({ id, updatedBanner }) => ({
        url: `/api/banners/${id}`,
        method: "PUT",
        credentials: "include",
        body: updatedBanner,
        formData: true,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Banner", id }],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/api/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Banner", id }],
    }),
    deleteBanners: builder.mutation({
      query: (ids) => ({
        url: `/api/banners/delete-multiple?ids=${ids}`,
        method: "DELETE",
        responseHandler: "text",
      }),
      invalidatesTags: (result, error) => [{ type: "Banner", id: "LIST" }],
    }),
    deleteBannersInverse: builder.mutation({
      query: (args) => {
        const { shop, byShop, ids } = args || {};

        //Params
        const params = new URLSearchParams();
        if (shop) params.append("shopId", shop);
        if (byShop) params.append("byShop", byShop);
        if (ids?.length) params.append("ids", ids);

        return {
          url: `/api/banners/delete-inverse?${params.toString()}`,
          method: "DELETE",
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
          responseHandler: "text",
        };
      },
      invalidatesTags: (result, error) => [{ type: "Banner", id: "LIST" }],
    }),
    deleteAllBanners: builder.mutation({
      query: (shopId) => ({
        url: `/api/banners/delete-all?shopId=${shopId}`,
        method: "DELETE",
        responseHandler: "text",
      }),
      invalidatesTags: (result, error) => [{ type: "Banner", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useDeleteBannersMutation,
  useDeleteBannersInverseMutation,
  useDeleteAllBannersMutation,
} = bannersApiSlice;
