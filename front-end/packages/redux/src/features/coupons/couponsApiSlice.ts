import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { defaultSerializeQueryArgs } from "@reduxjs/toolkit/query";
import { isEqual } from "lodash-es";
import { CouponDTO } from "@ring/shared/models/couponDTO";
import apiSlice from "../../lib/apiSlice";

export interface CouponResponse extends CouponDTO {
  id: number;
}

export interface CouponQueryArgs {
  types?: string[];
  criterias?: string[];
  shopId?: number;
  userId?: number;
  byShop?: boolean;
  showExpired?: boolean;
  showUsed?: boolean;
  codes?: string[];
  code?: string;
  cValue?: number;
  cQuantity?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  loadMore?: boolean;
}

export interface CouponsResponse {
  content: CouponResponse[];
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CouponsState extends EntityState<CouponResponse, number> {
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const couponsAdapter = createEntityAdapter<CouponResponse>();
export const couponsSelector = couponsAdapter.getSelectors();
export const couponsInitialState: CouponsState = couponsAdapter.getInitialState({
  empty: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
});
const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Coupon"] });

export const couponsApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<CouponsState, CouponQueryArgs>({
      query: (args) => {
        const {
          types,
          criterias,
          shopId,
          userId,
          byShop,
          showExpired,
          showUsed,
          codes,
          code,
          cValue,
          cQuantity,
          page,
          size,
          sortBy,
          sortDir,
        } = args || {};

        // Params
        const params = new URLSearchParams();
        if (types && types?.length > 0) params.append("types", types?.join(","));
        if (criterias && criterias?.length > 0) params.append("criterias", criterias?.join(","));
        if (shopId) params.append("shopId", shopId.toString());
        if (userId) params.append("userId", userId.toString());
        if (byShop != null) params.append("byShop", byShop.toString());
        if (showExpired) params.append("showExpired", showExpired.toString());
        if (codes && codes?.length > 0) params.append("codes", codes?.join(","));
        if (code) params.append("code", code);
        if (page) params.append("pageNo", page.toString());
        if (size) params.append("pSize", size.toString());
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);
        if (cValue) params.append("cValue", cValue.toString());
        if (cQuantity) params.append("cQuantity", cQuantity.toString());
        if (showUsed) params.append("showUsed", showUsed.toString());

        return {
          url: `/api/coupons?${params.toString()}`,
          validateStatus: (response, result) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (response: CouponsResponse) => {
        const { content, empty, page, size, totalElements, totalPages } = response;
        return couponsAdapter.setAll(
          {
            ...couponsInitialState,
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
            // Load more >> serialize without <pagination>
            const { page, size, ...rest } = mainQuery;
            if (JSON.stringify(rest) === "{}") return endpointName + "Merge";
            return defaultSerializeQueryArgs({
              endpointName: endpointName + "Merge",
              queryArgs: rest,
              endpointDefinition,
            });
          }

          // Serialize like normal
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
        if (!currentArg?.loadMore) couponsAdapter.removeAll(currentCache);
        couponsAdapter.upsertMany(currentCache, couponsSelector.selectAll(newItems));
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
          ? [...result.ids.map((id) => ({ type: "Coupon" as const, id })), { type: "Coupon", id: "LIST" }]
          : [{ type: "Coupon", id: "LIST" }],
    }),
  }),
});
