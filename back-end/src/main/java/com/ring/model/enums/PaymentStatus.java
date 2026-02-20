package com.ring.model.enums;

/**
 * Enum representing the payment status as {@link PaymentStatus}.
 */
public enum PaymentStatus {
    // PAYOS
    PENDING,
    CANCELLED, // Same as PayOS (2 L)
    UNDERPAID,
    PAID,
    EXPIRED,
    PROCESSING,
    FAILED,

    // CASH
    PENDING_REFUND,
    REFUNDED
}
