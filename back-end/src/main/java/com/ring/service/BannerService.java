package com.ring.service;

import com.ring.dto.request.BannerRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.banners.BannerDTO;
import com.ring.model.entity.Account;
import com.ring.model.entity.Banner;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for handling banner-related operations.
 */
public interface BannerService {

    /**
     * Retrieves banners with pagination and filtering options.
     *
     * @param pageNo    the page number for pagination
     * @param pageSize  the size of each page
     * @param sortBy    the field to sort by
     * @param sortDir   the sorting direction (asc/desc)
     * @param keyword   the search keyword to filter banners
     * @param shopId    the shop ID to filter banners by shop
     * @param byShop    whether to filter by shop or not
     * @return a paginated list of {@link BannerDTO} objects
     */
    PagingResponse<BannerDTO> getBanners(Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir,
            String keyword,
            Long shopId,
            Boolean byShop);

    /**
     * Creates a new banner.
     *
     * @param request the banner creation details
     * @param file    the banner image file
     * @param user    the authenticated user creating the banner
     * @return the created {@link Banner} entity
     */
    Banner addBanner(BannerRequest request,
            MultipartFile file,
            Account user);

    /**
     * Updates an existing banner by its ID.
     *
     * @param id      the ID of the banner to update
     * @param request the banner update details
     * @param file    the new banner image file (optional)
     * @param user    the authenticated user updating the banner
     * @return the updated {@link Banner} entity
     */
    Banner updateBanner(Integer id,
            BannerRequest request,
            MultipartFile file,
            Account user);

    /**
     * Deletes a banner by its ID.
     *
     * @param id   the ID of the banner to delete
     * @param user the authenticated user deleting the banner
     * @return the deleted {@link Banner} entity
     */
    Banner deleteBanner(Integer id,
            Account user);

    /**
     * Deletes multiple banners by their IDs.
     *
     * @param ids  the list of banner IDs to delete
     * @param user the authenticated user deleting the banners
     */
    void deleteBanners(List<Integer> ids,
            Account user);

    /**
     * Deletes banners that are not in the provided list of IDs.
     *
     * @param keyword the search keyword to filter banners
     * @param shopId  the shop ID to filter banners by shop
     * @param byShop  whether to filter by shop or not
     * @param ids     the list of banner IDs to exclude from deletion
     * @param user    the authenticated user deleting the banners
     */
    void deleteBannersInverse(String keyword,
            Long shopId,
            Boolean byShop,
            List<Integer> ids,
            Account user);

    /**
     * Deletes all banners for a specific shop.
     *
     * @param shopId the shop ID whose banners are to be deleted
     * @param user   the authenticated user deleting the banners
     */
    void deleteAllBanners(Long shopId,
            Account user);
}
