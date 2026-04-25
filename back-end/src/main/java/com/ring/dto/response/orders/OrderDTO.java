package com.ring.dto.response.orders;

import com.ring.model.enums.OrderStatus;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents a checkout response as {@link OrderDTO}.
 */
@Builder
public record OrderDTO(Long id,
        Long orderId,
        String orderCode,
        String clientOrderCode,
        Long shopId,
        Integer ghnShopId,
        String shopName,
        Double totalPrice,
        Double totalDiscount,
        Double shippingFee,
        Double shippingDiscount,
        Integer shippingType,
        Integer weightGrams,
        Integer lengthCm,
        Integer widthCm,
        Integer heightCm,
        String note,
        Integer totalItems,
        LocalDateTime date,
        OrderStatus status,
        List<OrderItemDTO> items) {

}
