package com.ring.dto.response.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor;

/**
 * Represents GHN Province API response.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProvinceResponse {

    @JsonProperty("ProvinceID")
    private Integer provinceID;

    @JsonProperty("ProvinceName")
    private String provinceName;

    @JsonProperty("Code")
    private String code;
}
