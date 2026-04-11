package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.common.CommonUtils;
import com.ring.dto.projection.shops.*;
import com.ring.dto.request.AddressRequest;
import com.ring.dto.request.ShopRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.dto.response.shops.*;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.DashboardMapper;
import com.ring.mapper.ShopMapper;
import com.ring.model.entity.Account;
import com.ring.model.entity.Address;
import com.ring.model.entity.Image;
import com.ring.model.entity.Shop;
import com.ring.repository.AddressRepository;
import com.ring.repository.ShopRepository;
import com.ring.service.ImageService;
import com.ring.service.ShopService;
import com.ring.common.FileUploadUtil;
import lombok.RequiredArgsConstructor;

import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class ShopServiceImpl implements ShopService {

    private final ShopRepository shopRepo;
    private final AddressRepository addressRepo;

    private final ImageService imageService;
    private final MessageService messageService;

    private final ShopMapper shopMapper;
    private final DashboardMapper dashMapper;

    @Cacheable(cacheNames = AppConstants.SHOPS)
    public PagingResponse<ShopDisplayDTO> getDisplayShops(Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir,
            String keyword,
            Boolean followed,
            Account user) {

        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING)
                        ? Sort.by(sortBy).ascending()
                        : Sort.by(sortBy).descending());
        Long userId = user != null ? user.getId() : null;

        // Fetch from database
        Page<IShopDisplay> shopsList = shopRepo.findShopsDisplay(keyword, followed, userId, pageable);
        List<ShopDisplayDTO> shopDTOS = shopsList.map(shopMapper::displayToDTO).toList();
        return new PagingResponse<>(
                shopDTOS,
                shopsList.getTotalPages(),
                shopsList.getTotalElements(),
                shopsList.getSize(),
                shopsList.getNumber(),
                shopsList.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.SHOPS)
    public PagingResponse<ShopDTO> getShops(Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir,
            String keyword,
            Long userId,
            Account user) {

        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING)
                        ? Sort.by(sortBy).ascending()
                        : Sort.by(sortBy).descending());
        boolean isAdmin = CommonUtils.isAuthAdmin();

        Page<IShop> shopsList = shopRepo.findShops(keyword,
                userId != null
                        ? isAdmin ? userId : null
                        : isAdmin ? null : user.getId(),
                pageable);
        List<ShopDTO> shopDTOS = shopsList.map(shopMapper::shopToDTO).toList();
        return new PagingResponse<>(
                shopDTOS,
                shopsList.getTotalPages(),
                shopsList.getTotalElements(),
                shopsList.getSize(),
                shopsList.getNumber(),
                shopsList.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.SHOPS)
    public List<ShopPreviewDTO> getShopsPreview(Account user) {

        List<IShopPreview> shops = shopRepo.findShopsPreview(user.getId());
        List<ShopPreviewDTO> shopDTOS = shops.stream().map(shopMapper::previewToDTO).collect(Collectors.toList());
        return shopDTOS;
    }

    @Cacheable(cacheNames = AppConstants.SHOP_INFO)
    public ShopInfoDTO getShopInfo(Long id, Account user) {

        Long userId = user != null ? user.getId() : null;
        IShopInfo shop = shopRepo.findShopInfoById(id, userId)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.shop") });
                    return new ResourceNotFoundException(errorMsg);
                });
        ShopInfoDTO shopDTO = shopMapper.infoToDTO(shop); // Map to DTO
        return shopDTO;
    }

    @Cacheable(cacheNames = AppConstants.SHOP)
    public ShopDisplayDetailDTO getShopDisplayDetail(Long id, Account user) {

        Long userId = user != null ? user.getId() : null;
        IShopDisplayDetail shop = shopRepo.findShopDisplayDetailById(id, userId)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.shop") });
                    return new ResourceNotFoundException(errorMsg);
                });
        ShopDisplayDetailDTO shopDTO = shopMapper.displayDetailToDTO(shop); // Map to DTO
        return shopDTO;
    }

    @Cacheable(cacheNames = AppConstants.SHOP_DETAIL)
    public ShopDetailDTO getShopDetail(Long id, Account user) {

        IShopDetail shop = shopRepo.findShopDetailById(id, CommonUtils.isAuthAdmin() ? null : user.getId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.shop") });
                    return new ResourceNotFoundException(errorMsg);
                });
        ShopDetailDTO shopDTO = shopMapper.detailToDTO(shop); // Map to DTO
        return shopDTO;
    }

    @Cacheable(cacheNames = AppConstants.SHOP_ANALYTICS)
    public StatDTO getAnalytics(Long userId, Account user) {

        boolean isAdmin = CommonUtils.isAuthAdmin();
        var label = StringUtils.capitalize(messageService.getMessage("label.shop"));
        return dashMapper.statToDTO(shopRepo.getShopAnalytics(isAdmin ? userId : user.getId()),
                AppConstants.SHOPS,
                label);
    }

    @CacheEvict(cacheNames = { AppConstants.SHOP_INFO, AppConstants.SHOP_DETAIL, AppConstants.SHOP }, allEntries = true)
    @Transactional
    public void follow(Long id, Account user) {

        Shop shop = shopRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.shop") });
                    return new ResourceNotFoundException(errorMsg);
                });
        shop.addFollower(user);
        shopRepo.save(shop);
    }

    @CacheEvict(cacheNames = { AppConstants.SHOP_INFO, AppConstants.SHOP_DETAIL, AppConstants.SHOP }, allEntries = true)
    @Transactional
    public void unfollow(Long id, Account user) {

        Shop shop = shopRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.shop") });
                    return new ResourceNotFoundException(errorMsg);
                });
        shop.removeFollower(user);
        shopRepo.save(shop);
    }

    @CacheEvict(cacheNames = { AppConstants.SHOPS, AppConstants.SHOP_ANALYTICS }, allEntries = true)
    @Transactional
    public Shop addShop(ShopRequest request,
            MultipartFile file,
            Account user) {

        // Create address
        AddressRequest addressRequest = request.getAddressRequest();
        var address = Address.builder()
                .name(addressRequest.getName())
                .companyName(addressRequest.getCompanyName())
                .phone(addressRequest.getPhone())
                .detail(addressRequest.getDetail())
                .address(addressRequest.getAddress())
                .type(addressRequest.getType())
                .build();

        Address savedAddress = addressRepo.save(address); // Save address

        // Create new shop
        var shop = Shop.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(user)
                .address(savedAddress)
                .build();

        // Image upload/replace
        shop = this.changeShopPic(file, request.getImage(), shop);

        Shop addedShop = shopRepo.save(shop); // Save to database
        return addedShop;
    }

    @CacheEvict(cacheNames = { AppConstants.SHOP_INFO, AppConstants.SHOP_DETAIL,
            AppConstants.SHOP, AppConstants.SHOPS }, allEntries = true)
    @Transactional
    public Shop updateShop(Long id,
            ShopRequest request,
            MultipartFile file,
            Account user) {

        // Get original shop
        Shop shop = shopRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.shop") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if correct seller or admin
        if (!CommonUtils.isValidShopOwner(shop, user)) {

            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.shop") });
            throw new EntityOwnershipException(errorMsg);
        }

        // Update address
        AddressRequest addressRequest = request.getAddressRequest();
        Address address = shop.getAddress();

        if (address == null)
            address = new Address();

        address.setName(addressRequest.getName());
        address.setCompanyName(addressRequest.getCompanyName());
        address.setPhone(addressRequest.getPhone());
        address.setDetail(addressRequest.getDetail());
        address.setAddress(addressRequest.getAddress());
        address.setType(addressRequest.getType());

        Address updatedAddress = addressRepo.save(address); // Save address

        shop.setAddress(updatedAddress);
        shop.setName(request.getName());
        shop.setDescription(request.getDescription());

        // Image upload/replace
        shop = this.changeShopPic(file, request.getImage(), shop);

        // Update
        Shop updatedShop = shopRepo.save(shop);
        return updatedShop;
    }

    @CacheEvict(cacheNames = { AppConstants.SHOP_INFO, AppConstants.SHOP_DETAIL,
            AppConstants.SHOP, AppConstants.SHOPS, AppConstants.SHOP_ANALYTICS }, allEntries = true)
    public Shop deleteShop(Long id, Account user) {

        Shop shop = shopRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.shop") });
                    return new ResourceNotFoundException(errorMsg);
                });
        // Check if correct seller or admin
        if (!CommonUtils.isValidShopOwner(shop, user)) {

            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.shop") });
            throw new EntityOwnershipException(errorMsg);
        }

        shopRepo.deleteById(id); // Delete from database
        return shop;
    }

    @CacheEvict(cacheNames = { AppConstants.SHOP_INFO, AppConstants.SHOP_DETAIL,
            AppConstants.SHOP, AppConstants.SHOPS, AppConstants.SHOP_ANALYTICS }, allEntries = true)
    @Transactional
    public void deleteShops(List<Long> ids, Account user) {

        List<Long> deleteIds = CommonUtils.isAuthAdmin()
                ? ids
                : shopRepo.findShopIdsByInIdsAndOwner(ids, user.getId());
        shopRepo.deleteAllById(deleteIds);
    }

    @CacheEvict(cacheNames = { AppConstants.SHOP_INFO, AppConstants.SHOP_DETAIL,
            AppConstants.SHOP, AppConstants.SHOPS, AppConstants.SHOP_ANALYTICS }, allEntries = true)
    @Transactional
    public void deleteShopsInverse(String keyword,
            Long userId,
            List<Long> ids,
            Account user) {

        List<Long> deleteIds = shopRepo.findInverseIds(
                keyword,
                CommonUtils.isAuthAdmin() ? userId : user.getId(),
                ids);
        shopRepo.deleteAllById(deleteIds);
    }

    @CacheEvict(cacheNames = { AppConstants.SHOP_INFO, AppConstants.SHOP_DETAIL,
            AppConstants.SHOP, AppConstants.SHOPS, AppConstants.SHOP_ANALYTICS }, allEntries = true)
    @Override
    public void deleteAllShops(Account user) {

        if (CommonUtils.isAuthAdmin()) {
            shopRepo.deleteAll();
        } else {
            shopRepo.deleteAllByOwner(user);
        }
    }

    /**
     * Updates the shop picture. This method allows uploading a new shop picture,
     * replacing an existing one, or removing the shop picture.
     *
     * @param file  the new image file to be uploaded as the shop picture, can be
     *              null for removing the image
     * @param image the identifier of the image, used for determining if an image
     *              should be removed, can be null
     * @param shop  the shop to be updated
     * @return the updated shop with the modified shop picture
     */
    protected Shop changeShopPic(MultipartFile file, String image, Shop shop) {

        // Contain new image >> upload/replace
        if (file != null) {
            if (shop.getImage() != null)
                imageService.deleteImage(shop.getImage().getId()); // Delete old image
            Image savedImage = imageService.upload(file, FileUploadUtil.SHOP_FOLDER); // Upload new image
            shop.setImage(savedImage); // Set new image
            // Remove image
        } else if (image == null) {
            if (shop.getImage() != null)
                imageService.deleteImage(shop.getImage().getId()); // Delete old image
            shop.setImage(null);
        }

        return shop;
    }
}
