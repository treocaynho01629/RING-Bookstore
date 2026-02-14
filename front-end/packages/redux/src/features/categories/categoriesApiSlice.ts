import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { CategoryDTO } from "@ring/shared/models/categoryDTO";
import apiSlice from "../../lib/apiSlice";

export interface CateResponse extends CategoryDTO {
  id: number;
}

export interface CateQueryArgs {
  id?: number;
  slug?: string;
  include?: string;
}

export interface CategoriesQueryArgs {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  include?: string;
  parentId?: number;
  loadMore?: boolean;
}

/** Query arg for infinite endpoint (filters only; page comes from pageParam). */
export type CategoriesInfiniteQueryArgs = Omit<CategoriesQueryArgs, "page" | "loadMore">;

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
    getCategory: builder.query<CateResponse, CateQueryArgs>({
      query: ({ id, slug, include }) => ({
        url: `/api/categories/${slug ? "slug/" + slug : id ? id : ""}${include ? `?include=${include}` : ""}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error) => [{ type: "Category", id: result?.id }],
    }),
    getCategories: builder.query<CatesState, CategoriesQueryArgs>({
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
      providesTags: (result) =>
        result
          ? [...result.ids.map((id) => ({ type: "Category" as const, id })), { type: "Category", id: "LIST" }]
          : [{ type: "Category", id: "LIST" }],
    }),
    getCategoriesScroll: builder.infiniteQuery<CatesResponse, CategoriesInfiniteQueryArgs | void, number>({
      query: ({ queryArg, pageParam }) => {
        const args = queryArg ?? {};
        const { size, sortBy, sortDir, include, parentId } = args;

        const params = new URLSearchParams();
        params.append("pageNo", String(pageParam));
        if (size) params.append("pSize", String(size));
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (include) params.append("include", include);
        if (parentId) params.append("parentId", String(parentId));

        return {
          url: `/api/categories?${params.toString()}`,
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
              ...result.pages.flatMap((p) => p.content.map((c) => ({ type: "Category" as const, id: c.id }))),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),
  }),
});
