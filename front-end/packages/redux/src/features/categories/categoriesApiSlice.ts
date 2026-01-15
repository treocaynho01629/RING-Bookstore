import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { defaultSerializeQueryArgs } from "@reduxjs/toolkit/query";
import { isEqual } from "lodash-es";
import apiSlice from "../../lib/apiSlice";

export interface CateResponse {
  id: number;
  slug: string;
  name: string;
}

export interface CateQueryArgs {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  include?: string;
  parentId?: number;
  loadMore?: boolean;
}

interface CatesResponse {
  content: CateResponse[];
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CatesState extends EntityState<CateResponse, number> {
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const catesAdapter = createEntityAdapter<CateResponse>();
export const catesSelector = catesAdapter.getSelectors();
export const catesInitialState: CatesState = catesAdapter.getInitialState({
  empty: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
});
const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Category"] });

export const categoriesApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getCategory: builder.query<CateResponse, { id?: number; slug?: string; include?: string }>({
      query: ({ id, slug, include }) => ({
        url: `/api/categories/${slug ? "slug/" + slug : id ? id : ""}${include ? `?include=${include}` : ""}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error) => [{ type: "Category", id: result?.id }],
    }),
    getCategories: builder.query<CatesState, CateQueryArgs>({
      query: (args) => {
        const { page, size, sortBy, sortDir, include, parentId } = args || {};

        //Params
        const params = new URLSearchParams();
        if (page) params.append("pageNo", page.toString());
        if (size) params.append("pSize", size.toString());
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (include) params.append("include", include);
        if (parentId) params.append("parentId", parentId.toString());

        return {
          url: `/api/categories?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (response: CatesResponse) => {
        const { content, empty, page, size, totalElements, totalPages } = response;
        return catesAdapter.setAll(
          {
            ...catesInitialState,
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
        return !!(
          currentArg?.loadMore &&
          !isEqual(currentArg, previousArg) &&
          (currentArg?.page ?? 0) > (previousArg?.page ?? 0)
        );
      },
      providesTags: (result) =>
        result
          ? [...result.ids.map((id) => ({ type: "Category" as const, id })), { type: "Category", id: "LIST" }]
          : [{ type: "Category", id: "LIST" }],
    }),
  }),
});
