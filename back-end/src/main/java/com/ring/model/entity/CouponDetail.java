package com.ring.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ring.model.enums.CouponCriteria;
import com.ring.model.enums.CouponType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Represents an entity as {@link CouponDetail} for coupon details.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponDetail {

    @Id
    @Column(nullable = false, updatable = false)
    @JsonIgnore
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    @JsonIgnore
    @EqualsAndHashCode.Exclude
    private Coupon coupon;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CouponType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CouponCriteria criteria;

    @Column(nullable = false)
    private Double attribute; //Min money/quantity

    @Column
    private Double maxDiscount;

    @Column(precision = 5, scale = 4, nullable = false)
    private BigDecimal discount;

    @Column
    private Short usage;

    @Column
    private LocalDate expDate;
}
