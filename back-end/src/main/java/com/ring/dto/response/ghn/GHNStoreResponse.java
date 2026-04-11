package com.ring.dto.response.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GHNStoreResponse {
    @JsonProperty("_id")
    private Integer id;

    private String name;
    private String phone;
    private String address;

    @JsonProperty("ward_code")
    private String wardCode;

    @JsonProperty("district_id")
    private Integer districtId;

    @JsonProperty("client_id")
    private Integer clientId;

    private Integer status;
}

