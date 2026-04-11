package com.ring.dto.projection.shops;

import com.ring.dto.projection.images.IImage;
import com.ring.model.entity.Address;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a detailed shop display projection as {@link IShopDisplayDetail},
 * containing shop's owner details,
 * name, verified status, description, address, total sold products,
 * canceled rate, total products, rating, total reviews, total followers,
 * join date, followed status, and image.
 */
public interface IShopDisplayDetail {
    String getUsername();

    Long getOwnerId();

    Long getId();

    String getName();

    Boolean getVerified();

    String getDescription();

    Address getAddress();

    Integer getTotalSold();

    BigDecimal getCanceledRate();

    Integer getTotalProducts();

    Double getRating();

    Integer getTotalReviews();

    Integer getTotalFollowers();

    LocalDateTime getJoinedDate();

    Boolean getFollowed();

    IImage getImage();
}
