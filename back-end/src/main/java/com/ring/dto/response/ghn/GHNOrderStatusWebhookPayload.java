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
public class GHNOrderStatusWebhookPayload {
    @JsonProperty("CODAmount")
    private Integer codAmount;

    @JsonProperty("ClientOrderCode")
    private String clientOrderCode;

    @JsonProperty("ConvertedWeight")
    private Integer convertedWeight;

    @JsonProperty("Description")
    private String description;

    @JsonProperty("Fee")
    private Fee fee;

    @JsonProperty("Height")
    private Integer height;

    @JsonProperty("IsPartialReturn")
    private Boolean isPartialReturn;

    @JsonProperty("Length")
    private Integer length;

    @JsonProperty("OrderCode")
    private String orderCode;

    @JsonProperty("PartialReturnCode")
    private String partialReturnCode;

    @JsonProperty("PaymentType")
    private Integer paymentType;

    @JsonProperty("Reason")
    private String reason;

    @JsonProperty("ReasonCode")
    private String reasonCode;

    @JsonProperty("ShopID")
    private Integer shopId;

    @JsonProperty("Status")
    private String status;

    @JsonProperty("Time")
    private String time;

    @JsonProperty("TotalFee")
    private Integer totalFee;

    @JsonProperty("Type")
    private String type;

    @JsonProperty("Warehouse")
    private String warehouse;

    @JsonProperty("Weight")
    private Integer weight;

    @JsonProperty("Width")
    private Integer width;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Fee {
        @JsonProperty("CODFailedFee")
        private Integer codFailedFee;

        @JsonProperty("CODFee")
        private Integer codFee;

        @JsonProperty("Coupon")
        private Integer coupon;

        @JsonProperty("DeliverRemoteAreasFee")
        private Integer deliverRemoteAreasFee;

        @JsonProperty("DocumentReturn")
        private Integer documentReturn;

        @JsonProperty("DoubleCheck")
        private Integer doubleCheck;

        @JsonProperty("Insurance")
        private Integer insurance;

        @JsonProperty("MainService")
        private Integer mainService;

        @JsonProperty("PickRemoteAreasFee")
        private Integer pickRemoteAreasFee;

        @JsonProperty("R2S")
        private Integer r2s;

        @JsonProperty("Return")
        private Integer returnFee;

        @JsonProperty("StationDO")
        private Integer stationDo;

        @JsonProperty("StationPU")
        private Integer stationPu;

        @JsonProperty("Total")
        private Integer total;
    }
}

