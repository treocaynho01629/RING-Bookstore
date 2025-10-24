package com.ring.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Range;

/**
 * Represents a review request as {@link ReviewRequest}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewRequest {
	
	@NotBlank(message = "{validation.constraints.not.blank}")
	@Size(min = 50, message = "{validation.constraints.size.min}")
	private String content;

	@NotNull(message = "{validation.constraints.not.blank}")
	@Range(min = 1, max = 5, message = "{validation.constraints.range}")
	private Integer rating;
}
