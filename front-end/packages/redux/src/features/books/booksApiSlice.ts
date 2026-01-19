import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { defaultSerializeQueryArgs } from "@reduxjs/toolkit/query";
import { isEqual } from "lodash-es";
import { BookDisplayDTO } from "@ring/shared/models/bookDisplayDTO";
import apiSlice from "../../lib/apiSlice";

export interface BookResponse extends BookDisplayDTO {
  id: number;
}

export interface BookQueryArgs {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  loadMore?: boolean;
  keyword?: string;
  cateId?: number;
  rating?: string;
  amount?: number;
  pubIds?: number[];
  types?: string[];
  shopId?: number;
  userId?: number;
  value?: [number, number];
  withDesc?: boolean;
}

export interface BooksResponse {
  content: BookResponse[];
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface BooksState extends EntityState<BookResponse, number> {
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const booksAdapter = createEntityAdapter<BookResponse>();
export const booksSelector = booksAdapter.getSelectors();
export const booksInitialState: BooksState = booksAdapter.getInitialState({
  empty: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
});
const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Book"] });

export const booksApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query<BooksState, BookQueryArgs>({
      query: (args) => {
        const {
          page,
          size,
          sortBy,
          sortDir,
          keyword,
          cateId,
          rating,
          amount,
          pubIds,
          types,
          shopId,
          userId,
          value,
          withDesc,
        } = args || {};

        // Params
        const params = new URLSearchParams();
        if (page) params.append("pageNo", page.toString());
        if (size) params.append("pSize", size.toString());
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (keyword) params.append("keyword", keyword);
        if (cateId) params.append("cateId", cateId.toString());
        if (rating) params.append("rating", rating);
        if (amount != null) params.append("amount", amount.toString());
        if (types?.length) params.append("types", types.join(","));
        if (shopId) params.append("shopId", shopId.toString());
        if (userId) params.append("userId", userId.toString());
        if (withDesc) params.append("withDesc", withDesc.toString());
        if (pubIds?.length) params.append("pubIds", pubIds.join(","));
        if (value) {
          if (value[0] != 0) params.append("fromRange", value[0].toString());
          if (value[1] != 10000000) params.append("toRange", value[1].toString());
        }

        return {
          url: `/api/books?${params.toString()}`,
          validateStatus: (response: Response, result: any) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (response: BooksResponse) => {
        const { content, empty, page, size, totalElements, totalPages } = response;
        const state = booksAdapter.setAll(booksInitialState, content);
        return {
          ...state,
          empty,
          page,
          size,
          totalElements,
          totalPages,
        };
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
        if (!currentArg?.loadMore) booksAdapter.removeAll(currentCache);
        booksAdapter.upsertMany(currentCache, booksSelector.selectAll(newItems));
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
          ? [...result.ids.map((id) => ({ type: "Book" as const, id })), { type: "Book", id: "LIST" }]
          : [{ type: "Book", id: "LIST" }],
    }),
  }),
});
