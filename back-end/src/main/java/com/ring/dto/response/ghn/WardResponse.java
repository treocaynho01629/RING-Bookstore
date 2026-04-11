package com.ring.dto.response.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents GHN Ward API response item.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WardResponse {

    @JsonProperty("WardCode")
    private String wardCode;

    @JsonProperty("DistrictID")
    private Integer districtID;

    @JsonProperty("WardName")
    private String wardName;
}

