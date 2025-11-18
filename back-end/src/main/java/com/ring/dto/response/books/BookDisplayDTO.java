package com.ring.dto.response.books;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Represents a book slim response as {@link BookDisplayDTO}.
 */
@Builder
public record BookDisplayDTO(Long id,
        String slug,
        String title,
        Map<Integer, String> srcSet,
        String description,
        Double price,
        BigDecimal discount,
        Short amount,
        Long shopId,
        String shopName,
        Double rating,
        Integer totalOrders) {

}
