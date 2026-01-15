import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import apiSlice from "../../lib/apiSlice";

export interface BannerResponse {
  id: number;
  name: string;
  description: string;
  url: string;
}

export interface BannerQueryArgs {
  shop?: string;
  byShop?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface BannersResponse {
  content: BannerResponse[];
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface BannersState extends EntityState<BannerResponse, number> {
  empty: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const bannersAdapter = createEntityAdapter<BannerResponse>();
export const bannersInitialState: BannersState = bannersAdapter.getInitialState({
  empty: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
});
const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Banner"] });

export const bannersApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<BannersState, BannerQueryArgs>({
      query: (args) => {
        const { shop, byShop, page, size, sortBy, sortDir } = args || {};

        //Params
        const params = new URLSearchParams();
        if (shop) params.append("shopId", shop);
        if (byShop) params.append("byShop", byShop);
        if (page) params.append("pageNo", page.toString());
        if (size) params.append("pSize", size.toString());
        if (sortBy) params.append("sortBy", sortBy);
        if (sortDir) params.append("sortDir", sortDir);

        return {
          url: `/api/banners?${params.toString()}`,
          validateStatus: (response: Response, result: any) => {
            return response.status === 200 && !result?.isError;
          },
        };
      },
      transformResponse: (response: BannersResponse) => {
        const { content, empty, page, size, totalElements, totalPages } = response;
        return bannersAdapter.setAll(
          {
            ...bannersInitialState,
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
          ? [...result.ids.map((id) => ({ type: "Banner" as const, id })), { type: "Banner", id: "LIST" }]
          : [{ type: "Banner", id: "LIST" }],
    }),
  }),
});
