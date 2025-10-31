package com.ring.dto.request;

import com.ring.model.enums.CouponCriteria;
import com.ring.model.enums.CouponType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Represents a coupon request as {@link CouponRequest}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CouponRequest {
	
	@NotBlank(message = "{validation.constraints.not.blank}")
	@Size(min = 5, max = 50, message = "{validation.constraints.size.range}")
	private String code;

	@NotNull(message = "{validation.constraints.not.blank}")
	private CouponType type;

	@NotNull(message = "{validation.constraints.not.blank}")
	private CouponCriteria criteria;

	@Max(value = 9999, message = "{validation.constraints.max}")
	private Short usage;

	@Future(message = "{validation.constraints.date.future}")
	@DateTimeFormat(pattern = "dd-MM-yyyy")
	private LocalDate expireDate;
	
	@NotNull(message = "{validation.constraints.not.blank}")
	@Min(value = 0, message = "{validation.constraints.min}")
	private Double attribute;

	private Double maxDiscount;

	@DecimalMin(value = "0.0", inclusive = false)
	@Digits(integer = 1, fraction = 4)
	private BigDecimal discount;

	private Long shopId;
}
