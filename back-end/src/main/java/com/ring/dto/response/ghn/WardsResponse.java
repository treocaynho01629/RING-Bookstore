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
public class WardsResponse extends BaseGHNResponse {
    private List<WardItemResponse> data;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class WardItemResponse {

        @JsonProperty("WardCode")
        private String wardCode;

        @JsonProperty("DistrictID")
        private Integer districtID;

        @JsonProperty("WardName")
        private String wardName;
    }
}
