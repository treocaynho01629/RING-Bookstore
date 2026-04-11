package com.ring.dto.projection.shops;

import com.ring.dto.projection.images.IImage;

import java.time.LocalDateTime;

/**
 * Represents a shop projection as {@link IShop}, containing owner's username,
 * owner information, sales, total products, total orders, total followers,
 * canceled rate, verified status, join date, and image.
 */
public interface IShop {

    String getUsername();

    Long getOwnerId();

    Long getId();

    String getName();

    Boolean getVerified();

    Double getSales();

    Double getCanceledRate();

    Integer getTotalReviews();

    Integer getTotalOrders();

    Integer getTotalProducts();

    Integer getTotalFollowers();

    IImage getImage();

    LocalDateTime getJoinedDate();
}
