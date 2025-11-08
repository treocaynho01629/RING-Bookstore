package com.ring.controller;

import com.ring.config.CurrentAccount;
import com.ring.dto.request.CouponRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.coupons.CouponDTO;
import com.ring.dto.response.coupons.CouponDetailDTO;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.model.entity.Account;
import com.ring.model.entity.Coupon;
import com.ring.model.enums.CouponCriteria;
import com.ring.model.enums.CouponType;
import com.ring.service.CouponService;
import com.ring.service.impl.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller named {@link CouponController} for handling coupon-related
 * operations.
 * Exposes endpoints under "/api/coupons".
 */
@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final MessageService messageService;

    /**
     * Retrieves a list of coupons with optional filters and pagination.
     *
     * @param types         types of coupons to filter.
     * @param criterias     criteria of coupons to filter.
     * @param shopId        shop ID to filter coupons by.
     * @param userId        shop owner ID to filter coupons by.
     * @param byShop        if true, filters coupons created by shops, if false,
     *                      filters coupons created by system, null will return
     *                      both.
     * @param showExpired   if true, includes expired coupons.
     * @param codes         list of coupon codes to filter.
     * @param code          a single code to match.
     * @param checkValue    optional minimum value to validate.
     * @param checkQuantity optional minimum quantity to validate.
     * @param pageSize      size of each page.
     * @param pageNo        page number.
     * @param sortBy        sorting field.
     * @param sortDir       sorting direction.
     * @param showUsed      whether to include used coupons.
     * @param user          the authenticated user.
     * @return paginated and filtered list of coupons.
     */
    @GetMapping
    public ResponseEntity<PagingResponse<CouponDTO>> getCoupons(
            @RequestParam(value = "types", required = false) List<CouponType> types,
            @RequestParam(value = "criterias", required = false) List<CouponCriteria> criterias,
            @RequestParam(value = "shopId", required = false) Long shopId,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "byShop", required = false) Boolean byShop,
            @RequestParam(value = "showExpired", defaultValue = "false") Boolean showExpired,
            @RequestParam(value = "codes", required = false) List<String> codes,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "cValue", required = false) Double checkValue,
            @RequestParam(value = "cQuantity", required = false) Integer checkQuantity,
            @RequestParam(value = "pSize", defaultValue = "5") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "detail.discount") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @RequestParam(value = "showUsed", defaultValue = "false") Boolean showUsed,
            @CurrentAccount Account user) {

        PagingResponse<CouponDTO> coupons = couponService.getCoupons(
                pageNo,
                pageSize,
                sortBy,
                sortDir,
                types,
                criterias,
                codes,
                code,
                shopId,
                userId,
                byShop,
                showExpired,
                checkValue,
                checkQuantity,
                showUsed,
                user);
        return new ResponseEntity<>(coupons, HttpStatus.OK);
    }

    /**
     * Retrieves a coupon by its ID.
     *
     * @param id the coupon ID.
     * @return the coupon data.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:coupon')")
    public ResponseEntity<CouponDetailDTO> getCoupon(@PathVariable("id") Long id) {

        CouponDetailDTO coupon = couponService.getCoupon(id);
        return new ResponseEntity<>(coupon, HttpStatus.OK);
    }

    /**
     * Retrieves a coupon by its code with optional value/quantity validation.
     *
     * @param code          the coupon code.
     * @param checkValue    optional value to validate against.
     * @param checkQuantity optional quantity to validate against.
     * @return the matching coupon.
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<CouponDTO> getCoupon(
            @PathVariable("code") String code,
            @RequestParam(value = "shopId", required = false) Long shopId,
            @RequestParam(value = "cValue", required = false) Double checkValue,
            @RequestParam(value = "cQuantity", required = false) Integer checkQuantity,
            @CurrentAccount Account user) {

        CouponDTO coupon = couponService.getCouponByCode(code, shopId, checkValue, checkQuantity, user);
        return new ResponseEntity<>(coupon, HttpStatus.OK);
    }

    /**
     * Recommends coupons based on provided shop IDs.
     *
     * @param shopIds list of shop IDs.
     * @param checkValue  the cart value.
     * @param checkQuantity the cart quantity.
     * @param user    the authenticated user.
     * @return recommended coupons for the shops.
     */
    @GetMapping("/recommend")
    public ResponseEntity<List<CouponDTO>> recommendCoupons(
            @RequestParam("shopIds") List<Long> shopIds,
            @CurrentAccount Account user) {

        List<CouponDTO> coupons = couponService.recommendCoupons(shopIds, user);
        return new ResponseEntity<>(coupons, HttpStatus.OK);
    }

    /**
     * Provides analytics for coupons of a specific shop.
     *
     * @param shopId   optional shop ID.
     * @param userId   the shop owner ID.
     * @param currUser the current authenticated user.
     * @return analytics data.
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:coupon')")
    public ResponseEntity<StatDTO> getCouponAnalytics(@RequestParam(value = "shopId", required = false) Long shopId,
            @RequestParam(value = "userId", required = false) Long userId,
            @CurrentAccount Account currUser) {

        StatDTO analytics = couponService.getAnalytics(shopId, userId, currUser);
        return new ResponseEntity<>(analytics, HttpStatus.OK);
    }

    /**
     * Creates a new coupon.
     *
     * @param request  coupon data.
     * @param currUser the current authenticated seller.
     * @return the created coupon.
     */
    @PostMapping
    @PreAuthorize("hasRole('SELLER') and hasAuthority('create:coupon')")
    public ResponseEntity<Coupon> createCoupon(
            @RequestBody @Valid CouponRequest request,
            @CurrentAccount Account currUser) {

        Coupon coupon = couponService.addCoupon(request, currUser);
        return new ResponseEntity<>(coupon, HttpStatus.CREATED);
    }

    /**
     * Updates an existing coupon by its ID.
     *
     * @param id       the coupon ID.
     * @param request  updated coupon data.
     * @param currUser the current authenticated seller.
     * @return the updated coupon.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('update:coupon')")
    public ResponseEntity<Coupon> updateCoupon(
            @PathVariable("id") Long id,
            @RequestBody @Valid CouponRequest request,
            @CurrentAccount Account currUser) {

        Coupon coupon = couponService.updateCoupon(id, request, currUser);
        return new ResponseEntity<>(coupon, HttpStatus.CREATED);
    }

    /**
     * Deletes a coupon by its ID.
     *
     * @param id       the coupon ID.
     * @param currUser the current authenticated seller.
     * @return success message.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('delete:coupon')")
    public ResponseEntity<String> deleteCoupon(
            @PathVariable("id") Long id, 
            @CurrentAccount Account currUser) {

        couponService.deleteCoupon(id, currUser);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes multiple coupons by a list of IDs.
     *
     * @param ids      list of coupon IDs to delete.
     * @param currUser the current authenticated seller.
     * @return success message.
     */
    @DeleteMapping("/delete-multiple")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('delete:coupon')")
    public ResponseEntity<String> deleteCoupons(
            @RequestParam("ids") List<Long> ids,
            @CurrentAccount Account currUser) {

        couponService.deleteCoupons(ids, currUser);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes all coupons except those specified by a list of IDs.
     *
     * @param types       optional filter for coupon types.
     * @param criterias   optional filter for coupon criteria.
     * @param shopId      optional shop ID.
     * @param userId      shop owner ID to filter coupons by.
     * @param byShop      if true, filters coupons created by shops, if false,
     *                    filters coupons created by system, null will return both.
     * @param showExpired whether to include expired coupons.
     * @param code        optional coupon code.
     * @param codes       optional list of coupon codes.
     * @param ids         list of IDs to exclude from deletion.
     * @param currUser    the current authenticated seller.
     * @return success message.
     */
    @DeleteMapping("/delete-inverse")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('delete:coupon')")
    public ResponseEntity<String> deleteCouponsInverse(
            @RequestParam(value = "types", required = false) List<CouponType> types,
            @RequestParam(value = "criterias", required = false) List<CouponCriteria> criterias,
            @RequestParam(value = "shopId", required = false) Long shopId,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "byShop", required = false) Boolean byShop,
            @RequestParam(value = "showExpired", required = false) Boolean showExpired,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "codes", required = false) List<String> codes,
            @RequestParam("ids") List<Long> ids,
            @CurrentAccount Account currUser) {

        couponService.deleteCouponsInverse(
                types,
                criterias,
                codes,
                code,
                shopId,
                userId,
                byShop,
                showExpired,
                ids,
                currUser);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes all coupons for a specific shop or globally.
     *
     * @param shopId   optional shop ID.
     * @param currUser the current authenticated seller.
     * @return success message.
     */
    @DeleteMapping("/delete-all")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('delete:coupon')")
    public ResponseEntity<String> deleteAllCoupons(
            @RequestParam(value = "shopId", required = false) Long shopId,
            @CurrentAccount Account currUser) {
                
        couponService.deleteAllCoupons(shopId, currUser);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
