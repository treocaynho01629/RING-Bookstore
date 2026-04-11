package com.ring.dto.projection.orders;

import java.time.LocalDateTime;
import com.ring.model.enums.OrderStatus;

/**
 * Represents a order summary projection as {@link IOrderSummary}, containing
 * details about the order's ID,
 * name, date, status, total price, and total items.
 */
public interface IOrderSummary {

    Long getId();

    String getName();

    LocalDateTime getDate();

    OrderStatus getStatus();

    Double getTotalPrice();

    Integer getTotalItems();
}
