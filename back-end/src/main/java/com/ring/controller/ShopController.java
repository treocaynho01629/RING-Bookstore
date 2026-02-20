package com.ring.controller;

import com.ring.config.CurrentAccount;
import com.ring.dto.request.ShopRequest;
import com.ring.dto.response.GenericResponse;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.dto.response.shops.ShopDisplayDTO;
import com.ring.dto.response.shops.ShopDTO;
import com.ring.dto.response.shops.ShopInfoDTO;
import com.ring.dto.response.shops.ShopPreviewDTO;
import com.ring.dto.response.shops.ShopDetailDTO;
import com.ring.dto.response.shops.ShopDisplayDetailDTO;
import com.ring.model.entity.Account;
import com.ring.model.entity.Shop;
import com.ring.service.ShopService;
import com.ring.service.impl.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller named {@link ShopController} for handling shop-related operations.
 * Exposes endpoints under "/api/shops".
 */
@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;
    private final MessageService messageService;

    /**
     * Retrieves shops for display with pagination, sorting, and optional filters.
     *
     * @param keyword  optional keyword to search in shop names or descriptions.
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param sortBy   sorting field.
     * @param sortDir  sorting direction.
     * @param followed optional filter to show only followed shops.
     * @param currUser the current authenticated user.
     * @return a {@link ResponseEntity} containing the list of shops.
     */
    @GetMapping("/find")
    public ResponseEntity<PagingResponse<ShopDisplayDTO>> getDisplayShops(
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "pSize", defaultValue = "15") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @RequestParam(value = "followed", required = false) Boolean followed,
            @CurrentAccount Account currUser) {

        PagingResponse<ShopDisplayDTO> shops = shopService.getDisplayShops(
                pageNo,
                pageSize,
                sortBy,
                sortDir,
                keyword,
                followed,
                currUser);
        return new ResponseEntity<>(shops, HttpStatus.OK);
    }

    /**
     * Retrieves all shops with pagination, sorting, and optional filters.
     *
     * @param keyword  optional keyword to search in shop names or descriptions.
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param sortBy   sorting field.
     * @param sortDir  sorting direction.
     * @param userId   optional filter by user ID.
     * @param currUser the current authenticated seller.
     * @return a {@link ResponseEntity} containing the list of shops.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:shop')")
    public ResponseEntity<PagingResponse<ShopDTO>> getShops(
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "pSize", defaultValue = "15") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @RequestParam(value = "userId", required = false) Long userId,
            @CurrentAccount Account currUser) {

        PagingResponse<ShopDTO> shops = shopService.getShops(
                pageNo,
                pageSize,
                sortBy,
                sortDir,
                keyword,
                userId,
                currUser);
        return new ResponseEntity<>(shops, HttpStatus.OK);
    }

    /**
     * Retrieves a preview of shops for selection.
     *
     * @param currUser the current authenticated seller.
     * @return a {@link ResponseEntity} containing a preview list of shops.
     */
    @GetMapping("/preview")
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:shop')")
    public ResponseEntity<List<ShopPreviewDTO>> getPreviewShops(@CurrentAccount Account currUser) {

        List<ShopPreviewDTO> shops = shopService.getShopsPreview(currUser);
        return new ResponseEntity<>(shops, HttpStatus.OK);
    }

    /**
     * Retrieves detailed information about a specific shop.
     *
     * @param id       the shop ID.
     * @param currUser the current authenticated user.
     * @return a {@link ResponseEntity} containing shop information.
     */
    @GetMapping("info/{id}")
    public ResponseEntity<ShopInfoDTO> getShopInfo(
            @PathVariable("id") Long id,
            @CurrentAccount Account currUser) {

        ShopInfoDTO shopInfo = shopService.getShopInfo(id, currUser);
        return new ResponseEntity<>(shopInfo, HttpStatus.OK);
    }

    /**
     * Retrieves display details for a specific shop.
     *
     * @param id       the shop ID.
     * @param currUser the current authenticated user.
     * @return a {@link ResponseEntity} containing shop display details.
     */
    @GetMapping("{id}")
    public ResponseEntity<ShopDisplayDetailDTO> getShopDisplayDetail(
            @PathVariable("id") Long id,
            @CurrentAccount Account currUser) {

        ShopDisplayDetailDTO shopDisplayDetail = shopService.getShopDisplayDetail(id, currUser);
        return new ResponseEntity<>(shopDisplayDetail, HttpStatus.OK);
    }

    /**
     * Retrieves detailed information for a shop.
     *
     * @param id       the shop ID.
     * @param currUser the current authenticated user.
     * @return a {@link ResponseEntity} containing detailed shop information.
     */
    @GetMapping("/detail/{id}")
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:shop')")
    public ResponseEntity<ShopDetailDTO> getShopDetail(
            @PathVariable("id") Long id,
            @CurrentAccount Account currUser) {

        ShopDetailDTO shopDetail = shopService.getShopDetail(id, currUser);
        return new ResponseEntity<>(shopDetail, HttpStatus.OK);
    }

    /**
     * Retrieves shop analytics.
     *
     * @param userId   the shop owner ID.
     * @param currUser the current authenticated user.
     * @return a {@link ResponseEntity} containing analytics data.
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('SELLER','GUEST') and hasAuthority('read:shop')")
    public ResponseEntity<StatDTO> getShopAnalytics(
            @RequestParam(value = "userId", required = false) Long userId,
            @CurrentAccount Account currUser) {

        StatDTO shopAnalytics = shopService.getAnalytics(userId, currUser);
        return new ResponseEntity<>(shopAnalytics, HttpStatus.OK);
    }

    /**
     * Follows a specific shop.
     *
     * @param id       the shop ID.
     * @param currUser the current authenticated user.
     * @return a {@link ResponseEntity} with a success message.
     */
    @PutMapping("/follow/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('update:profile')")
    public ResponseEntity<?> followShop(
            @PathVariable("id") Long id,
            @CurrentAccount Account currUser) {

        shopService.follow(id, currUser);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.update.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Unfollows a specific shop.
     *
     * @param id       the shop ID.
     * @param currUser the current authenticated user.
     * @return a {@link ResponseEntity} with a success message.
     */
    @PutMapping("/unfollow/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('update:profile')")
    public ResponseEntity<?> unfollowShop(
            @PathVariable("id") Long id,
            @CurrentAccount Account currUser) {

        shopService.unfollow(id, currUser);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.update.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Creates a new shop.
     *
     * @param request  the {@link ShopRequest} data.
     * @param file     optional image for the shop.
     * @param currUser the current authenticated seller.
     * @return a {@link ResponseEntity} with the created shop data.
     */
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('SELLER')  and hasAuthority('create:shop')")
    public ResponseEntity<Shop> createShop(
            @Valid @RequestPart("request") ShopRequest request,
            @RequestPart(name = "image", required = false) MultipartFile file,
            @CurrentAccount Account currUser) {

        Shop shop = shopService.addShop(request, file, currUser);
        return new ResponseEntity<>(shop, HttpStatus.CREATED);
    }

    /**
     * Updates an existing shop.
     *
     * @param id       the shop ID.
     * @param request  the updated {@link ShopRequest} data.
     * @param file     optional new image for the shop.
     * @param currUser the current authenticated seller.
     * @return a {@link ResponseEntity} with the updated shop data.
     */
    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasRole('SELLER')  and hasAuthority('update:shop')")
    public ResponseEntity<Shop> updateShop(
            @PathVariable("id") Long id,
            @Valid @RequestPart("request") ShopRequest request,
            @RequestPart(name = "image", required = false) MultipartFile file,
            @CurrentAccount Account currUser) {

        Shop shop = shopService.updateShop(id, request, file, currUser);
        return new ResponseEntity<>(shop, HttpStatus.CREATED);
    }

    /**
     * Deletes a shop by its ID.
     *
     * @param id       the shop ID.
     * @param currUser the current authenticated seller.
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')  and hasAuthority('delete:shop')")
    public ResponseEntity<?> deleteShop(
            @PathVariable("id") Long id,
            @CurrentAccount Account currUser) {

        shopService.deleteShop(id, currUser);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.delete.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes multiple books by a list of IDs.
     *
     * @param ids      the list of shop IDs to delete.
     * @param currUser the current authenticated seller.
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/delete-multiple")
    @PreAuthorize("hasRole('SELLER')  and hasAuthority('delete:shop')")
    public ResponseEntity<?> deleteCoupons(
            @RequestParam("ids") List<Long> ids,
            @CurrentAccount Account currUser) {

        shopService.deleteShops(ids, currUser);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.delete.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes shops that are NOT in the given list of IDs.
     *
     * @param keyword  optional filter by keyword.
     * @param userId   optional filter by user ID.
     * @param ids      list of shop IDs to exclude from deletion.
     * @param currUser the current authenticated seller.
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/delete-inverse")
    @PreAuthorize("hasRole('SELLER')  and hasAuthority('delete:shop')")
    public ResponseEntity<?> deleteCouponsInverse(
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam("ids") List<Long> ids,
            @CurrentAccount Account currUser) {

        shopService.deleteShopsInverse(
                keyword,
                userId,
                ids,
                currUser);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.delete.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes all shops.
     *
     * @param currUser the current authenticated seller.
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/delete-all")
    @PreAuthorize("hasRole('SELLER')  and hasAuthority('delete:shop')")
    public ResponseEntity<?> deleteAllShops(@CurrentAccount Account currUser) {

        shopService.deleteAllShops(currUser);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.delete.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
