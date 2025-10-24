package com.ring.controller;

import com.ring.common.AppConstants;
import com.ring.config.CurrentAccount;
import com.ring.dto.request.BannerRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.banners.BannerDTO;
import com.ring.model.entity.Account;
import com.ring.model.entity.Banner;
import com.ring.service.BannerService;
import com.ring.service.impl.MessageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller named {@link BannerController} for handling banner-related
 * operations.
 * Exposes endpoints under "/api/banners".
 */
@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;
    private final MessageService messageService;

    /**
     * Retrieves banners with optional filtering by shop, keyword, and pagination.
     *
     * @param shopId   optional shop ID to filter banners.
     * @param byShop   if true, filters banners created by shops, if false, filters
     *                 banners created by system, null will return both.
     * @param keyword  search keyword for filtering banners.
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param sortBy   sorting field.
     * @param sortDir  sorting direction.
     * @return a {@link ResponseEntity} containing a paginated list of banners.
     */
    @GetMapping
    public ResponseEntity<?> getBanners(@RequestParam(value = "shopId", required = false) Long shopId,
            @RequestParam(value = "byShop", required = false) Boolean byShop,
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "pSize", defaultValue = "5") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        PagingResponse<BannerDTO> banners = bannerService.getBanners(pageNo, 
                pageSize, 
                sortBy, 
                sortDir, 
                keyword, 
                shopId, 
                byShop);
        return new ResponseEntity<>(banners, HttpStatus.OK);
    }

    /**
     * Creates a new banner.
     *
     * @param request  the banner creation request.
     * @param currUser the currently authenticated seller.
     * @return a {@link ResponseEntity} containing the created banner.
     */
    @PostMapping
    @PreAuthorize("hasRole('SELLER') and hasAuthority('create:banner')")
    public ResponseEntity<?> createBanner(@Valid @RequestPart("request") BannerRequest request,
            @RequestPart("image") MultipartFile file,
            @CurrentAccount Account currUser) {

        Banner banner = bannerService.addBanner(request, file, currUser);
        return new ResponseEntity<>(banner, HttpStatus.CREATED);
    }

    /**
     * Updates an existing banner by its ID.
     *
     * @param id       the ID of the banner to update.
     * @param request  the banner update request.
     * @param currUser the currently authenticated seller.
     * @return a {@link ResponseEntity} containing the updated banner.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('update:banner')")
    public ResponseEntity<?> updateBanner(@PathVariable("id") Integer id,
            @Valid @RequestPart("request") BannerRequest request,
            @RequestPart(name = "image", required = false) MultipartFile file,
            @CurrentAccount Account currUser) {

        Banner banner = bannerService.updateBanner(id, request, file, currUser);
        return new ResponseEntity<>(banner, HttpStatus.CREATED);
    }

    /**
     * Deletes a banner by its ID.
     *
     * @param id       the ID of the banner to delete.
     * @param currUser the currently authenticated seller.
     * @return a {@link ResponseEntity} containing a success message.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('delete:banner')")
    public ResponseEntity<?> deleteBanner(@PathVariable("id") Integer id, @CurrentAccount Account currUser) {

        bannerService.deleteBanner(id, currUser);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes multiple banners specified by a list of IDs.
     *
     * @param ids      list of banner IDs to delete.
     * @param currUser the currently authenticated seller.
     * @return a {@link ResponseEntity} containing a success message.
     */
    @DeleteMapping("/delete-multiple")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('delete:banner')")
    public ResponseEntity<?> deleteBanners(@RequestParam("ids") List<Integer> ids,
            @CurrentAccount Account currUser) {

        bannerService.deleteBanners(ids, currUser);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes banners that are NOT in the given list of IDs.
     *
     * @param shopId   optional shop ID for filtering.
     * @param byShop   if true, filters banners created by shops, if false, filters
     *                 banners created by system, null will return both.
     * @param keyword  search keyword for filtering banners.
     * @param ids      list of banner IDs to exclude from deletion.
     * @param currUser the currently authenticated seller.
     * @return a {@link ResponseEntity} containing a success message.
     */
    @DeleteMapping("/delete-inverse")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('delete:banner')")
    public ResponseEntity<?> deleteCouponsInverse(@RequestParam(value = "shopId", required = false) Long shopId,
            @RequestParam(value = "byShop", required = false) Boolean byShop,
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam("ids") List<Integer> ids,
            @CurrentAccount Account currUser) {

        bannerService.deleteBannersInverse(keyword, shopId, byShop, ids, currUser);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes all banners, optionally filtered by shop.
     *
     * @param shopId   optional shop ID for filtering.
     * @param currUser the currently authenticated seller.
     * @return a {@link ResponseEntity} containing a success message.
     */
    @DeleteMapping("/delete-all")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('delete:banner')")
    public ResponseEntity<?> deleteAllBanners(@RequestParam(value = "shopId", required = false) Long shopId,
            @CurrentAccount Account currUser) {

        bannerService.deleteAllBanners(shopId, currUser);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
