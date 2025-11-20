package com.ring.model.enums;

import lombok.Getter;

import java.math.BigDecimal;

/**
 * Enum representing different types of shipping methods as
 * {@link ShippingType}.
 * Each enum constant contains multiplier associated with a specific shipping
 * type.
 */
@Getter
public enum ShippingType {
    ECONOMY(BigDecimal.ONE),
    STANDARD(BigDecimal.valueOf(0.2)),
    EXPRESS(BigDecimal.valueOf(1.5));

    private final BigDecimal multiplier;

    private ShippingType(BigDecimal multiplier) {
        this.multiplier = multiplier;
    }
}
