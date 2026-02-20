import { createEntityAdapter } from "@reduxjs/toolkit";
import apiSlice from "@ring/redux/apiSlice";

const shopsAdapter = createEntityAdapter({});
const initialState = shopsAdapter.getInitialState({
  empty: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
});

export const shopsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getShop: builder.query({
      query: (id) => ({
        url: `/api/shops/${id}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error, id) => [{ type: "Shop", id }],
    }),
    getShopInfo: builder.query({
      query: (id) => ({
        url: `/api/shops/info/${id}`,
        validateStatus: (response, result) => {
          return response.status === 200 && !result?.isError;
        },
      }),
      providesTags: (result, error, id) => [{ type: "Shop", id }],
    }),
    getDisplayShops: builder.query({
      query: (args) => {
        const { page, size, sortBy, sortDir, keyword, followed } = args || {};

        //Params
        const params = new URLSearchParams();
        if (page) params.append("pageNo", page);
        if (size) params.append("pSize", size);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (keyword) params.append("keyword", keyword);
        if (followed) params.append("followed", followed);

        return {
          url: `/api/shops/find?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (responseData) => {
        const { content, empty, page, size, totalElements, totalPages } = responseData;
        return shopsAdapter.setAll(
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
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [{ type: "Shop", id: "LIST" }, ...result.ids.map((id) => ({ type: "Shop", id }))];
        } else return [{ type: "Shop", id: "LIST" }];
      },
    }),
    followShop: builder.mutation({
      query: (id) => ({
        url: `/api/shops/follow/${id}`,
        method: "PUT",
        credentials: "include",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        //Get all Shops cache
        const shopsEntries = shopsApiSlice.util.selectInvalidatedBy(getState(), [{ type: "Shop", id }]);

        const shopsPatches = [];

        shopsEntries
          .filter(({ endpointName }) => endpointName.startsWith("get")) //Filter out other actions except GET
          .forEach(({ endpointName, originalArgs }) => {
            const patchResult = dispatch(
              //Update
              shopsApiSlice.util.updateQueryData(endpointName, originalArgs, (draft) => {
                if (draft.entities != null) {
                  let updatedShop = {
                    ...draft.entities[id],
                    followed: true,
                    totalFollowers: (draft.entities[id].totalFollowers += 1),
                  };
                  shopsAdapter.upsertOne(draft, updatedShop);
                } else {
                  draft.followed = true;
                  draft.totalFollowers++;
                }
              })
            );

            shopsPatches.push(patchResult);
          });
        try {
          await queryFulfilled;
        } catch (error) {
          // Undo patch if request failed
          patchResult.undo();
          shopsPatches.forEach((patch) => patch.undo());
          console.error(error);
        }
      },
    }),
    unfollowShop: builder.mutation({
      query: (id) => ({
        url: `/api/shops/unfollow/${id}`,
        method: "PUT",
        credentials: "include",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        //Get all Shops cache
        const shopsEntries = shopsApiSlice.util.selectInvalidatedBy(getState(), [{ type: "Shop", id }]);

        const shopsPatches = [];

        shopsEntries
          .filter(({ endpointName }) => endpointName.startsWith("get")) //Filter out other actions except GET
          .forEach(({ endpointName, originalArgs }) => {
            const patchResult = dispatch(
              //Update
              shopsApiSlice.util.updateQueryData(endpointName, originalArgs, (draft) => {
                if (draft.entities != null) {
                  let updatedShop = {
                    ...draft.entities[id],
                    followed: false,
                    totalFollowers: (draft.entities[id].totalFollowers -= 1),
                  };
                  shopsAdapter.upsertOne(draft, updatedShop);
                } else {
                  draft.followed = false;
                  draft.totalFollowers--;
                }
              })
            );

            shopsPatches.push(patchResult);
          });

        try {
          await queryFulfilled;
        } catch (error) {
          //Undo patch if request failed
          patchResult.undo();
          shopsPatches.forEach((patch) => patch.undo());
          console.error(error);
        }
      },
    }),
  }),
});

export const {
  useGetShopQuery,
  useGetShopInfoQuery,
  useGetDisplayShopsQuery,
  useFollowShopMutation,
  useUnfollowShopMutation,
  usePrefetch: usePrefetchShops,
} = shopsApiSlice;
