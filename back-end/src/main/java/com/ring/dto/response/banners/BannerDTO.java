package com.ring.dto.response.banners;

import lombok.Builder;

import java.util.Map;

/**
 * Represents a banner response as {@link BannerDTO}.
 */
@Builder
public record BannerDTO(Integer id,
        Long shopId,
        String name,
        String description,
        Map<Integer, String> srcSet,
        String url) {

}
