import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
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

/** Query arg for infinite endpoint (filters only; page comes from pageParam). */
export type CouponInfiniteQueryArgs = Omit<CouponQueryArgs, "page" | "loadMore">;

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
          validateStatus: (response: Response, result: any) => {
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
      providesTags: (result) =>
        result
          ? [...result.ids.map((id) => ({ type: "Coupon" as const, id })), { type: "Coupon", id: "LIST" }]
          : [{ type: "Coupon", id: "LIST" }],
    }),
    getCouponsScroll: builder.infiniteQuery<CouponsResponse, CouponInfiniteQueryArgs | void, number>({
      query: ({ queryArg, pageParam }) => {
        const args = queryArg ?? {};
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
          size,
          sortBy,
          sortDir,
        } = args;

        const params = new URLSearchParams();
        params.append("pageNo", String(pageParam));
        if (types?.length) params.append("types", types.join(","));
        if (criterias?.length) params.append("criterias", criterias.join(","));
        if (shopId) params.append("shopId", String(shopId));
        if (userId) params.append("userId", String(userId));
        if (byShop != null) params.append("byShop", String(byShop));
        if (showExpired) params.append("showExpired", String(showExpired));
        if (showUsed) params.append("showUsed", String(showUsed));
        if (codes?.length) params.append("codes", codes.join(","));
        if (code) params.append("code", code);
        if (cValue) params.append("cValue", String(cValue));
        if (cQuantity) params.append("cQuantity", String(cQuantity));
        if (size) params.append("pSize", String(size));
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);

        return {
          url: `/api/coupons?${params.toString()}`,
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
              ...result.pages.flatMap((p) => p.content.map((c) => ({ type: "Coupon" as const, id: c.id }))),
              { type: "Coupon", id: "LIST" },
            ]
          : [{ type: "Coupon", id: "LIST" }],
    }),
  }),
});
