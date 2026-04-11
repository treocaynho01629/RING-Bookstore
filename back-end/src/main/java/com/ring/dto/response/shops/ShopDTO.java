package com.ring.dto.response.shops;

import java.time.LocalDateTime;

/**
 * Represents a shop response as {@link ShopDTO}.
 */
public record ShopDTO(String username,
        Long ownerId,
        Long id,
        String name,
        Boolean verified,
        String image,
        Double sales,
        Integer totalOrders,
        Integer totalProducts,
        Double canceledRate,
        Integer totalReviews,
        Integer totalFollowers,
        LocalDateTime joinedDate) {

}
