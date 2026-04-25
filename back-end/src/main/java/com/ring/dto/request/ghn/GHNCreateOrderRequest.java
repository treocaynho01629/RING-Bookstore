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
public class GHNCreateOrderRequest {
    @JsonProperty("payment_type_id")
    private Integer paymentTypeId;

    @JsonProperty("required_note")
    private String requiredNote;

    @JsonProperty("client_order_code")
    private String clientOrderCode;

    @JsonProperty("to_name")
    private String toName;

    @JsonProperty("to_phone")
    private String toPhone;

    @JsonProperty("to_address")
    private String toAddress;

    @JsonProperty("to_ward_name")
    private String toWardName;

    @JsonProperty("to_district_name")
    private String toDistrictName;

    @JsonProperty("to_province_name")
    private String toProvinceName;

    @JsonProperty("cod_amount")
    private Integer codAmount;

    private String content;

    private Integer weight;
    private Integer length;
    private Integer width;
    private Integer height;

    @JsonProperty("insurance_value")
    private Integer insuranceValue;

    @JsonProperty("service_type_id")
    private Integer serviceTypeId;

    private String note;
}
