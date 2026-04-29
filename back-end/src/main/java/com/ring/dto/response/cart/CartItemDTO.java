package com.ring.dto.response.cart;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Represents one cart item response as {@link CartItemDTO}.
 */
public record CartItemDTO(Long id,
        Long userId,
        Long shopId,
        String shopName,
        Long productId,
        String slug,
        Map<Integer, String> srcSet,
        String title,
        Double price,
        BigDecimal discount,
        Short amount,
        Short quantity) {
}
