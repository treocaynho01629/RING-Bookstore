package com.ring.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Represents an entity as {@link Shop} for shops.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE Shop SET active = false WHERE id=?")
@SQLRestriction("active=true")
@EqualsAndHashCode(callSuper = true)
public class Shop extends Auditable {

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(name = "primary_sequence", sequenceName = "primary_sequence", allocationSize = 1, initialValue = 10000)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "primary_sequence")
    @JsonIgnore
    private Long id;

    @Column(length = 250)
    @Nationalized
    private String name;

    @Column(length = 500)
    @Nationalized
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    private Account owner;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "image_id")
    @JsonIgnore
    @EqualsAndHashCode.Exclude
    private Image image;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "shop", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Book> books;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "shop", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Coupon> coupons;

    @OneToMany(cascade = { CascadeType.MERGE, CascadeType.PERSIST }, mappedBy = "shop", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<OrderDetail> shopOrderDetails;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "shops_followers", joinColumns = @JoinColumn(name = "shop_id"), inverseJoinColumns = @JoinColumn(name = "follower_id"))
    @JsonIgnore
    @EqualsAndHashCode.Exclude
    private Set<Account> followers = new HashSet<>();

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    @JsonIgnore
    private Address address;

    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean verified = false;

    public void addBook(Book book) {
        this.books.add(book);
        book.setShop(this);
    }

    public void removeBook(Book book) {
        this.books.remove(book);
        book.setShop(null);
    }

    public void removeAllBooks() {
        books.forEach(book -> book.setShop(null));
        this.books.clear();
    }

    public void addCoupon(Coupon coupon) {
        this.coupons.add(coupon);
        coupon.setShop(this);
    }

    public void removeCoupon(Coupon coupon) {
        this.coupons.remove(coupon);
        coupon.setShop(null);
    }

    public void removeAllCoupons() {
        coupons.forEach(coupon -> coupon.setShop(null));
        this.coupons.clear();
    }

    public void addOrderDetail(OrderDetail orderDetail) {
        this.shopOrderDetails.add(orderDetail);
        orderDetail.setShop(this);
    }

    public void removeOrderDetail(OrderDetail orderDetail) {
        this.shopOrderDetails.remove(orderDetail);
        orderDetail.setShop(null);
    }

    public void removeAllOrderDetails() {
        shopOrderDetails.forEach(orderDetail -> orderDetail.setShop(null));
        this.shopOrderDetails.clear();
    }

    public void addFollower(Account user) {
        this.followers.add(user);
    }

    public void removeFollower(Account user) {
        this.followers.remove(user);
    }

    public void removeAllFollowers() {
        this.followers.forEach(user -> user.unfollowShop(this));
        this.followers.clear();
    }

    @PreRemove
    private void detachImageAndAddressFromShop() {
        this.image = null;
        this.address = null;
    }
}
