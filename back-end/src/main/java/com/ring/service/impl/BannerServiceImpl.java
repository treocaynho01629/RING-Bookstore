package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.common.CommonUtils;
import com.ring.dto.projection.banners.IBanner;
import com.ring.dto.request.BannerRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.banners.BannerDTO;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.BannerMapper;
import com.ring.model.entity.Account;
import com.ring.model.entity.Banner;
import com.ring.model.entity.Image;
import com.ring.model.entity.Shop;
import com.ring.model.enums.UserRole;
import com.ring.repository.BannerRepository;
import com.ring.repository.ShopRepository;
import com.ring.service.BannerService;
import com.ring.service.ImageService;
import com.ring.common.FileUploadUtil;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service class for managing banners.
 */
@RequiredArgsConstructor
@Service
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepo;
    private final ShopRepository shopRepo;

    private final ImageService imageService;
    private final MessageService messageService;

    private final BannerMapper bannerMapper;

    @Cacheable(cacheNames = AppConstants.BANNERS)
    public PagingResponse<BannerDTO> getBanners(Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir,
            String keyword,
            Long shopId,
            Boolean byShop) {
        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING)
                        ? Sort.by(sortBy).ascending()
                        : Sort.by(sortBy).descending());

        // Fetch from the database
        Page<IBanner> bannersList = bannerRepo.findBanners(keyword, shopId, byShop, pageable);
        List<BannerDTO> bannerDTOS = bannersList.map(bannerMapper).toList();
        return new PagingResponse<>(bannerDTOS,
                bannersList.getTotalPages(),
                bannersList.getTotalElements(),
                bannersList.getSize(),
                bannersList.getNumber(),
                bannersList.isEmpty());
    }

    @CacheEvict(cacheNames = AppConstants.BANNERS, allEntries = true)
    @Transactional
    public Banner addBanner(BannerRequest request,
            MultipartFile file,
            Account user) {

        // New banner
        var banner = Banner.builder()
                .name(request.getName())
                .description(request.getDescription())
                .url(request.getUrl())
                .build();

        // Shop validation
        validateShop(request, user, banner);

        // Image upload
        banner = this.changeBannerPic(file, banner);

        return bannerRepo.save(banner); // Save to the database
    }

    @Caching(evict = { @CacheEvict(cacheNames = AppConstants.BANNERS, allEntries = true),
            @CacheEvict(cacheNames = AppConstants.BANNER_DETAIL, key = "#id") })

    @Transactional
    public Banner updateBanner(Integer id,
            BannerRequest request,
            MultipartFile file,
            Account user) {

        // Get the original banner
        Banner banner = bannerRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.banner") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if seller correct or admin
        if (!CommonUtils.isValidShopOwner(banner.getShop(), user)) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[]{ new DefaultMessageSourceResolvable("label.banner") });
            throw new EntityOwnershipException(errorMsg);
        }

        // Shop validation + set
        validateShop(request, user, banner);

        // Set new info
        banner.setName(request.getName());
        banner.setDescription(request.getDescription());
        banner.setUrl(request.getUrl());

        // Replace image
        banner = this.changeBannerPic(file, banner);

        // Update
        return bannerRepo.save(banner);
    }

    private void validateShop(BannerRequest request, Account user, Banner banner) {
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
            banner.setShop(shop);
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
    }

    @Caching(evict = { @CacheEvict(cacheNames = AppConstants.BANNERS, allEntries = true),
            @CacheEvict(cacheNames = AppConstants.BANNER_DETAIL, key = "#id") })
    @Transactional
    public Banner deleteBanner(Integer id,
            Account user) {

        Banner banner = bannerRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.banner") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if seller correct or admin
        if (!CommonUtils.isValidShopOwner(banner.getShop(), user)) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[]{ new DefaultMessageSourceResolvable("label.banner") });
            throw new EntityOwnershipException(errorMsg);
        }

        bannerRepo.deleteById(id); // Delete from database
        return banner;
    }

    @Caching(evict = { @CacheEvict(cacheNames = AppConstants.BANNERS, allEntries = true) })
    @Transactional
    public void deleteBanners(List<Integer> ids,
            Account user) {
        List<Integer> deleteIds = CommonUtils.isAuthAdmin() 
            ? ids 
            : bannerRepo.findBannerIdsByInIdsAndOwner(ids, user.getId());
        bannerRepo.deleteAllById(deleteIds);
    }

    @Caching(evict = { @CacheEvict(cacheNames = AppConstants.BANNERS, allEntries = true) })
    @Transactional
    public void deleteBannersInverse(String keyword,
            Long shopId,
            Boolean byShop,
            List<Integer> ids,
            Account user) {
        List<Integer> deleteIds = bannerRepo.findInverseIds(
                keyword,
                shopId,
                byShop,
                CommonUtils.isAuthAdmin() ? null : user.getId(),
                ids);
        bannerRepo.deleteAllById(deleteIds);
    }

    @Caching(evict = { @CacheEvict(cacheNames = AppConstants.BANNERS, allEntries = true) })
    @Transactional
    public void deleteAllBanners(Long shopId,
            Account user) {
        if (CommonUtils.isAuthAdmin()) {
            if (shopId != null) {
                bannerRepo.deleteAllByShopId(shopId);
            } else {
                bannerRepo.deleteAll();
            }
        } else {
            if (shopId != null) {
                bannerRepo.deleteAllByShopIdAndShop_Owner(shopId, user);
            } else {
                bannerRepo.deleteAllByShop_Owner(user);
            }
        }
    }

    /**
     * Change the banner picture.
     *
     * @param file The file to change.
     * @param banner The banner to change.
     * @return The changed banner.
     */
    protected Banner changeBannerPic(MultipartFile file, Banner banner) {
        if (file != null) {
            if (banner.getImage() != null)
                imageService.deleteImage(banner.getImage().getId()); // Delete old image
            Image savedImage = imageService.upload(file, FileUploadUtil.BANNER_FOLDER); // Upload new image
            banner.setImage(savedImage); // Set new image
        }

        return banner;
    }
}
