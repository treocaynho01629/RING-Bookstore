package com.ring.dto.response.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GHNOrderDetailResponse {
    private Integer code;
    private String message;
    private List<Data> data;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Data {
        @JsonProperty("order_code")
        private String orderCode;

        @JsonProperty("client_order_code")
        private String clientOrderCode;

        private String status;

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

        @JsonProperty("cod_amount")
        private Integer codAmount;

        private List<Log> log;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Log {
        private String status;

        @JsonProperty("updated_date")
        private String updatedDate;
    }
}

