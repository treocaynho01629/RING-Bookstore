import { createEntityAdapter } from "@reduxjs/toolkit";
import apiSlice from "@ring/redux/apiSlice";

const ghnAdapter = createEntityAdapter({});
const ghnInitialState = ghnAdapter.getInitialState();

const apiWithEnum = apiSlice.enhanceEndpoints({ addTagTypes: ["Province", "District", "Ward"] });

export const ghnApiSlice = apiWithEnum.injectEndpoints({
  endpoints: (builder) => ({
    getProvinces: builder.query({
      query: () => ({
        url: "/api/ghn/provinces",
        validateStatus: (response, result) => response.status === 200 && !result?.isError,
      }),
      transformResponse: (responseData) => {
        const { code, message, data } = responseData;
        const loadedProvinces = data.map((province) => {
          province.id = province.ProvinceID;
          return province;
        });
        return ghnAdapter.setAll({ ...ghnInitialState, code, message }, loadedProvinces);
      },
      providesTags: (result) =>
        result
          ? [...result.ids.map((id) => ({ type: "Province", id })), { type: "Province", id: "LIST" }]
          : [{ type: "Province", id: "LIST" }],
    }),
    getDistricts: builder.query({
      query: (provinceId) => ({
        url: `/api/ghn/districts?provinceId=${provinceId}`,
        validateStatus: (response, result) => response.status === 200 && !result?.isError,
      }),
      transformResponse: (responseData) => {
        const { code, message, data } = responseData;
        const loadedDistricts = (data ?? []).map((district) => {
          district.id = district.DistrictID;
          return district;
        });
        return ghnAdapter.setAll({ ...ghnInitialState, code, message }, loadedDistricts);
      },
      providesTags: (result) =>
        result
          ? [...result.ids.map((id) => ({ type: "District", id })), { type: "District", id: "LIST" }]
          : [{ type: "District", id: "LIST" }],
    }),
    getWards: builder.query({
      query: (districtId) => ({
        url: `/api/ghn/wards?districtId=${districtId}`,
        validateStatus: (response, result) => response.status === 200 && !result?.isError,
      }),
      transformResponse: (responseData) => {
        const { code, message, data } = responseData;
        const loadedWards = (data ?? []).map((ward) => {
          ward.id = ward.WardCode;
          return ward;
        });
        return ghnAdapter.setAll({ ...ghnInitialState, code, message }, loadedWards);
      },
      providesTags: (result) =>
        result
          ? [...result.ids.map((id) => ({ type: "Ward", id })), { type: "Ward", id: "LIST" }]
          : [{ type: "Ward", id: "LIST" }],
    }),
  }),
});

export const { useGetProvincesQuery, useGetDistrictsQuery, useGetWardsQuery } = ghnApiSlice;
