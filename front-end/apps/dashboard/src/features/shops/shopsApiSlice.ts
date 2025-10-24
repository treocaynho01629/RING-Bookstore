import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import apiSlice from "@ring/redux/apiSlice";

export interface PreviewResponse {
  id: number;
  name: string;
  image: string;
}

type PreviewsResponse = PreviewResponse[];

interface PreviewsState extends EntityState<PreviewResponse, number> {}

interface ShopQueryArgs {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  keyword?: string;
  userId?: number;
}

interface ShopResponse {
  id: number;
  name: string;
  image: string;
}

interface ShopsResponse {
  content: ShopResponse[];
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface ShopsState extends EntityState<ShopResponse, number> {
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const previewsAdapter = createEntityAdapter<PreviewResponse>();
const initialPreviewState = previewsAdapter.getInitialState();

const shopsAdapter = createEntityAdapter<ShopResponse>();
const initialState: ShopsState = shopsAdapter.getInitialState({
  empty: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
});

const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Shop"] });

export const shopsApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getShop: builder.query({
      query: (id) => ({
        url: `/api/shops/detail/${id}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error) => [
        { type: "Shop", id: result ? result.id : "LIST" },
      ],
    }),
    getShops: builder.query<ShopsState, ShopQueryArgs>({
      query: (args) => {
        const { page, size, sortBy, sortDir, keyword, userId } = args || {};

        //Params
        const params = new URLSearchParams();
        if (page) params.append("pageNo", page.toString());
        if (size) params.append("pSize", size.toString());
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (keyword) params.append("keyword", keyword);
        if (userId) params.append("userId", userId.toString());

        return {
          url: `/api/shops?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (response: ShopsResponse) => {
        const { content, empty, page, size, totalElements, totalPages } =
          response;
        return shopsAdapter.setAll(
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
      providesTags: (result) =>
        result
          ? [
              ...result.ids.map((id) => ({ type: "Shop" as const, id })),
              { type: "Shop", id: "LIST" },
            ]
          : [{ type: "Shop", id: "LIST" }],
    }),
    getPreviewShops: builder.query<PreviewsState, void>({
      query: () => {
        return {
          url: "/api/shops/preview",
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (response: PreviewsResponse) => {
        return previewsAdapter.setAll(initialPreviewState, response ?? {});
      },
      providesTags: (result) =>
        result
          ? [
              ...result.ids.map((id) => ({ type: "Shop" as const, id })),
              { type: "Shop", id: "LIST" },
            ]
          : [{ type: "Shop", id: "LIST" }],
    }),
    getShopAnalytics: builder.query({
      query: (userId) => {
        //Params
        const params = new URLSearchParams();
        if (userId) params.append("userId", userId);

        return {
          url: `/api/shops/analytics?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      providesTags: [{ type: "Shop", id: "LIST" }],
    }),
    createShop: builder.mutation({
      query: (newShop) => ({
        url: "/api/shops",
        method: "POST",
        credentials: "include",
        body: newShop,
        formData: true,
      }),
      invalidatesTags: [{ type: "Shop", id: "LIST" }],
    }),
    updateShop: builder.mutation({
      query: ({ id, updatedShop }) => ({
        url: `/api/shops/${id}`,
        method: "PUT",
        credentials: "include",
        body: updatedShop,
        formData: true,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Shop", id }],
    }),
    deleteShop: builder.mutation({
      query: (id) => ({
        url: `/api/shops/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Shop", id }],
    }),
    deleteShops: builder.mutation({
      query: (ids) => ({
        url: `/api/shops/delete-multiple?ids=${ids}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Shop", id: "LIST" }],
    }),
    deleteShopsInverse: builder.mutation({
      query: (args) => {
        const { keyword, userId, ids } = args || {};

        //Params
        const params = new URLSearchParams();
        if (keyword) params.append("keyword", keyword);
        if (userId) params.append("userId", userId);
        if (ids?.length) params.append("ids", ids);

        return {
          url: `/api/shops/delete-inverse?${params.toString()}`,
          method: "DELETE",
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
          responseHandler: "text",
        };
      },
      invalidatesTags: (result, error) => [{ type: "Shop", id: "LIST" }],
    }),
    deleteAllShops: builder.mutation({
      query: () => ({
        url: "/api/shops/delete-all",
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Shop", id: "LIST" }],
    }),
  }),
});

export const {
  useGetShopQuery,
  useGetShopsQuery,
  useGetPreviewShopsQuery,
  useGetShopAnalyticsQuery,
  useCreateShopMutation,
  useUpdateShopMutation,
  useDeleteShopMutation,
  useDeleteShopsMutation,
  useDeleteShopsInverseMutation,
  useDeleteAllShopsMutation,
  usePrefetch: usePrefetchShops,
} = shopsApiSlice;
