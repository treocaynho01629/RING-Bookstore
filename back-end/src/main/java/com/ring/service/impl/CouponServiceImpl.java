package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.common.CommonUtils;
import com.ring.dto.projection.coupons.ICoupon;
import com.ring.dto.request.CartStateRequest;
import com.ring.dto.request.CouponRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.coupons.CouponDTO;
import com.ring.dto.response.coupons.CouponDetailDTO;
import com.ring.dto.response.coupons.CouponDiscountDTO;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.CouponMapper;
import com.ring.mapper.DashboardMapper;
import com.ring.model.entity.Account;
import com.ring.model.entity.Coupon;
import com.ring.model.entity.CouponDetail;
import com.ring.model.entity.Shop;
import com.ring.model.enums.CouponCriteria;
import com.ring.model.enums.CouponType;
import com.ring.model.enums.UserRole;
import com.ring.repository.CouponDetailRepository;
import com.ring.repository.CouponRepository;
import com.ring.repository.ShopRepository;
import com.ring.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service class for managing coupons.
 */
@RequiredArgsConstructor
@Service
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepo;
    private final CouponDetailRepository couponDetailRepo;
    private final ShopRepository shopRepo;

    private final MessageService messageService;

    private final CouponMapper couponMapper;
    private final DashboardMapper dashMapper;

    @Cacheable(cacheNames = AppConstants.COUPONS)
    public PagingResponse<CouponDTO> getCoupons(Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir,
            List<CouponType> types,
            List<CouponCriteria> criterias,
            List<String> codes,
            String code,
            Long shopId,
            Long userId,
            Boolean byShop,
            Boolean showExpired,
            Double cValue,
            Integer cQuantity) {
        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING)
                        ? Sort.by(sortBy).ascending()
                        : Sort.by(sortBy).descending());

        // Fetch from the database
        Page<ICoupon> couponsList = couponRepo.findCoupons(
                types,
                criterias,
                codes,
                code,
                shopId,
                userId,
                byShop,
                showExpired,
                pageable);

        // Check usable
        if (cValue != null || cQuantity != null) {
            CartStateRequest request = CartStateRequest.builder()
                    .value(cValue)
                    .quantity(cQuantity)
                    .shopId(shopId)
                    .build();
            List<CouponDTO> couponDTOS = couponsList.map((projection) -> {
                Coupon coupon = projection.getCoupon();
                coupon.setIsUsable(this.isUsable(coupon, request));
                return couponMapper.couponToDTO(projection);
            }).toList();
            return new PagingResponse<>(
                    couponDTOS,
                    couponsList.getTotalPages(),
                    couponsList.getTotalElements(),
                    couponsList.getSize(),
                    couponsList.getNumber(),
                    couponsList.isEmpty());
        }

        List<CouponDTO> couponDTOS = couponsList.map(couponMapper::couponToDTO).toList();
        return new PagingResponse<>(
                couponDTOS,
                couponsList.getTotalPages(),
                couponsList.getTotalElements(),
                couponsList.getSize(),
                couponsList.getNumber(),
                couponsList.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.COUPON_DETAIL, key = "#id")
    public CouponDetailDTO getCoupon(Long id) {
        ICoupon coupon = couponRepo.findCouponById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.coupon") });
                    return new ResourceNotFoundException(errorMsg);
                });
        return couponMapper.couponToDetailDTO(coupon);
    }

    @Cacheable(cacheNames = AppConstants.COUPONS)
    public CouponDTO getCouponByCode(String code,
            Long shopId,
            Double cValue,
            Integer cQuantity) {
        ICoupon projection = couponRepo.findCouponByCode(code)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.coupon") });
                    return new ResourceNotFoundException(errorMsg);
                });
        if (cValue != null || cQuantity != null) {
            CartStateRequest request = CartStateRequest.builder()
                    .value(cValue)
                    .quantity(cQuantity)
                    .build();
            Coupon coupon = projection.getCoupon();
            coupon.setIsUsable(this.isUsable(coupon, request));
        }
        return couponMapper.couponToDTO(projection);
    }

    @Cacheable(cacheNames = AppConstants.COUPONS)
    public List<CouponDTO> recommendCoupons(List<Long> shopIds) {
        List<ICoupon> couponsList = couponRepo.recommendCoupons(shopIds);
        return couponsList.stream()
                .map(couponMapper::couponToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(cacheNames = AppConstants.COUPON)
    public CouponDTO recommendCoupon(Long shopId, CartStateRequest state) {
        ICoupon coupon = couponRepo.recommendCoupon(shopId, state.getValue(), state.getQuantity())
                .orElse(null);
        if (coupon == null) return null;
        return couponMapper.couponToDTO(coupon);
    }

    @Cacheable(cacheNames = AppConstants.COUPON_ANALYTICS)
    public StatDTO getAnalytics(Long shopId,
            Long userId,
            Account user) {
        boolean isAdmin = CommonUtils.isAuthAdmin();
        var label = StringUtils.capitalize(messageService.getMessage("label.coupon"));
        return dashMapper.statToDTO(couponRepo.getCouponAnalytics(shopId,
                isAdmin ? userId : user.getId()),
                AppConstants.COUPONS,
                label);
    }

    @CacheEvict(cacheNames = { AppConstants.COUPONS, AppConstants.COUPON_ANALYTICS }, allEntries = true)
    @Transactional
    public Coupon addCoupon(CouponRequest request, Account user) {

        // New coupon
        var coupon = Coupon.builder()
                .code(request.getCode())
                .build();

        // Shop validation
        if (request.getShopId() != null) {
            Shop shop = shopRepo.findById(request.getShopId())
                    .orElseThrow(() -> {
                        var errorMsg = messageService.getMessage("exception.not.found",
                                new Object[]{ new DefaultMessageSourceResolvable("label.shop") });
                        return new ResourceNotFoundException(errorMsg);
                    });
            if (!CommonUtils.isValidShopOwner(shop, user)) {
                var errorMsg = messageService.getMessage("exception.ownership",
                        new Object[]{ new DefaultMessageSourceResolvable("label.shop") });
                throw new EntityOwnershipException(errorMsg);
            }
            coupon.setShop(shop);
        } else {
            if (!CommonUtils.isAuthAdmin()) {
                var errorMsg = messageService.getMessage("exception.required.for",
                        new Object[]{ new DefaultMessageSourceResolvable("label.shop"),
                                new DefaultMessageSourceResolvable(UserRole.ROLE_ADMIN.getLabel()) });
                throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                        AppConstants.INVALID_ARGUMENT,
                        errorMsg);
            }
        }
        Coupon addedCoupon = couponRepo.save(coupon); // Save to the database

        // Create coupon details
        var couponDetail = CouponDetail.builder()
                .coupon(addedCoupon)
                .type(request.getType())
                .criteria(request.getCriteria())
                .usage(request.getUsage())
                .expDate(request.getExpireDate())
                .attribute(request.getAttribute())
                .discount(request.getDiscount())
                .maxDiscount(request.getMaxDiscount())
                .build();
        CouponDetail addedDetail = couponDetailRepo.save(couponDetail); // Save details to database

        addedCoupon.setDetail(addedDetail);
        return addedCoupon;
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = { AppConstants.COUPONS,  AppConstants.COUPON_ANALYTICS }, allEntries = true),
            @CacheEvict(cacheNames = AppConstants.COUPON_DETAIL, key = "#id") })
    @Transactional
    public Coupon updateCoupon(Long id, CouponRequest request, Account user) {

        // Get the original coupon
        Coupon coupon = couponRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.coupon") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if seller correct or admin
        if (!CommonUtils.isValidShopOwner(coupon.getShop(), user)) {
            if (!CommonUtils.isAuthAdmin()) {
                var errorMsg = messageService.getMessage("exception.ownership",
                        new Object[]{ new DefaultMessageSourceResolvable("label.coupon") });
                throw new EntityOwnershipException(errorMsg);
            }
        }

        // Shop validation + set
        if (request.getShopId() != null) {
            Shop shop = shopRepo.findById(request.getShopId())
                    .orElseThrow(() -> {
                        var errorMsg = messageService.getMessage("exception.not.found",
                                new Object[]{ new DefaultMessageSourceResolvable("label.shop") });
                        return new ResourceNotFoundException(errorMsg);
                    });
            if (!CommonUtils.isValidShopOwner(shop, user)) {
                var errorMsg = messageService.getMessage("exception.ownership",
                        new Object[]{ new DefaultMessageSourceResolvable("label.shop") });
                throw new EntityOwnershipException(errorMsg);
            }
            coupon.setShop(shop);
        } else {
            if (!CommonUtils.isAuthAdmin()) {
                var errorMsg = messageService.getMessage("exception.required.for",
                        new Object[]{ new DefaultMessageSourceResolvable("label.shop"),
                                new DefaultMessageSourceResolvable(UserRole.ROLE_ADMIN.getLabel()) });
                throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                        AppConstants.INVALID_ARGUMENT,
                        errorMsg);
            }
        }

        // Set new details info
        CouponDetail currDetail = coupon.getDetail();
        currDetail.setType(request.getType());
        currDetail.setCriteria(request.getCriteria());
        currDetail.setUsage(request.getUsage());
        currDetail.setExpDate(request.getExpireDate());
        currDetail.setAttribute(request.getAttribute());
        currDetail.setDiscount(request.getDiscount());
        currDetail.setMaxDiscount(request.getMaxDiscount());
        couponDetailRepo.save(currDetail); // Save new details to database

        coupon.setCode(request.getCode());

        // Update
        return couponRepo.save(coupon);
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = { AppConstants.COUPONS, AppConstants.COUPON_ANALYTICS }, allEntries = true),
            @CacheEvict(cacheNames = AppConstants.COUPON_DETAIL, key = "#id") })
    @Transactional
    public Coupon deleteCoupon(Long id, Account user) {
        Coupon coupon = couponRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.coupon") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if seller correct or admin
        if (!CommonUtils.isValidShopOwner(coupon.getShop(), user)) {
            if (!CommonUtils.isAuthAdmin()) {
                var errorMsg = messageService.getMessage("exception.ownership",
                        new Object[]{ new DefaultMessageSourceResolvable("label.coupon") });
                throw new EntityOwnershipException(errorMsg);
            }
        }

        couponRepo.deleteById(id); // Delete from database
        return coupon;
    }

    @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.COUPONS,
            AppConstants.COUPON_ANALYTICS }, allEntries = true) })
    @Transactional
    public void deleteCoupons(List<Long> ids,
            Account user) {
        List<Long> deleteIds = CommonUtils.isAuthAdmin()
                ? ids
                : couponRepo.findCouponIdsByInIdsAndSeller(ids, user.getId());
        couponRepo.deleteAllById(deleteIds);
    }

    @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.COUPONS,
            AppConstants.COUPON_ANALYTICS }, allEntries = true) })
    @Transactional
    public void deleteCouponsInverse(List<CouponType> types,
            List<CouponCriteria> criterias,
            List<String> codes,
            String code,
            Long shopId,
            Long userId,
            Boolean byShop,
            Boolean showExpired,
            List<Long> ids,
            Account user) {
        List<Long> deleteIds = couponRepo.findInverseIds(
                types,
                criterias,
                codes,
                code,
                shopId,
                CommonUtils.isAuthAdmin() ? userId : user.getId(),
                byShop,
                showExpired,
                ids);
        couponRepo.deleteAllById(deleteIds);
    }

    @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.COUPONS,
            AppConstants.COUPON_ANALYTICS }, allEntries = true) })
    @Transactional
    public void deleteAllCoupons(Long shopId, Account user) {
        if (CommonUtils.isAuthAdmin()) {
            if (shopId != null) {
                couponRepo.deleteAllByShopId(shopId);
            } else {
                couponRepo.deleteAll();
            }
        } else {
            if (shopId != null) {
                couponRepo.deleteAllByShopIdAndShop_Owner(shopId, user);
            } else {
                couponRepo.deleteAllByShop_Owner(user);
            }
        }
    }

    public CouponDiscountDTO applyCoupon(Coupon coupon,
            CartStateRequest request,
            Account user) {
        CouponDetail couponDetail = coupon.getDetail();
        CouponType type = couponDetail.getType();
        CouponCriteria criteria = couponDetail.getCriteria();
        BigDecimal discount = couponDetail.getDiscount();

        if (couponRepo.hasUserUsedCoupon(coupon.getId(), user.getId()))
            return null;

        // Current
        double currValue = request.getValue();
        double shippingFee = request.getShippingFee();
        int currQuantity = request.getQuantity();
        boolean isDiscounted = false;

        // Coupon
        double maxDiscount = couponDetail.getMaxDiscount();
        double attribute = couponDetail.getAttribute();

        // Discount
        double discountValue = 0.0;
        double discountShipping = 0.0;

        // Check conditions & apply
        if (criteria.equals(CouponCriteria.QUANTITY)) {
            isDiscounted = currQuantity >= attribute;
        } else if (criteria.equals(CouponCriteria.VALUE)) {
            isDiscounted = currValue >= attribute;
        }

        if (isDiscounted) {
            if (type.equals(CouponType.PRODUCT)) {
                discountValue = currValue * discount.doubleValue();
            } else if (type.equals(CouponType.SHIPPING)) {
                discountShipping = shippingFee * discount.doubleValue();
            }
        }

        // If not usable
        if (!isDiscounted || (discountValue == 0.0 && discountShipping == 0.0))
            return null;

        // Threshold
        if (isDiscounted && discountValue > maxDiscount)
            discountValue = maxDiscount;
        if (isDiscounted && discountShipping > maxDiscount)
            discountShipping = maxDiscount;

        return new CouponDiscountDTO(discountValue, discountShipping);
    }

    public boolean isExpired(Coupon coupon) {
        CouponDetail couponDetail = coupon.getDetail();
        return (couponDetail.getUsage() <= 0 || couponDetail.getExpDate().isBefore(LocalDate.now()));
    }

    /**
     * Check if coupon is usable.
     * 
     * @param coupon The coupon.
     * @param request The request.
     * @return true if coupon is usable, false otherwise.
     */
    protected boolean isUsable(Coupon coupon, CartStateRequest request) {

        boolean result;

        // Check shop
        if (request.getShopId() != null) {
            result = coupon.getShop() != null && Objects.equals(coupon.getShop().getId(), request.getShopId());
        } else {
            result = coupon.getShop() == null;
        }
        if (!result)
            return result;

        CouponDetail couponDetail = coupon.getDetail();
        CouponCriteria criteria = couponDetail.getCriteria();
        double attribute = couponDetail.getAttribute();

        // Current
        double currValue = request.getValue() != null ? request.getValue() : -1;
        int currQuantity = request.getQuantity() != null ? request.getQuantity() : -1;

        // Check conditions & apply
        if (criteria.equals(CouponCriteria.QUANTITY) && currValue > -1) {
            result = currQuantity >= attribute;
        } else if (criteria.equals(CouponCriteria.VALUE) && currValue > -1) {
            result = currValue >= attribute;
        }

        return result;
    }
}
