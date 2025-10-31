package com.ring.dto.response.coupons;

import com.ring.model.enums.CouponCriteria;
import com.ring.model.enums.CouponType;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Represents a coupon detail response as {@link CouponDetailDTO}.
 */
public record CouponDetailDTO(Long id,
                              String code,
                              CouponType type,
                              CouponCriteria criteria,
                              Double attribute,
                              Double maxDiscount,
                              BigDecimal discount,
                              LocalDate expDate,
                              Short usage,
                              Long shopId,
                              String shopName) {

}
