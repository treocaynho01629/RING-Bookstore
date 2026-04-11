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
public class GHNFeeDataResponse {
    private Integer total;

    @JsonProperty("service_fee")
    private Integer serviceFee;

    @JsonProperty("insurance_fee")
    private Integer insuranceFee;

    @JsonProperty("pick_station_fee")
    private Integer pickStationFee;

    @JsonProperty("coupon_value")
    private Integer couponValue;

    @JsonProperty("r2s_fee")
    private Integer r2sFee;

    @JsonProperty("document_return")
    private Integer documentReturn;

    @JsonProperty("double_check")
    private Integer doubleCheck;

    @JsonProperty("cod_fee")
    private Integer codFee;

    @JsonProperty("pick_remote_areas_fee")
    private Integer pickRemoteAreasFee;

    @JsonProperty("deliver_remote_areas_fee")
    private Integer deliverRemoteAreasFee;

    @JsonProperty("cod_failed_fee")
    private Integer codFailedFee;
}

