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
public class GHNUpdateOrderRequest {
    @JsonProperty("order_code")
    private String orderCode;

    @JsonProperty("client_order_code")
    private String clientOrderCode;

    private String note;

    @JsonProperty("cod_amount")
    private Integer codAmount;

    private Integer weight;
    private Integer length;
    private Integer width;
    private Integer height;

    @JsonProperty("insurance_value")
    private Integer insuranceValue;

    @JsonProperty("payment_type_id")
    private Integer paymentTypeId;

    @JsonProperty("required_note")
    private String requiredNote;

    @JsonProperty("to_name")
    private String toName;

    @JsonProperty("to_phone")
    private String toPhone;

    @JsonProperty("to_address")
    private String toAddress;

    @JsonProperty("to_ward_code")
    private String toWardCode;

    @JsonProperty("to_district_id")
    private Integer toDistrictId;
}
