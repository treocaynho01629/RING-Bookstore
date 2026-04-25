package com.ring.dto.response.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DistrictsResponse extends BaseGHNResponse {
    private List<DistrictItemResponse> data;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DistrictItemResponse {

        @JsonProperty("DistrictID")
        private Integer districtID;

        @JsonProperty("ProvinceID")
        private Integer provinceID;

        @JsonProperty("DistrictName")
        private String districtName;
    }
}
