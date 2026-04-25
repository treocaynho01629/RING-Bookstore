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
public class GHNCreateOrderResponse extends GHNBasicResponse {
    private GHNCreateOrder data;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GHNCreateOrder {
        @JsonProperty("expected_delivery_time")
        private String expectedDeliveryTime;

        @JsonProperty("order_code")
        private String orderCode;

        @JsonProperty("sort_code")
        private String sortCode;

        @JsonProperty("total_fee")
        private Integer totalFee;

        @JsonProperty("trans_type")
        private String transType;
    }
}
