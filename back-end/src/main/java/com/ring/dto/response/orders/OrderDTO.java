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
        Long shopId,
        String shopName,
        Double totalPrice,
        Double totalDiscount,
        Double shippingFee,
        Double shippingDiscount,
        Integer serviceTypeId,
        Integer serviceId,
        String serviceName,
        String note,
        Integer totalItems,
        LocalDateTime date,
        OrderStatus status,
        List<OrderItemDTO> items) {

}
