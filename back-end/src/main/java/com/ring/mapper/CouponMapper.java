package com.ring.mapper;

import com.cloudinary.Cloudinary;
import com.ring.common.CloudinaryTransformations;
import com.ring.dto.projection.coupons.ICoupon;
import com.ring.dto.response.coupons.CouponDTO;
import com.ring.dto.response.coupons.CouponDetailDTO;
import com.ring.model.entity.Coupon;
import com.ring.model.entity.CouponDetail;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * A mapper for {@link ICoupon}, {@link Coupon} to {@link CouponDTO}, {@link CouponDetailDTO}.
 */
@RequiredArgsConstructor
@Service
public class CouponMapper {

    private final Cloudinary cloudinary;

    /**
     * Maps a {@link ICoupon} to a {@link CouponDTO}.
     * 
     * @param projection the projection to map
     * @return the mapped {@link CouponDTO}
     */
    public CouponDTO couponToDTO(ICoupon projection) {

        Coupon coupon = projection.getCoupon();
        CouponDetail detail = coupon.getDetail();
        String url = projection.getShopImage() != null 
                ? cloudinary.url()
                        .transformation(CloudinaryTransformations.AVATAR_TRANSFORMATION)
                        .secure(true)
                        .generate(projection.getShopImage().getPublicId())
                : null;

        return new CouponDTO(coupon.getId(),
                coupon.getCode(),
                coupon.getIsUsable(),
                projection.getIsUsed(),
                detail.getType(),
                detail.getCriteria(),
                detail.getDiscount(),
                detail.getMaxDiscount(),
                detail.getAttribute(),
                detail.getUsage(),
                detail.getExpDate(),
                coupon.getShop() != null ? coupon.getShop().getId() : null,
                projection.getShopName(),
                url);
    }

    /**
     * Maps a {@link ICoupon} to a {@link CouponDetailDTO}.
     * 
     * @param projection the projection to map
     * @return the mapped {@link CouponDetailDTO}
     */
    public CouponDetailDTO couponToDetailDTO(ICoupon projection) {

        Coupon coupon = projection.getCoupon();
        CouponDetail detail = coupon.getDetail();

        return new CouponDetailDTO(coupon.getId(),
                coupon.getCode(),
                detail.getType(),
                detail.getCriteria(),
                detail.getAttribute(),
                detail.getMaxDiscount(),
                detail.getDiscount(),
                detail.getExpDate(),
                detail.getUsage(),
                coupon.getShop() != null ? coupon.getShop().getId() : null,
                projection.getShopName());
    }
}
