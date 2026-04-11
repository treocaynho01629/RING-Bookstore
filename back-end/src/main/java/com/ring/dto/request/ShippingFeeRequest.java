package com.ring.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a shipping fee request as {@link ShippingFeeRequest} to calculate
 * shipping fee.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShippingFeeRequest {

    private Integer fromDistrictId;

    private String fromWardCode;

    private Integer serviceTypeId;

    private Integer ghnShopId;

    private Integer weight;

    private Integer length;

    private Integer width;

    private Integer height;

    private Integer insuranceValue;

    @NotNull(message = "{validation.constraints.not.blank}")
    private Integer toDistrictId;

    @NotNull(message = "{validation.constraints.not.blank}")
    private String toWardCode;
}
