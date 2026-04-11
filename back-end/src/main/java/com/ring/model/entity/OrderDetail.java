package com.ring.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ring.dto.response.coupons.CouponDTO;
import com.ring.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.List;

/**
 * Represents an entity as {@link OrderDetail} for order details.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE OrderDetail SET active = false WHERE id=?")
@SQLRestriction("active=true")
@EqualsAndHashCode(callSuper = true)
public class OrderDetail extends Auditable {

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(name = "primary_sequence", sequenceName = "primary_sequence", allocationSize = 1, initialValue = 10000)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "primary_sequence")
    private Long id;

    @Column(length = 100)
    private String orderCode;

    @Column
    private Double totalPrice; // Product's price

    @Column
    private Double shippingFee; // Shipping fee

    @Column
    private Double shippingDiscount; // Shipping discount

    @Column
    private Double discount; // Coupon discount + deal

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    @Column
    private Integer shippingType;

    @Column(length = 300)
    @Nationalized
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private OrderReceipt order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    @JsonIgnore
    private Shop shop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    @JsonIgnore
    private Coupon coupon;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "detail", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<OrderItem> items;

    // For mapping DTO result
    @Transient
    private Double couponDiscount;

    @Transient
    private Double dealDiscount; // Product's discount * price

    @Transient
    private Integer totalQuantity;

    @Transient
    private CouponDTO couponDTO;

    public void addOrderItem(OrderItem item) {
        this.items.add(item);
        item.setDetail(this);
    }

    public void removeOrderItem(OrderItem item) {
        this.items.remove(item);
        item.setDetail(null);
    }

    public void removeAllOrderItems() {
        items.forEach(item -> item.setDetail(null));
        this.items.clear();
    }
}
