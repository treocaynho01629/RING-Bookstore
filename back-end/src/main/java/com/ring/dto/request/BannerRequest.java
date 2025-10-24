package com.ring.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a banner request as {@link BannerRequest}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BannerRequest {

	@NotBlank(message = "{validation.constraints.not.blank}")
	@Size(min = 5, max = 200, message = "{validation.constraints.size.range}")
	private String name;

	@Size(max = 4000, message = "{validation.constraints.size.max}")
	private String description;

	@NotBlank(message = "{validation.constraints.not.blank}")
	private String url;

	private Long shopId;
}
