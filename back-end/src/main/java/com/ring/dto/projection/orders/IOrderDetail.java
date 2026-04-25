package com.ring.dto.projection.orders;

import com.ring.model.enums.OrderStatus;
import com.ring.model.enums.PaymentStatus;
import com.ring.model.enums.PaymentType;

import java.time.LocalDateTime;

/**
 * Represents an order detail & item projection as {@link IOrderDetail}
 */
public interface IOrderDetail {

    Long getId();

    Long getOrderId();

    String getOrderCode();

    String getClientOrderCode();

    String getName();

    String getCompanyName();

    String getPhone();

    String getDetail();

    String getAddress();

    String getNote();

    LocalDateTime getOrderedDate();

    LocalDateTime getPaidDate();

    LocalDateTime getDate();

    Double getTotalPrice();

    Double getShippingFee();

    Double getShippingDiscount();

    Double getDiscount();

    Integer getShippingType();

    PaymentType getPaymentType();

    OrderStatus getStatus();

    PaymentStatus getPaymentStatus();

    Long getShopId();

    Boolean getShopVerified();

    String getShopName();
}
