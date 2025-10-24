package com.ring.service;

import com.ring.dto.request.ShopRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.dto.response.shops.*;
import com.ring.model.entity.Account;
import com.ring.model.entity.Shop;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for handling shop-related operations.
 */
public interface ShopService {

    /**
     * Retrieves display shops with pagination and filtering options.
     *
     * @param pageNo   the page number for pagination
     * @param pageSize the size of each page
     * @param sortBy   the field to sort by
     * @param sortDir  the sorting direction (asc/desc)
     * @param keyword  the search keyword to filter shops
     * @param followed whether to filter by followed shops only
     * @param user     the authenticated user
     * @return a paginated list of {@link ShopDisplayDTO} objects
     */
    PagingResponse<ShopDisplayDTO> getDisplayShops(Integer pageNo,
                                                   Integer pageSize,
                                                   String sortBy,
                                                   String sortDir,
                                                   String keyword,
                                                   Boolean followed,
                                                   Account user);

    /**
     * Retrieves shops with pagination and filtering options.
     *
     * @param pageNo   the page number for pagination
     * @param pageSize the size of each page
     * @param sortBy   the field to sort by
     * @param sortDir  the sorting direction (asc/desc)
     * @param keyword  the search keyword to filter shops
     * @param userId   the user ID to filter by
     * @param user     the authenticated user
     * @return a paginated list of {@link ShopDTO} objects
     */
    PagingResponse<ShopDTO> getShops(Integer pageNo,
                                     Integer pageSize,
                                     String sortBy,
                                     String sortDir,
                                     String keyword,
                                     Long userId,
                                     Account user);

    /**
     * Retrieves shop previews for a user.
     *
     * @param user the authenticated user
     * @return a list of {@link ShopPreviewDTO} objects
     */
    List<ShopPreviewDTO> getShopsPreview(Account user);

    /**
     * Retrieves shop information by ID.
     *
     * @param id   the ID of the shop
     * @param user the authenticated user
     * @return the {@link ShopInfoDTO} object
     */
    ShopInfoDTO getShopInfo(Long id,
                            Account user);

    /**
     * Retrieves detailed shop display information by ID.
     *
     * @param id   the ID of the shop
     * @param user the authenticated user
     * @return the {@link ShopDisplayDetailDTO} object
     */
    ShopDisplayDetailDTO getShopDisplayDetail(Long id,
                                              Account user);

    /**
     * Retrieves detailed shop information by ID.
     *
     * @param id   the ID of the shop
     * @param user the authenticated user
     * @return the {@link ShopDetailDTO} object
     */
    ShopDetailDTO getShopDetail(Long id,
                                Account user);

    /**
     * Retrieves shop analytics data.
     *
     * @param userId the user ID for analytics
     * @param user   the authenticated user
     * @return the {@link StatDTO} containing analytics data
     */
    StatDTO getAnalytics(Long userId,
            Account user);

    /**
     * Follows a shop.
     *
     * @param id   the ID of the shop to follow
     * @param user the authenticated user
     */
    void follow(Long id,
            Account user);

    /**
     * Unfollows a shop.
     *
     * @param id   the ID of the shop to unfollow
     * @param user the authenticated user
     */
    void unfollow(Long id,
            Account user);

    /**
     * Creates a new shop.
     *
     * @param request the shop creation details
     * @param file    the shop logo image file
     * @param user    the authenticated user creating the shop
     * @return the created {@link Shop} entity
     */
    Shop addShop(ShopRequest request,
            MultipartFile file,
            Account user);

    /**
     * Updates an existing shop by its ID.
     *
     * @param id      the ID of the shop to update
     * @param request the shop update details
     * @param file    the new shop logo image file (optional)
     * @param user    the authenticated user updating the shop
     * @return the updated {@link Shop} entity
     */
    Shop updateShop(Long id,
            ShopRequest request,
            MultipartFile file,
            Account user);

    /**
     * Deletes a shop by its ID.
     *
     * @param id   the ID of the shop to delete
     * @param user the authenticated user deleting the shop
     * @return the deleted {@link Shop} entity
     */
    Shop deleteShop(Long id,
            Account user);

    /**
     * Deletes multiple shops by their IDs.
     *
     * @param ids  the list of shop IDs to delete
     * @param user the authenticated user deleting the shops
     */
    void deleteShops(List<Long> ids,
            Account user);

    /**
     * Deletes shops that are not in the provided list of IDs.
     *
     * @param keyword the search keyword to filter shops
     * @param userId  the user ID to filter by
     * @param ids     the list of shop IDs to exclude from deletion
     * @param user    the authenticated user deleting the shops
     */
    void deleteShopsInverse(String keyword,
            Long userId,
            List<Long> ids,
            Account user);

    /**
     * Deletes all shops for a user.
     *
     * @param user the authenticated user deleting the shops
     */
    void deleteAllShops(Account user);
}
