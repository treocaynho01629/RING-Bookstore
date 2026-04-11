package com.ring.dto.projection.books;

import com.ring.dto.projection.images.IImage;
import com.ring.model.enums.BookLanguage;
import com.ring.model.enums.BookType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Represents a detailed book projection as {@link IBookDetail}, containing the
 * book's ID,
 * slug, price, discount, title, description, type, author, amount,
 * publisher information, category, shop information, book size, publication
 * date,
 * language, weight, preview images, and ratings.
 */
public interface IBookDetail {

    Long getId();

    String getSlug();

    Double getPrice();

    BigDecimal getDiscount();

    String getTitle();

    String getDescription();

    BookType getType();

    String getAuthor();

    Short getAmount();

    IImage getImage();

    Integer getPubId();

    String getPubName();

    Integer getCateId();

    String getCateName();

    String getCateSlug();

    Integer getParentId();

    String getParentName();

    String getParentSlug();

    Integer getAncestorId();

    Long getShopId();

    String getShopName();

    Short getLength();

    Short getWidth();

    Short getHeight();

    Integer getPages();

    LocalDate getDate();

    BookLanguage getLanguage();

    Short getWeight();

    List<IImage> getPreviews();

    Integer getTotalOrders();

    Double getRating();

    Integer getTotalRates();

    Integer getRate5();

    Integer getRate4();

    Integer getRate3();

    Integer getRate2();

    Integer getRate1();
}
