package com.ring.dto.request.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GHNCreateStoreRequest {
    @JsonProperty("district_id")
    private Integer districtId;

    @JsonProperty("ward_code")
    private String wardCode;

    private String name;
    private String phone;
    private String address;
}

