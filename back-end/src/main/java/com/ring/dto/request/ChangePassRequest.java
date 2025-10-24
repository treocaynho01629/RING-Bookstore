package com.ring.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a request as {@link ChangePassRequest} to change user's password.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChangePassRequest {

	@NotNull(message = "{validation.constraints.not.blank}")
	private String pass;
	
	@NotNull(message = "{validation.constraints.not.blank}")
	@Size(min = 8, max = 24, message = "{validation.constraints.size.range}")
	private String newPass;
	
	@NotNull(message = "{validation.constraints.not.blank}")
	@Size(min = 8, max = 24, message = "{validation.constraints.size.range}")
	private String newPassRe;
}
