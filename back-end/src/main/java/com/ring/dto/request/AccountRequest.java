package com.ring.dto.request;

import com.ring.config.validator.NullOrNotBlank;
import com.ring.model.enums.Gender;
import com.ring.model.enums.UserRole;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder.Default;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

/**
 * Represents an account request as {@link AccountRequest}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountRequest {

	@NotBlank(message = "{validation.constraints.not.blank}")
	@Size(min = 4, max = 24, message = "{validation.constraints.size.range}")
	private String username;

	@NullOrNotBlank(message = "{validation.constraints.not.blank}")
	@Size(min = 8, max = 24, message = "{validation.constraints.size.range}")
	private String pass;

	@NotBlank(message = "{validation.constraints.not.blank}")
	@Email(message = "{validation.constraints.pattern}")
	private String email;

	@NotNull(message = "{validation.constraints.not.blank}")
	@NotEmpty(message = "{validation.constraints.not.blank}")
	private List<UserRole> roles;

	@Size(max = 250, message = "{validation.constraints.size.max}")
	private String name;

	@Pattern(regexp = "\\(?([0-9]{3})\\)?([ .-]?)([0-9]{3})\\2([0-9]{3})", message = "{validation.constraints.pattern}")
	private String phone;

	@Past(message = "{validation.constraints.date.past}")
	@DateTimeFormat(pattern = "dd-MM-yyyy")
	private LocalDate dob;

	private Gender gender;

	@Default
	private Boolean removeImage = false;
}
