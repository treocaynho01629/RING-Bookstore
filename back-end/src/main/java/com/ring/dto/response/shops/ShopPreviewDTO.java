package com.ring.dto.response.shops;

/**
 * Represents a shop preview response as {@link ShopPreviewDTO}.
 */
public record ShopPreviewDTO(Long id,
        String name,
        String image) {
}
