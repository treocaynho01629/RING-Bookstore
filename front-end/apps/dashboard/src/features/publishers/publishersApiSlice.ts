import { publishersApiSlice as initialsApiSlice } from "@ring/redux";

export const publishersApiSlice = initialsApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPublisher: builder.mutation({
      query: (newPublisher) => ({
        url: "/api/publishers",
        method: "POST",
        credentials: "include",
        body: newPublisher,
        formData: true,
      }),
      invalidatesTags: [{ type: "Publisher", id: "LIST" }],
    }),
    updatePublisher: builder.mutation({
      query: ({ id, updatedPublisher }) => ({
        url: `/api/publishers/${id}`,
        method: "PUT",
        credentials: "include",
        body: updatedPublisher,
        formData: true,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Publisher", id }],
    }),
    deletePublisher: builder.mutation({
      query: (id) => ({
        url: `/api/publishers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Publisher", id }],
    }),
    deletePublishers: builder.mutation({
      query: (ids) => ({
        url: `/api/publishers/delete-multiple?ids=${ids}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Publisher", id: "LIST" }],
    }),
    deletePublishersInverse: builder.mutation({
      query: (ids) => ({
        url: `/api/publishers/delete-inverse?ids=${ids}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Publisher", id: "LIST" }],
    }),
    deleteAllPublishers: builder.mutation({
      query: () => ({
        url: "/api/publishers/delete-all",
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Publisher", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPublisherQuery,
  useGetPublishersQuery,
  useCreatePublisherMutation,
  useUpdatePublisherMutation,
  useDeletePublisherMutation,
  useDeletePublishersMutation,
  useDeleteAllPublishersMutation,
} = publishersApiSlice;
