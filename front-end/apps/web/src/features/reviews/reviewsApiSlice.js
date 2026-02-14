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
    getReviewByBookId: builder.query({
      query: (id) => ({
        url: `/api/reviews/book/${id}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error) => [{ type: "Review", id: result ? result.id : "LIST" }],
    }),
    getReviewsByBookId: builder.query({
      query: (args) => {
        const { id, page, size, sortBy, sortDir, rating } = args || {};

        //Params
        const params = new URLSearchParams();
        if (page) params.append("pageNo", page);
        if (size) params.append("pSize", size);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (rating) params.append("rating", rating);

        return {
          url: `/api/reviews/books/${id}?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (responseData) => {
        const { content, empty, page, size, totalElements, totalPages } = responseData;
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
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [{ type: "Review", id: "LIST" }, ...result.ids.map((id) => ({ type: "Review", id }))];
        } else return [{ type: "Review", id: "LIST" }];
      },
    }),
    getMyReviews: builder.query({
      query: (args) => {
        const { page, size, sortBy, sortDir, rating } = args || {};

        //Params
        const params = new URLSearchParams();
        if (page) params.append("pageNo", page);
        if (size) params.append("pSize", size);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (rating) params.append("rating", rating);

        return {
          url: `/api/reviews/user?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [{ type: "Review", id: "LIST" }, ...result.ids.map((id) => ({ type: "Review", id }))];
        } else return [{ type: "Review", id: "LIST" }];
      },
    }),
    getMyReviewsScroll: builder.infiniteQuery({
      query: ({ queryArg, pageParam }) => {
        const args = queryArg ?? {};
        const { size, sortBy, sortDir, rating } = args || {};

        // Params
        const params = new URLSearchParams();
        params.append("pageNo", String(pageParam));
        if (size) params.append("pSize", size);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (rating) params.append("rating", rating);

        return {
          url: `/api/reviews/user?${params.toString()}`,
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
      providesTags: (result) =>
        result
          ? [
              ...result.pages.flatMap((p) => p.content.map((c) => ({ type: "Review", id: c.id }))),
              { type: "Review", id: "LIST" },
            ]
          : [{ type: "Review", id: "LIST" }],
    }),
    createReview: builder.mutation({
      query: ({ id, newReview }) => ({
        url: `/api/reviews/${id}`,
        method: "POST",
        credentials: "include",
        body: { ...newReview },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Review", id: "LIST" }],
    }),
    updateReview: builder.mutation({
      query: ({ id, updateReview }) => ({
        url: `/api/reviews/${id}`,
        method: "PUT",
        credentials: "include",
        body: updateReview,
        formData: true,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Review", id }],
    }),
  }),
});

export const {
  useGetReviewByBookIdQuery,
  useGetReviewsByBookIdQuery,
  useGetMyReviewsQuery,
  useGetMyReviewsScrollInfiniteQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  usePrefetch: usePrefetchReviews,
} = reviewsApiSlice;
