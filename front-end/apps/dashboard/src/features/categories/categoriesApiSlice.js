import { categoriesApiSlice as initialsApiSlice } from "@ring/redux";

export const categoriesApiSlice = initialsApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (newCategory) => ({
        url: "/api/categories",
        method: "POST",
        credentials: "include",
        body: { ...newCategory },
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
    updateCategory: builder.mutation({
      query: ({ id, updateCategory }) => ({
        url: `/api/categories/${id}`,
        method: "PUT",
        credentials: "include",
        body: updateCategory,
        formData: true,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Category", id }],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/api/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Category", id }],
    }),
    deleteCategories: builder.mutation({
      query: (ids) => ({
        url: `/api/categories/delete-multiple?ids=${ids}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Category", id: "LIST" }],
    }),
    deleteCategoriesInverse: builder.mutation({
      query: (args) => {
        const { parentId, ids } = args || {};

        //Params
        const params = new URLSearchParams();
        if (parentId) params.append("parentId", parentId);
        if (ids?.length) params.append("ids", ids);

        return {
          url: `/api/categories/delete-inverse?${params.toString()}`,
          method: "DELETE",
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
          responseHandler: "text",
        };
      },
      invalidatesTags: (result, error) => [{ type: "Category", id: "LIST" }],
    }),
    deleteAllCategories: builder.mutation({
      query: () => ({
        url: "/api/categories/delete-all",
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => [{ type: "Category", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useDeleteCategoriesMutation,
  useDeleteAllCategoriesMutation,
} = categoriesApiSlice;
