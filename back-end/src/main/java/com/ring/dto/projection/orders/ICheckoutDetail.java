package com.ring.dto.projection.orders;

import com.ring.model.enums.PaymentStatus;
import com.ring.model.enums.PaymentType;

import java.time.LocalDateTime;

/**
 * Represents a checkout detail projection as {@link ICheckoutDetail}
 */
public interface ICheckoutDetail {

    Long getId();

    String getEmail();

    String getPhone();

    String getName();

    String getCompanyName();

    String getAddress();

    String getDetail();

    LocalDateTime getOrderedDate();

    LocalDateTime getDate();

    Double getTotal();

    Double getTotalDiscount();

    PaymentType getPaymentType();

    PaymentStatus getPaymentStatus();

    LocalDateTime getExpiredAt();
}
