import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
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

/** Query arg for infinite endpoint (filters only; page comes from pageParam). */
export type BookInfiniteQueryArgs = Omit<BookQueryArgs, "page" | "loadMore">;

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
        return booksAdapter.setAll(
          {
            ...booksInitialState,
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
          ? [...result.ids.map((id) => ({ type: "Book" as const, id })), { type: "Book", id: "LIST" }]
          : [{ type: "Book", id: "LIST" }],
    }),
    getBooksScroll: builder.infiniteQuery<BooksResponse, BookInfiniteQueryArgs | void, number>({
      query: ({ queryArg, pageParam }) => {
        const args = queryArg ?? {};
        const {
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
        } = args;

        const params = new URLSearchParams();
        params.append("pageNo", String(pageParam));
        if (size) params.append("pSize", String(size));
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (keyword) params.append("keyword", keyword);
        if (cateId) params.append("cateId", String(cateId));
        if (rating) params.append("rating", rating);
        if (amount != null) params.append("amount", String(amount));
        if (types?.length) params.append("types", types.join(","));
        if (shopId) params.append("shopId", String(shopId));
        if (userId) params.append("userId", String(userId));
        if (withDesc) params.append("withDesc", String(withDesc));
        if (pubIds?.length) params.append("pubIds", pubIds.join(","));
        if (value) {
          if (value[0] != 0) params.append("fromRange", String(value[0]));
          if (value[1] != 10000000) params.append("toRange", String(value[1]));
        }

        return {
          url: `/api/books?${params.toString()}`,
          validateStatus: (response: Response, result: any) => {
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
              ...result.pages.flatMap((p) => p.content.map((b) => ({ type: "Book" as const, id: b.id }))),
              { type: "Book", id: "LIST" },
            ]
          : [{ type: "Book", id: "LIST" }],
    }),
  }),
});
