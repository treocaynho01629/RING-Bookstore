package com.ring.dto.projection.shops;

import com.ring.dto.projection.images.IImage;

import java.time.LocalDateTime;

/**
 * Represents a shop slim projection as {@link IShopDisplay}, containing shop's
 * owner details,
 * name, verified status, total reviews, products, followers,
 * join date, followed status, and image.
 */
public interface IShopDisplay {

    Long getOwnerId();

    Long getId();

    String getName();

    Boolean getVerified();

    Integer getTotalReviews();

    Integer getTotalProducts();

    Integer getTotalFollowers();

    LocalDateTime getJoinedDate();

    Boolean getFollowed();

    IImage getImage();
}
