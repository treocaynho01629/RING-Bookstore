package com.ring.mapper;

import com.cloudinary.Cloudinary;
import com.ring.common.CloudinaryTransformations;
import com.ring.dto.projection.coupons.ICoupon;
import com.ring.dto.response.coupons.CouponDTO;
import com.ring.dto.response.coupons.CouponDetailDTO;
import com.ring.model.entity.Coupon;
import com.ring.model.entity.CouponDetail;
import com.ring.model.enums.CouponType;
import com.ring.service.impl.MessageService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * A mapper for {@link ICoupon}, {@link Coupon} to {@link CouponDTO}, {@link CouponDetailDTO}.
 */
@RequiredArgsConstructor
@Service
public class CouponMapper {

    private final Cloudinary cloudinary;
    private final MessageService messageService;

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

        // Detail stuff
        String summary = messageService.getMessage("message.coupon.summary", new Object[] {
            CouponType.SHIPPING.equals(detail.getType()) ? 1 : 0,
            detail.getDiscount(),
            detail.getMaxDiscount()
        });
        String condition =
                CouponType.MIN_AMOUNT.equals(detail.getType()) ?
                        messageService.getMessage("message.coupon.condition.amount", new Object[] { detail.getAttribute() }) :
                        messageService.getMessage("message.coupon.condition.value", new Object[] { detail.getAttribute() });

        return new CouponDTO(coupon.getId(),
                coupon.getCode(),
                coupon.getIsUsable(),
                coupon.getIsUsed(),
                detail.getType(),
                summary,
                condition,
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
                detail.getAttribute(),
                detail.getMaxDiscount(),
                detail.getDiscount(),
                detail.getExpDate(),
                detail.getUsage(),
                coupon.getShop() != null ? coupon.getShop().getId() : null,
                projection.getShopName());
    }
}
