package com.ring.dto.projection.coupons;

import com.ring.dto.projection.images.IImage;
import com.ring.model.entity.Coupon;

/**
 * Represents a coupon projection as {@link ICoupon}, containing details about the coupon,
 * the shop offering the coupon, and the shop's image.
 */
public interface ICoupon {

    Coupon getCoupon();

    String getShopName();

    IImage getShopImage();

    Boolean getIsUsed();
}
