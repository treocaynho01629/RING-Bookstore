import { createEntityAdapter } from "@reduxjs/toolkit";
import apiSlice from "@ring/redux/apiSlice";

const ordersAdapter = createEntityAdapter({});
const initialState = ordersAdapter.getInitialState({
  empty: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
});

const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Order", "Receipt"] });

export const ordersApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getReceipt: builder.query({
      query: (id) => ({
        url: `/api/orders/receipts/${id}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error, id) => [{ type: "Receipt", id }],
    }),
    getReceipts: builder.query({
      query: (args) => {
        const { status, keyword, shopId, page, size, sortBy, sortDir } = args || {};

        //Params
        const params = new URLSearchParams();
        if (shopId) params.append("shopId", shopId);
        if (status) params.append("status", status);
        if (keyword) params.append("keyword", keyword);
        if (page != null) params.append("pageNo", page);
        if (size != null) params.append("pSize", size);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);

        return {
          url: `/api/orders/receipts?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (responseData) => {
        const { content, empty, page, size, totalElements, totalPages } = responseData;
        return ordersAdapter.setAll(
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
          return [{ type: "Order", id: "LIST" }, ...result.ids.map((id) => ({ type: "Receipt", id }))];
        } else return [{ type: "Receipt", id: "LIST" }];
      },
    }),
    getSummaries: builder.query({
      query: (args) => {
        const { shopId, bookId, page, size, sortBy, sortDir } = args || {};

        //Params
        const params = new URLSearchParams();
        if (shopId) params.append("shopId", shopId);
        if (bookId) params.append("bookId", bookId);
        if (page != null) params.append("pageNo", page);
        if (size != null) params.append("pSize", size);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);

        return {
          url: `/api/orders/summaries?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (responseData) => {
        const { content, empty, page, size, totalElements, totalPages } = responseData;
        return ordersAdapter.setAll(
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
          return [{ type: "Receipt", id: "LIST" }, ...result.ids.map((id) => ({ type: "Receipt", id }))];
        } else return [{ type: "Receipt", id: "LIST" }];
      },
    }),
    getSales: builder.query({
      query: (args) => {
        const { shopId, bookId, startDate, endDate } = args || {};

        //Params
        const params = new URLSearchParams();
        if (shopId) params.append("shopId", shopId);
        if (bookId) params.append("bookId", bookId);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        return {
          url: `/api/orders/sales?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      providesTags: [{ type: "Order", id: "LIST" }],
    }),
    changeOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/orders/status/${id}?status=${status}`,
        method: "PUT",
        credentials: "include",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Order", id }],
    }),
  }),
});

export const {
  useGetReceiptQuery,
  useGetReceiptsQuery,
  useGetSummariesQuery,
  useGetSalesQuery,
  useChangeOrderStatusMutation,
} = ordersApiSlice;
