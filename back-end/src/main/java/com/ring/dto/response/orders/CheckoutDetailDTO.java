package com.ring.dto.response.orders;

import com.ring.model.enums.PaymentStatus;
import com.ring.model.enums.PaymentType;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents a checkout response as {@link CheckoutDetailDTO}.
 */
@Builder
public record CheckoutDetailDTO(Long id,
        String name,
        String phone,
        String address,
        String email,
        LocalDateTime orderedDate,
        LocalDateTime date,
        Double total,
        Double totalDiscount,
        PaymentType paymentType,
        PaymentStatus paymentStatus,
        LocalDateTime expiredAt,
        List<OrderDTO> details) {

}
