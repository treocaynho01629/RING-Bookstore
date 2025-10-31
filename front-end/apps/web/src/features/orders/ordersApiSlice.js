import { createEntityAdapter } from "@reduxjs/toolkit";
import { defaultSerializeQueryArgs } from "@reduxjs/toolkit/query";
import { isEqual } from "lodash-es";
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

export const ordersApiSlice = apiSlice.injectEndpoints({
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
        const { content, empty, page, size, totalElements, totalPages } =
          responseData;
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
      serializeQueryArgs: ({ endpointName, queryArgs, endpointDefinition }) => {
        if (queryArgs) {
          const { loadMore, ...mainQuery } = queryArgs;

          if (loadMore) {
            //Load more >> serialize without <pagination>
            const { page, size, ...rest } = mainQuery;
            if (JSON.stringify(rest) === "{}") return endpointName + "Merge";
            return defaultSerializeQueryArgs({
              endpointName: endpointName + "Merge",
              queryArgs: rest,
              endpointDefinition,
            });
          }

          //Serialize like normal
          if (JSON.stringify(mainQuery) === "{}") return endpointName;
          return defaultSerializeQueryArgs({
            endpointName,
            queryArgs: mainQuery,
            endpointDefinition,
          });
        } else {
          return endpointName;
        }
      },
      merge: (currentCache, newItems, { arg: currentArg }) => {
        currentCache.page = newItems.page;
        if (!currentArg?.loadMore) ordersAdapter.removeAll(currentCache);
        ordersAdapter.upsertMany(
          currentCache,
          ordersSelector.selectAll(newItems)
        );
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        const isForceRefetch =
          currentArg?.loadMore &&
          !isEqual(currentArg, previousArg) &&
          currentArg?.page > previousArg?.page;
        return isForceRefetch;
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "Order", id: "LIST" },
            ...result.ids.map((id) => ({ type: "Order", id })),
          ];
        } else return [{ type: "Order", id: "LIST" }];
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
