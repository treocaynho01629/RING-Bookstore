package com.ring.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a publisher request as {@link PublisherRequest}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PublisherRequest {
	
	@NotBlank(message = "{validation.constraints.not.blank}")
	@Size(min = 1, max = 50, message = "{validation.constraints.size.range}")
	private String name;

}
