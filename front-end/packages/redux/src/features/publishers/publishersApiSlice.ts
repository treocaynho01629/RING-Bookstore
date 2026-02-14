import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { PublisherDTO } from "@ring/shared/models/publisherDTO";
import apiSlice from "../../lib/apiSlice";

export interface PubResponse extends PublisherDTO {
  id: number;
}

export interface PubQueryArgs {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  loadMore?: boolean;
}

/** Query arg for infinite endpoint (filters only; page comes from pageParam). */
export type PubInfiniteQueryArgs = Omit<PubQueryArgs, "page" | "loadMore">;

export interface PubsResponse {
  content: PubResponse[];
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PubsState extends EntityState<PubResponse, number> {
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const pubsAdapter = createEntityAdapter<PubResponse>();
export const pubsSelector = pubsAdapter.getSelectors();
export const pubsInitialState: PubsState = pubsAdapter.getInitialState({
  empty: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
});
const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Publisher"] });

export const publishersApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getPublisher: builder.query<PubResponse, { id: number }>({
      query: (id) => ({
        url: `/api/publishers/${id}`,
        validateStatus: (response: Response, result: any) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error, { id }) => [{ type: "Publisher", id }],
    }),
    getPublishers: builder.query<PubsState, PubQueryArgs>({
      query: (args) => {
        const { page, size, sortBy, sortDir } = args || {};

        //Params
        const params = new URLSearchParams();
        if (page) params.append("pageNo", page.toString());
        if (size) params.append("pSize", size.toString());
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);

        return {
          url: `/api/publishers?${params.toString()}`,
          validateStatus: (response: Response, result: any) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (response: PubsResponse) => {
        const { content, empty, page, size, totalElements, totalPages } = response;
        return pubsAdapter.setAll(
          {
            ...pubsInitialState,
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
          ? [...result.ids.map((id) => ({ type: "Publisher" as const, id })), { type: "Publisher", id: "LIST" }]
          : [{ type: "Publisher", id: "LIST" }],
    }),
    getPublishersScroll: builder.infiniteQuery<PubsResponse, PubInfiniteQueryArgs | void, number>({
      query: ({ queryArg, pageParam }) => {
        const args = queryArg ?? {};
        const { size, sortBy, sortDir } = args;

        const params = new URLSearchParams();
        params.append("pageNo", String(pageParam));
        if (size) params.append("pSize", String(size));
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);

        return {
          url: `/api/publishers?${params.toString()}`,
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
              ...result.pages.flatMap((p) => p.content.map((pub) => ({ type: "Publisher" as const, id: pub.id }))),
              { type: "Publisher", id: "LIST" },
            ]
          : [{ type: "Publisher", id: "LIST" }],
    }),
  }),
});
