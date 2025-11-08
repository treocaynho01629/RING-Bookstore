package com.ring.service;

import com.ring.dto.request.CartStateRequest;
import com.ring.dto.request.CouponRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.coupons.CouponDTO;
import com.ring.dto.response.coupons.CouponDetailDTO;
import com.ring.dto.response.coupons.CouponDiscountDTO;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.model.entity.Account;
import com.ring.model.entity.Coupon;
import com.ring.model.enums.CouponCriteria;
import com.ring.model.enums.CouponType;

import java.util.List;

/**
 * Service interface for handling coupon-related operations.
 */
public interface CouponService {

    /**
     * Retrieves coupons with pagination and filtering options.
     *
     * @param pageNo       the page number for pagination
     * @param pageSize     the size of each page
     * @param sortBy       the field to sort by
     * @param sortDir      the sorting direction (asc/desc)
     * @param types        the list of coupon types to filter by
     * @param criterias    the list of coupon criteria to filter by
     * @param codes        the list of coupon codes to filter by
     * @param code         the specific coupon code to filter by
     * @param shopId       the shop ID to filter by
     * @param ownerId      the owner ID to filter by
     * @param byShop       whether to filter by shop or not
     * @param showExpired  whether to include expired coupons
     * @param cValue       the cart value filter
     * @param cQuantity    the cart quantity filter
     * @param showUsed     whether to include used coupons
     * @param user         the authenticated user
     * @return a paginated list of {@link CouponDTO} objects
     */
    PagingResponse<CouponDTO> getCoupons(Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir,
            List<CouponType> types,
            List<CouponCriteria> criterias,
            List<String> codes,
            String code,
            Long shopId,
            Long ownerId,
            Boolean byShop,
            Boolean showExpired,
            Double cValue,
            Integer cQuantity,
            Boolean showUsed,
            Account user);

    /**
     * Retrieves detailed coupon information by ID.
     *
     * @param id the ID of the coupon
     * @return the {@link CouponDetailDTO} object
     */
    CouponDetailDTO getCoupon(Long id);

    /**
     * Retrieves a coupon by its code.
     *
     * @param code      the coupon code
     * @param shopId    the shop ID
     * @param cValue    the cart value filter
     * @param cQuantity the cart quantity filter
     * @param user      the authenticated user
     * @return the {@link CouponDTO} object
     */
    CouponDTO getCouponByCode(String code,
            Long shopId,
            Double cValue,
            Integer cQuantity,
            Account user);

    /**
     * Recommends coupons for the given shop IDs.
     *
     * @param shopIds the list of shop IDs
     * @param user    the authenticated user
     * @return a list of recommended {@link CouponDTO} objects
     */
    List<CouponDTO> recommendCoupons(List<Long> shopIds,
            Account user);

    /**
     * Recommends a single coupon for a specific shop and cart state.
     *
     * @param shopId the shop ID
     * @param value  the cart value
     * @param quantity the cart quantity
     * @param user   the authenticated user
     * @return the recommended {@link CouponDTO} object
     */
    CouponDTO recommendCoupon(Long shopId,
            Double value,
            Integer quantity,
            Account user);

    /**
     * Retrieves coupon analytics data.
     *
     * @param shopId the shop ID for analytics
     * @param userId the user ID for analytics
     * @param user   the authenticated user
     * @return the {@link StatDTO} containing analytics data
     */
    StatDTO getAnalytics(Long shopId,
            Long userId,
            Account user);

    /**
     * Creates a new coupon.
     *
     * @param request the coupon creation details
     * @param user    the authenticated user creating the coupon
     * @return the created {@link Coupon} entity
     */
    Coupon addCoupon(CouponRequest request,
            Account user);

    /**
     * Updates an existing coupon by its ID.
     *
     * @param id      the ID of the coupon to update
     * @param request the coupon update details
     * @param user    the authenticated user updating the coupon
     * @return the updated {@link Coupon} entity
     */
    Coupon updateCoupon(Long id,
            CouponRequest request,
            Account user);

    /**
     * Deletes a coupon by its ID.
     *
     * @param id   the ID of the coupon to delete
     * @param user the authenticated user deleting the coupon
     * @return the deleted {@link Coupon} entity
     */
    Coupon deleteCoupon(Long id,
            Account user);

    /**
     * Applies a coupon to a cart state.
     *
     * @param coupon  the coupon to apply
     * @param request the cart state
     * @param user    the authenticated user
     * @return the {@link CouponDiscountDTO} containing discount details
     */
    CouponDiscountDTO applyCoupon(Coupon coupon,
            CartStateRequest request,
            Account user);

    /**
     * Checks if a coupon is expired.
     *
     * @param coupon the coupon to check
     * @return true if the coupon is expired, false otherwise
     */
    boolean isExpired(Coupon coupon);

    /**
     * Deletes multiple coupons by their IDs.
     *
     * @param ids  the list of coupon IDs to delete
     * @param user the authenticated user deleting the coupons
     */
    void deleteCoupons(List<Long> ids,
            Account user);

    /**
     * Deletes coupons that are not in the provided list of IDs.
     *
     * @param types       the list of coupon types to filter by
     * @param criterias   the list of coupon criteria to filter by
     * @param codes       the list of coupon codes to filter by
     * @param code        the specific coupon code to filter by
     * @param shopId      the shop ID to filter by
     * @param userId      the user ID to filter by
     * @param byShop      whether to filter by shop or not
     * @param showExpired whether to include expired coupons
     * @param ids         the list of coupon IDs to exclude from deletion
     * @param user        the authenticated user deleting the coupons
     */
    void deleteCouponsInverse(List<CouponType> types,
            List<CouponCriteria> criterias,
            List<String> codes,
            String code,
            Long shopId,
            Long userId,
            Boolean byShop,
            Boolean showExpired,
            List<Long> ids,
            Account user);

    /**
     * Deletes all coupons for a specific shop.
     *
     * @param shopId the shop ID whose coupons are to be deleted
     * @param user   the authenticated user deleting the coupons
     */
    void deleteAllCoupons(Long shopId, Account user);
}
