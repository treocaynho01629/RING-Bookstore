import {
  booksAdapter,
  booksInitialState as initialState,
  booksApiSlice as initialsApiSlice,
} from "@ring/redux/booksApiSlice";

export const booksApiSlice = initialsApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBookDetail: builder.query({
      query: ({ id, slug }) => ({
        url: `/api/books/${slug ? "slug/" + slug : id ? id : ""}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error) => [{ type: "Book", id: result ? result.id : "LIST" }],
    }),
    getBooksByIds: builder.query({
      query: (ids) => {
        //Params
        const params = new URLSearchParams();
        if (ids?.length) params.append("ids", ids);

        return {
          url: `/api/books/find?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (responseData) => {
        return booksAdapter.setAll(initialState, responseData ?? {});
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [{ type: "Book", id: "LIST" }, ...result.ids.map((id) => ({ type: "Book", id }))];
        } else return [{ type: "Book", id: "LIST" }];
      },
    }),
    getRandomBooks: builder.query({
      query: (args) => {
        const { amount, withDesc } = args || {};

        //Params
        const params = new URLSearchParams();
        if (amount) params.append("amount", amount);
        if (withDesc) params.append("withDesc", withDesc);

        return {
          url: `/api/books/random?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (responseData) => {
        return booksAdapter.setAll(initialState, responseData ?? {});
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [{ type: "Book", id: "LIST" }, ...result.ids.map((id) => ({ type: "Book", id }))];
        } else return [{ type: "Book", id: "LIST" }];
      },
    }),
    getBooksSuggestion: builder.query({
      query: (keyword) => ({
        url: `/api/books/suggest?keyword=${keyword}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error) => [{ type: "Book", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBookDetailQuery,
  useGetBooksQuery,
  useGetBooksScrollInfiniteQuery,
  useGetBooksByIdsQuery,
  useGetRandomBooksQuery,
  useGetBooksSuggestionQuery,
  usePrefetch: usePrefetchBooks,
} = booksApiSlice;
