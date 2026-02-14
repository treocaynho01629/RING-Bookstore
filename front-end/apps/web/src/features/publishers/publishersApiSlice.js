import {
  publishersApiSlice as initialsApiSlice,
  pubsInitialState as initialState,
  pubsAdapter,
} from "@ring/redux/publishersApiSlice";

export const publishersApiSlice = initialsApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRelevantPublishers: builder.query({
      query: (args) => {
        const { page, size, cateId } = args || {};

        // Params
        const params = new URLSearchParams();
        if (page) params.append("pageNo", page);
        if (size) params.append("pSize", size);

        return {
          url: `/api/publishers/relevant/${cateId}?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (responseData) => {
        const { content, empty, page, size, totalElements, totalPages } = responseData;
        return pubsAdapter.setAll(
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
          return [{ type: "Publisher", id: "LIST" }, ...result.ids.map((id) => ({ type: "Publisher", id }))];
        } else return [{ type: "Publisher", id: "LIST" }];
      },
    }),
    getRelevantPublishersScroll: builder.infiniteQuery({
      query: ({ queryArg, pageParam }) => {
        const { size, cateId } = queryArg || {};

        // Params
        const params = new URLSearchParams();
        params.append("pageNo", pageParam);
        if (size) params.append("pSize", size);

        return {
          url: `/api/publishers/relevant/${cateId}?${params.toString()}`,
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
              ...result.pages.flatMap((p) => p.content.map((pub) => ({ type: "Publisher", id: pub.id }))),
              { type: "Publisher", id: "LIST" },
            ]
          : [{ type: "Publisher", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPublisherQuery,
  useGetPublishersQuery,
  useGetPublishersScrollInfiniteQuery,
  useGetRelevantPublishersQuery,
  useGetRelevantPublishersScrollInfiniteQuery,
} = publishersApiSlice;
