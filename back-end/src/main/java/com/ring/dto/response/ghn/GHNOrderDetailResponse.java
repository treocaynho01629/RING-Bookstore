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
public class GHNOrderDetailResponse extends BaseGHNResponse {
    private GHNOrderDetail data;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GHNOrderDetail {
        @JsonProperty("order_code")
        private String orderCode;

        @JsonProperty("client_order_code")
        private String clientOrderCode;

        private String status;

        @JsonProperty("created_date")
        private String createdDate;

        private String leadtime;

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
