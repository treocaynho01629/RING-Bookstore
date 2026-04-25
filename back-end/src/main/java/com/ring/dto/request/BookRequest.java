package com.ring.dto.request;

import com.ring.model.enums.BookLanguage;
import com.ring.model.enums.BookType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Represents a book request as {@link BookRequest}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookRequest {

    @NotNull(message = "{validation.constraints.not.blank}")
    @Min(value = 1000, message = "{validation.constraints.min}")
    @Max(value = 10000000, message = "{validation.constraints.max}")
    private Double price;

    @DecimalMin(value = "0.0", inclusive = true)
    @Digits(integer = 1, fraction = 4)
    private BigDecimal discount;

    @NotNull(message = "{validation.constraints.not.blank}")
    @Min(value = 1, message = "{validation.constraints.min}")
    @Max(value = 10000, message = "{validation.constraints.max}")
    private Short amount;

    @NotBlank(message = "{validation.constraints.not.blank}")
    private String title;

    @NotBlank(message = "{validation.constraints.not.blank}")
    private String description;

    @NotNull(message = "{validation.constraints.not.blank}")
    private BookType type;

    @NotNull(message = "{validation.constraints.not.blank}")
    private String author;

    @NotNull(message = "{validation.constraints.not.blank}")
    private Integer pubId;

    @NotNull(message = "{validation.constraints.not.blank}")
    private Integer cateId;

    @NotNull(message = "{validation.constraints.not.blank}")
    @Min(value = 1, message = "{validation.constraints.min}")
    private Short weight;

    @NotNull(message = "{validation.constraints.not.blank}")
    @Min(value = 1, message = "{validation.constraints.min}")
    private Short length;

    @NotNull(message = "{validation.constraints.not.blank}")
    @Min(value = 1, message = "{validation.constraints.min}")
    private Short width;

    @NotNull(message = "{validation.constraints.not.blank}")
    @Min(value = 1, message = "{validation.constraints.min}")
    private Short height;

    @NotNull(message = "{validation.constraints.not.blank}")
    @Min(value = 1, message = "{validation.constraints.min}")
    private Integer pages;

    @Past(message = "{validation.constraints.date.past}")
    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate date;

    @NotNull(message = "{validation.constraints.not.blank}")
    private BookLanguage language;

    @NotNull(message = "{validation.constraints.not.blank}")
    private Long shopId;

    private String thumbnailPublicId;

    private List<String> removePublicIds;
}
