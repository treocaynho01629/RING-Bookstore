package com.ring.dto.response.coupons;

import com.ring.model.enums.CouponCriteria;
import com.ring.model.enums.CouponType;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Represents a coupon response as {@link CouponDTO}.
 */
public record CouponDTO(Long id,
                        String code,
                        Boolean isUsable,
                        Boolean isUsed,
                        CouponType type,
                        CouponCriteria criteria,
                        BigDecimal discount,
                        Double maxDiscount,
                        Double attribute,
                        Short usage,
                        LocalDate expDate,
                        Long shopId,
                        String shopName,
                        String shopImage) {

}
