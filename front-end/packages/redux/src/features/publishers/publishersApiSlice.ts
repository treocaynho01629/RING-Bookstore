import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { isEqual } from "lodash-es";
import { defaultSerializeQueryArgs } from "@reduxjs/toolkit/query";
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
        if (!currentArg?.loadMore) pubsAdapter.removeAll(currentCache);
        pubsAdapter.upsertMany(currentCache, pubsSelector.selectAll(newItems));
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
          ? [...result.ids.map((id) => ({ type: "Publisher" as const, id })), { type: "Publisher", id: "LIST" }]
          : [{ type: "Publisher", id: "LIST" }],
    }),
  }),
});
