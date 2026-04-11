import { createEntityAdapter } from "@reduxjs/toolkit";
import apiSlice from "@ring/redux/apiSlice";

const reviewsAdapter = createEntityAdapter({});
const initialState = reviewsAdapter.getInitialState({
  empty: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
});

const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Review"] });

export const reviewsApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: (args) => {
        const { page, size, sortBy, sortDir, rating, keyword, bookId, userId } = args || {};

        // Params
        const params = new URLSearchParams();
        if (page != null) params.append("pageNo", page.toString());
        if (size != null) params.append("pSize", size.toString());
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (rating) params.append("rating", rating.toString());
        if (keyword) params.append("keyword", keyword);
        if (bookId) params.append("bookId", bookId.toString());
        if (userId) params.append("userId", userId.toString());

        return {
          url: `/api/reviews?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (response) => {
        const { content, empty, page, size, totalElements, totalPages } = response;
        return reviewsAdapter.setAll(
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
          ? [...result.ids.map((id) => ({ type: "Review", id })), { type: "Review", id: "LIST" }]
          : [{ type: "Review", id: "LIST" }],
    }),
    getReviewsAnalytics: builder.query({
      query: (args) => {
        const { shopId, bookId } = args || {};

        const params = new URLSearchParams();
        if (shopId) params.append("shopId", shopId.toString());
        if (bookId) params.append("bookId", bookId.toString());

        return {
          url: `/api/reviews/analytics?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      providesTags: [{ type: "Review", id: "LIST" }],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/api/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Review", id }],
    }),
    deleteReviews: builder.mutation({
      query: (ids) => ({
        url: `/api/reviews/delete-multiple?ids=${ids}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Review", id: "LIST" }],
    }),
    deleteReviewsInverse: builder.mutation({
      query: (args) => {
        const { rating, keyword, bookId, userId, ids } = args || {};

        // Params
        const params = new URLSearchParams();
        if (rating) params.append("rating", rating);
        if (keyword) params.append("keyword", keyword);
        if (bookId) params.append("bookId", bookId);
        if (userId) params.append("userId", userId);
        if (ids?.length) params.append("ids", ids);

        return {
          url: `/api/reviews/delete-inverse?${params.toString()}`,
          method: "DELETE",
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      invalidatesTags: (result, error) => [{ type: "Review", id: "LIST" }],
    }),
    deleteAllReviews: builder.mutation({
      query: () => ({
        url: "/api/reviews/delete-all",
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Review", id: "LIST" }],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewsAnalyticsQuery,
  useDeleteReviewMutation,
  useDeleteReviewsMutation,
  useDeleteReviewsInverseMutation,
  useDeleteAllReviewsMutation,
  usePrefetch: usePrefetchReviews,
} = reviewsApiSlice;
