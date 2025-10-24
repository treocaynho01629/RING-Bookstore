package com.ring.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

/**
 * Represents a login request as {@link AuthenticationRequest} with username and password.
 */
@Data
@Builder
public class AuthenticationRequest {

	@NotBlank(message = "{validation.constraints.not.blank}")
	private String username;
	
	@NotBlank(message = "{validation.constraints.not.blank}")
	private String pass;
}