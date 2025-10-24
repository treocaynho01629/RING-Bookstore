package com.ring.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a register request as {@link RegisterRequest} with user details
 * including username, email, password
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest { 

	@NotBlank(message = "{validation.constraints.not.blank}")
	@Size(min = 4, max = 24, message = "{validation.constraints.size.range}")
	private String username;
	
	@NotBlank(message = "{validation.constraints.not.blank}")
	@Size(min = 8, max = 24, message = "{validation.constraints.size.range}")
	private String pass;
	
	@NotBlank(message = "{validation.constraints.not.blank}")
	@Email(message = "{validation.constraints.pattern}")
	private String email;
}
