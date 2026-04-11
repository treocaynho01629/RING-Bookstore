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
public class GHNFeeRequest {
    @JsonProperty("service_type_id")
    private Integer serviceTypeId;

    @JsonProperty("service_id")
    private Integer serviceId;

    @JsonProperty("from_district_id")
    private Integer fromDistrictId;

    @JsonProperty("from_ward_code")
    private String fromWardCode;

    @JsonProperty("to_district_id")
    private Integer toDistrictId;

    @JsonProperty("to_ward_code")
    private String toWardCode;

    private Integer length;

    private Integer width;

    private Integer height;

    private Integer weight;

    @JsonProperty("insurance_value")
    private Integer insuranceValue;

    private String coupon;

    @JsonProperty("cod_failed_amount")
    private Integer codFailedAmount;

    @JsonProperty("cod_value")
    private Integer codValue;
}
