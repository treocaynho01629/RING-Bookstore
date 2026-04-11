package com.ring.dto.response.orders;

import lombok.Builder;
import com.ring.model.enums.OrderStatus;
import java.time.LocalDateTime;

/**
 * Represents a order summary response as {@link OrderSummaryDTO}.
 */
@Builder
public record OrderSummaryDTO(Long id,
                String name,
                LocalDateTime date,
                OrderStatus status,
                Double totalPrice,
                Integer totalItems) {

}
