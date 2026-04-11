package com.ring.dto.response.shops;

import java.time.LocalDateTime;

/**
 * Represents a shop slim response as {@link ShopDisplayDTO}.
 */
public record ShopDisplayDTO(Long ownerId,
        Long id,
        String name,
        Boolean verified,
        String image,
        LocalDateTime joinedDate,
        Integer totalReviews,
        Integer totalProducts,
        Integer totalFollowers,
        Boolean followed) {

}
