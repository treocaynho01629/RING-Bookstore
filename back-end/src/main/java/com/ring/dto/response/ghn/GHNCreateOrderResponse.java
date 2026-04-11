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
public class GHNCreateOrderResponse {
    private Integer code;
    private String message;
    private Data data;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Data {
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

        private Fee fee;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Fee {
        private Integer coupon;
        private Integer insurance;

        @JsonProperty("main_service")
        private Integer mainService;

        private Integer r2s;

        @JsonProperty("return")
        private Integer returnFee;

        @JsonProperty("station_do")
        private Integer stationDo;

        @JsonProperty("station_pu")
        private Integer stationPu;
    }
}

