import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { ReviewDTO } from "@ring/shared/models/reviewDTO";
import apiSlice from "@ring/redux/apiSlice";

export interface ReviewResponse extends ReviewDTO {
  id: number;
}

export interface ReviewQueryArgs {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  rating?: number;
  keyword?: string;
  bookId?: number;
  userId?: number;
}

interface ReviewsResponse {
  content: ReviewResponse[];
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface ReviewsState extends EntityState<ReviewResponse, number> {
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const reviewsAdapter = createEntityAdapter<ReviewResponse>();
const initialState: ReviewsState = reviewsAdapter.getInitialState({
  empty: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
});

export const reviewsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<ReviewsState, ReviewQueryArgs>({
      query: (args) => {
        const { page, size, sortBy, sortDir, rating, keyword, bookId, userId } = args || {};

        // Params
        const params = new URLSearchParams();
        if (page) params.append("pageNo", page.toString());
        if (size) params.append("pSize", size.toString());
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
      transformResponse: (response: ReviewsResponse) => {
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
          ? [...result.ids.map((id) => ({ type: "Review" as const, id })), { type: "Review", id: "LIST" }]
          : [{ type: "Review", id: "LIST" }],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/api/reviews/${id}`,
        method: "DELETE",
        responseHandler: "text",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Review", id }],
    }),
    deleteReviews: builder.mutation({
      query: (ids) => ({
        url: `/api/reviews/delete-multiple?ids=${ids}`,
        method: "DELETE",
        responseHandler: "text",
      }),
      invalidatesTags: (result, error) => [{ type: "Review", id: "LIST" }],
    }),
    deleteReviewsInverse: builder.mutation({
      query: (args) => {
        const { rating, keyword, bookId, userId, ids } = args || {};

        //Params
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
          responseHandler: "text",
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
  useDeleteReviewMutation,
  useDeleteReviewsMutation,
  useDeleteReviewsInverseMutation,
  useDeleteAllReviewsMutation,
  usePrefetch: usePrefetchReviews,
} = reviewsApiSlice;
