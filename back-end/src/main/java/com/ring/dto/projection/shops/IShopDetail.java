package com.ring.dto.projection.shops;

import com.ring.dto.projection.images.IImage;
import com.ring.model.entity.Address;

import java.time.LocalDateTime;

/**
 * Represents a detailed shop projection as {@link IShopDetail}, containing
 * owner's username,
 * owner details, verified status, description, address, sales, total items
 * sold,
 * product count, reviews, followers, join date, and image.
 */
public interface IShopDetail {

    String getUsername();

    Long getOwnerId();

    Long getId();

    String getName();

    Boolean getVerified();

    String getDescription();

    Address getAddress();

    Double getSales();

    Integer getTotalSold();

    Integer getTotalProducts();

    Integer getTotalReviews();

    Integer getTotalFollowers();

    LocalDateTime getJoinedDate();

    IImage getImage();
}
