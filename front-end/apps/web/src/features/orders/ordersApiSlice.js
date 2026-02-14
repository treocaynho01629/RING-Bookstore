import { createEntityAdapter } from "@reduxjs/toolkit";
import apiSlice from "@ring/redux/apiSlice";

const ordersAdapter = createEntityAdapter({});
const ordersSelector = ordersAdapter.getSelectors();
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
    getReceiptDetail: builder.query({
      query: (id) => ({
        url: `/api/orders/receipts/detail/${id}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error, id) => [{ type: "Receipt", id }],
    }),
    getOrderDetail: builder.query({
      query: (id) => ({
        url: `/api/orders/detail/${id}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    getOrdersByUser: builder.query({
      query: (args) => {
        const { status, keyword, page, size } = args || {};

        // Params
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (keyword) params.append("keyword", keyword);
        if (page) params.append("pageNo", page);
        if (size) params.append("pSize", size);

        return {
          url: `/api/orders/user?${params.toString()}`,
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
          return [{ type: "Order", id: "LIST" }, ...result.ids.map((id) => ({ type: "Order", id }))];
        } else return [{ type: "Order", id: "LIST" }];
      },
    }),
    getOrdersByUserScroll: builder.infiniteQuery({
      query: ({ queryArg, pageParam }) => {
        const args = queryArg ?? {};
        const { status, keyword, size } = args;

        const params = new URLSearchParams();
        params.append("pageNo", String(pageParam));
        if (status) params.append("status", status);
        if (keyword) params.append("keyword", keyword);
        if (size) params.append("pSize", size);

        return {
          url: `/api/orders/user?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
          const nextPage = lastPageParam + 1;
          if (nextPage >= lastPage.totalPages) return undefined;
          return nextPage;
        },
        getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
          const prevPage = firstPageParam - 1;
          if (prevPage < 0) return undefined;
          return prevPage;
        },
      },
      providesTags: (result) => {
        if (result?.pages) {
          return [
            { type: "Order", id: "LIST" },
            ...result.pages.flatMap((p) => (p.content ?? []).map((o) => ({ type: "Order", id: o.id }))),
          ];
        }
        return [{ type: "Order", id: "LIST" }];
      },
    }),
    calculate: builder.mutation({
      query: (currCart) => ({
        url: "/api/orders/calculate",
        method: "POST",
        credentials: "include",
        body: { ...currCart },
      }),
    }),
    checkout: builder.mutation({
      query: ({ token, source, cart }) => ({
        url: "/api/orders",
        method: "POST",
        credentials: "include",
        headers: { response: token, source },
        body: { ...cart },
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
    cancelOrder: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/api/orders/cancel/${id}?reason=${reason}`,
        method: "PUT",
        credentials: "include",
        responseHandler: "text",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Order", id }],
    }),
    cancelUnpaidOrders: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `/api/orders/cancel-unpaid/${orderId}?reason=${reason}`,
        method: "PUT",
        credentials: "include",
        responseHandler: "text",
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Receipt", orderId },
        { type: "Order", id: "LIST" },
      ],
    }),
    changePaymentMethod: builder.mutation({
      query: ({ orderId, paymentMethod }) => ({
        url: `/api/orders/payment/${orderId}?paymentMethod=${paymentMethod}`,
        method: "PUT",
        credentials: "include",
        responseHandler: "text",
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Receipt", orderId },
        { type: "Order", id: "LIST" },
      ],
    }),
    refundOrder: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/api/orders/refund/${id}?reason=${reason}`,
        method: "PUT",
        credentials: "include",
        responseHandler: "text",
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Order", id }],
    }),
    confirmOrder: builder.mutation({
      query: (id) => ({
        url: `/api/orders/confirm/${id}`,
        method: "PUT",
        credentials: "include",
        responseHandler: "text",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    createPaymentLink: builder.mutation({
      query: ({ token, source, id }) => ({
        url: `/api/payments/create-payment-link/${id}`,
        method: "POST",
        credentials: "include",
        headers: { response: token, source },
      }),
    }),
  }),
});

export const {
  useGetOrderDetailQuery,
  useGetOrdersByUserQuery,
  useGetOrdersByUserScrollInfiniteQuery,
  useGetReceiptDetailQuery,
  useCalculateMutation,
  useCheckoutMutation,
  useCancelOrderMutation,
  useCancelUnpaidOrdersMutation,
  useChangePaymentMethodMutation,
  useRefundOrderMutation,
  useConfirmOrderMutation,
  useCreatePaymentLinkMutation,
} = ordersApiSlice;
