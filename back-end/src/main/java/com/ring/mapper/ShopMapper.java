package com.ring.mapper;

import com.cloudinary.Cloudinary;
import com.ring.common.CloudinaryTransformations;
import com.ring.dto.projection.images.IImage;
import com.ring.dto.projection.shops.*;
import com.ring.dto.response.shops.*;
import com.ring.model.entity.Address;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * A mapper for {@link IShopDisplay}, {@link IShop}, {@link IShopPreview},
 * {@link IShopInfo}, {@link IShopDisplayDetail}, {@link IShopDetail}.
 */
@RequiredArgsConstructor
@Service
public class ShopMapper {

    private final AddressMapper addressMapper;
    private final Cloudinary cloudinary;

    /**
     * Maps a {@link IShopDisplay} to a {@link ShopDisplayDTO}.
     * 
     * @param shop the shop to map
     * @return the mapped {@link ShopDisplayDTO}
     */
    public ShopDisplayDTO displayToDTO(IShopDisplay shop) {

        IImage image = shop.getImage();
        String imageUrl = image != null
                ? cloudinary.url()
                        .transformation(CloudinaryTransformations.AVATAR_TRANSFORMATION)
                        .secure(true)
                        .generate(image.getPublicId())
                : null;

        return new ShopDisplayDTO(shop.getOwnerId(),
                shop.getId(),
                shop.getName(),
                shop.getVerified(),
                imageUrl,
                shop.getJoinedDate(),
                shop.getTotalReviews(),
                shop.getTotalProducts(),
                shop.getTotalFollowers(),
                shop.getFollowed());
    }

    /**
     * Maps a {@link IShop} to a {@link ShopDTO}.
     * 
     * @param shop the shop to map
     * @return the mapped {@link ShopDTO}
     */
    public ShopDTO shopToDTO(IShop shop) {

        IImage image = shop.getImage();
        String imageUrl = image != null
                ? cloudinary.url().transformation(CloudinaryTransformations.AVATAR_TRANSFORMATION)
                        .secure(true)
                        .generate(image.getPublicId())
                : null;

        return new ShopDTO(shop.getUsername(),
                shop.getOwnerId(),
                shop.getId(),
                shop.getName(),
                shop.getVerified(),
                imageUrl,
                shop.getSales(),
                shop.getTotalOrders(),
                shop.getTotalProducts(),
                shop.getCanceledRate(),
                shop.getTotalReviews(),
                shop.getTotalFollowers(),
                shop.getJoinedDate());
    }

    /**
     * Maps a {@link IShopPreview} to a {@link ShopPreviewDTO}.
     * 
     * @param shop the shop to map
     * @return the mapped {@link ShopPreviewDTO}
     */
    public ShopPreviewDTO previewToDTO(IShopPreview shop) {

        IImage image = shop.getImage();
        String imageUrl = image != null
                ? cloudinary.url()
                        .transformation(CloudinaryTransformations.PREVIEW_CATEGORY_TRANSFORMATION)
                        .secure(true)
                        .generate(image.getPublicId())
                : null;

        return new ShopPreviewDTO(shop.getId(),
                shop.getName(),
                imageUrl);
    }

    /**
     * Maps a {@link IShopInfo} to a {@link ShopInfoDTO}.
     * 
     * @param shop the shop to map
     * @return the mapped {@link ShopInfoDTO}
     */
    public ShopInfoDTO infoToDTO(IShopInfo shop) {

        IImage image = shop.getImage();
        String imageUrl = image != null
                ? cloudinary.url()
                        .transformation(CloudinaryTransformations.SHOP_TRANSFORMATION)
                        .secure(true)
                        .generate(image.getPublicId())
                : null;

        return new ShopInfoDTO(shop.getUsername(),
                shop.getOwnerId(),
                shop.getId(),
                shop.getName(),
                shop.getVerified(),
                imageUrl,
                shop.getJoinedDate(),
                shop.getTotalReviews(),
                shop.getTotalProducts(),
                shop.getTotalFollowers(),
                shop.getFollowed());
    }

    /**
     * Maps a {@link IShopDisplayDetail} to a {@link ShopDisplayDetailDTO}.
     * 
     * @param shop the shop to map
     * @return the mapped {@link ShopDisplayDetailDTO}
     */
    public ShopDisplayDetailDTO displayDetailToDTO(IShopDisplayDetail shop) {

        IImage image = shop.getImage();
        Address address = shop.getAddress();
        String imageUrl = image != null
                ? cloudinary.url()
                        .transformation(CloudinaryTransformations.SHOP_TRANSFORMATION)
                        .secure(true)
                        .generate(image.getPublicId())
                : null;

        return new ShopDisplayDetailDTO(shop.getUsername(),
                shop.getOwnerId(),
                shop.getId(),
                shop.getName(),
                shop.getVerified(),
                shop.getDescription(),
                imageUrl,
                address != null ? addressMapper.addressToDTO(address) : null,
                shop.getTotalSold(),
                shop.getCanceledRate(),
                shop.getTotalProducts(),
                shop.getRating(),
                shop.getTotalReviews(),
                shop.getTotalFollowers(),
                shop.getJoinedDate(),
                shop.getFollowed());
    }

    /**
     * Maps a {@link IShopDetail} to a {@link ShopDetailDTO}.
     * 
     * @param shop the shop to map
     * @return the mapped {@link ShopDetailDTO}
     */
    public ShopDetailDTO detailToDTO(IShopDetail shop) {

        IImage image = shop.getImage();
        Address address = shop.getAddress();
        String imageUrl = image != null ? cloudinary.url()
                .transformation(CloudinaryTransformations.SHOP_TRANSFORMATION)
                .secure(true)
                .generate(image.getPublicId())
                : null;

        return new ShopDetailDTO(shop.getUsername(),
                shop.getOwnerId(),
                shop.getId(),
                shop.getName(),
                shop.getVerified(),
                shop.getDescription(),
                imageUrl,
                address != null ? addressMapper.addressToDTO(address) : null,
                shop.getSales(),
                shop.getTotalSold(),
                shop.getTotalProducts(),
                shop.getTotalReviews(),
                shop.getTotalFollowers(),
                shop.getJoinedDate());
    }
}
