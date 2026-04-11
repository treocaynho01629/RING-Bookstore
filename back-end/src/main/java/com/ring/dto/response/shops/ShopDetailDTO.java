package com.ring.dto.response.shops;

import com.ring.dto.response.accounts.AddressDTO;

import java.time.LocalDateTime;

/**
 * Represents a shop detail response as {@link ShopDetailDTO}.
 */
public record ShopDetailDTO(String username,
        Long ownerId,
        Long id,
        String name,
        Boolean verified,
        String description,
        String image,
        AddressDTO address,
        Double sales,
        Integer totalSold,
        Integer totalProducts,
        Integer totalReviews,
        Integer totalFollowers,
        LocalDateTime joinedDate) {

}
