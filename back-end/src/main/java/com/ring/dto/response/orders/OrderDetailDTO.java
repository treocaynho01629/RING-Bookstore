package com.ring.dto.response.orders;

import com.ring.model.enums.OrderStatus;
import com.ring.model.enums.PaymentStatus;
import com.ring.model.enums.PaymentType;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents an order detail response as {@link OrderDetailDTO}.
 */
@Builder
public record OrderDetailDTO(Long orderId,
        String orderCode,
        String name,
        String phone,
        String address,
        String note,
        LocalDateTime orderedDate,
        LocalDateTime paidDate,
        LocalDateTime date,
        Long id,
        Long shopId,
        Boolean shopVerified,
        String shopName,
        Double totalPrice,
        Double totalDiscount,
        Double shippingFee,
        Double shippingDiscount,
        Integer shippingType,
        PaymentType paymentType,
        OrderStatus status,
        PaymentStatus paymentStatus,
        List<OrderItemDTO> items) {

}
