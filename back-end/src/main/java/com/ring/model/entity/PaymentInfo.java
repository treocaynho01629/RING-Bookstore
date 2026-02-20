package com.ring.model.entity;

import com.ring.model.enums.PaymentStatus;
import com.ring.model.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents an entity as {@link OrderReceipt} for order receipts.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInfo {

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(name = "primary_sequence", sequenceName = "primary_sequence", allocationSize = 1, initialValue = 10000)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "primary_sequence")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PaymentStatus status;

    @Column(length = 250)
    private String checkoutUrl;

    @Column
    private Long amount;

    @Column(length = 500)
    private String description;

    @Column
    private LocalDateTime expiredAt;
}
