package com.ring.dto.request.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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

    @JsonProperty("to_ward_code")
    private String toWardCode;

    @JsonProperty("to_district_id")
    private Integer toDistrictId;

    @JsonProperty("return_phone")
    private String returnPhone;

    @JsonProperty("return_address")
    private String returnAddress;

    @JsonProperty("return_district_id")
    private Integer returnDistrictId;

    @JsonProperty("return_ward_code")
    private String returnWardCode;

    @JsonProperty("cod_amount")
    private Integer codAmount;

    private String content;

    private Integer weight;
    private Integer length;
    private Integer width;
    private Integer height;

    @JsonProperty("insurance_value")
    private Integer insuranceValue;

    @JsonProperty("service_id")
    private Integer serviceId;

    @JsonProperty("service_type_id")
    private Integer serviceTypeId;

    private String coupon;

    private String note;

    @JsonProperty("pick_shift")
    private List<Integer> pickShift;

    private List<Item> items;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Item {
        private String name;
        private String code;
        private Integer quantity;
        private Integer price;
        private Integer length;
        private Integer width;
        private Integer height;
        private Integer weight;
        private Category category;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Category {
        private String level1;
        private String level2;
        private String level3;
    }
}

