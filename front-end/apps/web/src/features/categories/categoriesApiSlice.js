import { defaultSerializeQueryArgs } from "@reduxjs/toolkit/query";
import {
  catesAdapter,
  catesInitialState as initialState,
  categoriesApiSlice as initialsApiSlice,
  catesSelector,
} from "@ring/redux/categoriesApiSlice";
import { isEqual } from "lodash-es";

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

        //Params
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
        if (!currentArg?.loadMore) catesAdapter.removeAll(currentCache);
        catesAdapter.upsertMany(currentCache, catesSelector.selectAll(newItems));
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        const isForceRefetch =
          currentArg?.loadMore && !isEqual(currentArg, previousArg) && currentArg?.page > previousArg?.page;
        return isForceRefetch;
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [{ type: "Category", id: "LIST" }, ...result.ids.map((id) => ({ type: "Category", id }))];
        } else return [{ type: "Category", id: "LIST" }];
      },
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useGetPreviewCategoriesQuery,
  useGetRelevantCategoriesQuery,
  useGetCategoriesQuery,
} = categoriesApiSlice;
