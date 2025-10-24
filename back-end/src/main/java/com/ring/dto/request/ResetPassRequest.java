package com.ring.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a request as {@link ResetPassRequest} to reset user's password.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResetPassRequest {

	@NotNull(message = "{validation.constraints.not.blank}")
	@Size(min = 8, max = 24, message = "{validation.constraints.size.range}")
	private String newPass;
	
	@NotNull(message = "{validation.constraints.not.blank}")
	@Size(min = 8, max = 24, message = "{validation.constraints.size.range}")
	private String newPassRe;
}
