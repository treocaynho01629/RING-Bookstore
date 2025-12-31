import { createEntityAdapter } from "@reduxjs/toolkit";
import { isEqual } from "lodash-es";
import apiSlice from "@ring/redux/apiSlice";

const reviewsAdapter = createEntityAdapter({});
const reviewsSelector = reviewsAdapter.getSelectors();
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
        if (!currentArg?.loadMore) reviewsAdapter.removeAll(currentCache);
        reviewsAdapter.upsertMany(currentCache, reviewsSelector.selectAll(newItems));
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        const isForceRefetch =
          currentArg?.loadMore && !isEqual(currentArg, previousArg) && currentArg?.page > previousArg?.page;
        return isForceRefetch;
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [{ type: "Review", id: "LIST" }, ...result.ids.map((id) => ({ type: "Review", id }))];
        } else return [{ type: "Review", id: "LIST" }];
      },
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
  useCreateReviewMutation,
  useUpdateReviewMutation,
  usePrefetch: usePrefetchReviews,
} = reviewsApiSlice;
