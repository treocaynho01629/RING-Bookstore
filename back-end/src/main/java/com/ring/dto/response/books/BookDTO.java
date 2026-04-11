package com.ring.dto.response.books;

import com.ring.dto.response.categories.CategoryDTO;
import com.ring.dto.response.publishers.PublisherDTO;
import com.ring.model.enums.BookLanguage;
import com.ring.model.enums.BookType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Represents a full book response as {@link BookDTO}.
 */
@Builder
public record BookDTO(Long id,
                String slug,
                List<Map<Integer, String>> srcSet,
                List<String> imagePublicIds,
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
                Short length,
                Short width,
                Short height,
                Integer pages,
                LocalDate date,
                BookLanguage language,
                Short weight,
                Integer totalOrders,
                Double rating,
                Integer totalRates) {
}
