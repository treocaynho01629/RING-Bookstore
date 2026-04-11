import { booksApiSlice as initialsApiSlice } from "@ring/redux";

export const booksApiSlice = initialsApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBook: builder.query({
      query: (id) => ({
        url: `/api/books/detail/${id}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error) => [{ type: "Book", id: result ? result.id : "LIST" }],
    }),
    getBookAnalytics: builder.query({
      query: ({ shopId, userId }) => {
        // Params
        const params = new URLSearchParams();
        if (shopId) params.append("shopId", shopId);
        if (userId) params.append("userId", userId);

        return {
          url: `/api/books/analytics?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      providesTags: [{ type: "Book", id: "LIST" }],
    }),
    createBook: builder.mutation({
      query: (newBook) => ({
        url: "/api/books",
        method: "POST",
        credentials: "include",
        body: newBook,
        formData: true,
      }),
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),
    updateBook: builder.mutation({
      query: ({ id, updatedBook }) => ({
        url: `/api/books/${id}`,
        method: "PUT",
        credentials: "include",
        body: updatedBook,
        formData: true,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Book", id }],
    }),
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/api/books/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Book", id }],
    }),
    deleteBooks: builder.mutation({
      query: (ids) => ({
        url: `/api/books/delete-multiple?ids=${ids}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Book", id: "LIST" }],
    }),
    deleteBooksInverse: builder.mutation({
      query: (args) => {
        const { keyword, cateId, rating, amount, pubIds, types, shopId, value, ids } = args || {};

        //Params
        const params = new URLSearchParams();
        if (keyword) params.append("keyword", keyword);
        if (cateId) params.append("cateId", cateId);
        if (rating) params.append("rating", rating);
        if (amount != null) params.append("amount", amount);
        if (types?.length) params.append("types", types);
        if (shopId) params.append("shopId", shopId);
        if (pubIds?.length) params.append("pubIds", pubIds);
        if (value) {
          if (value[0] != 0) params.append("fromRange", value[0]);
          if (value[1] != 10000000) params.append("toRange", value[1]);
        }
        if (ids?.length) params.append("ids", ids);

        return {
          url: `/api/books/delete-inverse?${params.toString()}`,
          method: "DELETE",
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      invalidatesTags: (result, error) => [{ type: "Book", id: "LIST" }],
    }),
    deleteAllBooks: builder.mutation({
      query: (shopId) => ({
        url: `/api/books/delete-all?shopId=${shopId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Book", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBookQuery,
  useLazyGetBookQuery,
  useGetBooksQuery,
  useGetBookAnalyticsQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useDeleteBooksMutation,
  useDeleteBooksInverseMutation,
  useDeleteAllBooksMutation,
  usePrefetch: usePrefetchBooks,
} = booksApiSlice;
