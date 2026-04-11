package com.ring.dto.response.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents GHN District API response item.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DistrictResponse {

    @JsonProperty("DistrictID")
    private Integer districtID;

    @JsonProperty("ProvinceID")
    private Integer provinceID;

    @JsonProperty("DistrictName")
    private String districtName;

    @JsonProperty("Code")
    private String code;
}

