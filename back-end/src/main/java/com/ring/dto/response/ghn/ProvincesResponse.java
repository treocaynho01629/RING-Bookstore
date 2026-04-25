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
public class ProvincesResponse extends BaseGHNResponse {
    private List<ProvinceItemResponse> data;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProvinceItemResponse {

        @JsonProperty("ProvinceID")
        private Integer provinceID;

        @JsonProperty("ProvinceName")
        private String provinceName;
    }
}