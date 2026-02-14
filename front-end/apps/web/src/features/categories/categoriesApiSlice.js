import {
  catesAdapter,
  catesInitialState as initialState,
  categoriesApiSlice as initialsApiSlice,
} from "@ring/redux/categoriesApiSlice";

export const categoriesApiSlice = initialsApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPreviewCategories: builder.query({
      query: () => ({
        url: "/api/categories/preview",
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      transformResponse: (responseData) => {
        return catesAdapter.setAll(initialState, responseData ?? {});
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [{ type: "Category", id: "LIST" }, ...result.ids.map((id) => ({ type: "Category", id }))];
        } else return [{ type: "Category", id: "LIST" }];
      },
    }),
    getRelevantCategories: builder.query({
      query: (args) => {
        const { id, page, size } = args || {};

        // Params
        const params = new URLSearchParams();
        if (page) params.append("pageNo", page);
        if (size) params.append("pSize", size);

        return {
          url: `/api/categories/relevant/${id}?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (responseData) => {
        const { content, empty, page, size, totalElements, totalPages } = responseData;
        return catesAdapter.setAll(
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
          return [{ type: "Category", id: "LIST" }, ...result.ids.map((id) => ({ type: "Category", id }))];
        } else return [{ type: "Category", id: "LIST" }];
      },
    }),
    getRelevantCategoriesScroll: builder.infiniteQuery({
      query: ({ queryArg, pageParam }) => {
        const args = queryArg ?? {};
        const { id, size } = args;

        // Params
        const params = new URLSearchParams();
        params.append("pageNo", String(pageParam));
        if (size) params.append("pSize", size);

        return {
          url: `/api/categories/relevant/${id}?${params.toString()}`,
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
              ...result.pages.flatMap((p) => p.content.map((c) => ({ type: "Category", id: c.id }))),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useGetPreviewCategoriesQuery,
  useGetRelevantCategoriesQuery,
  useGetRelevantCategoriesScrollInfiniteQuery,
  useGetCategoriesQuery,
  useGetCategoriesScrollInfiniteQuery,
} = categoriesApiSlice;
