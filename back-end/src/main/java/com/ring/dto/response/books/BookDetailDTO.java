package com.ring.dto.response.books;

import com.ring.dto.response.categories.CategoryDTO;
import com.ring.dto.response.publishers.PublisherDTO;
import com.ring.dto.response.reviews.ReviewsInfoDTO;
import com.ring.model.enums.BookLanguage;
import com.ring.model.enums.BookType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Represents a book detail response as {@link BookDetailDTO}.
 */
@Builder
public record BookDetailDTO(Long id,
        String slug,
        Map<Integer, String> srcSet,
        List<Map<Integer, String>> previewsSrcSet,
        Double price,
        BigDecimal discount,
        String title,
        String description,
        BookType type,
        String author,
        Short amount,
        Long shopId,
        String shopName,
        PublisherDTO publisher,
        CategoryDTO category,
        String size,
        Integer pages,
        LocalDate date,
        BookLanguage language,
        Double weight,
        Integer totalOrders,
        ReviewsInfoDTO reviewsInfo) {

}
