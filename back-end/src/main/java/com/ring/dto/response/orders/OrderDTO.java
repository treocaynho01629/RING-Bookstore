package com.ring.dto.response.orders;

import com.ring.model.enums.OrderStatus;
import com.ring.model.enums.ShippingType;
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
                ShippingType shippingType,
                String note,
                Integer totalItems,
                LocalDateTime date,
                OrderStatus status,
                List<OrderItemDTO> items) {

}
