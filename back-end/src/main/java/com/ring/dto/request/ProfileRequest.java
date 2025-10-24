package com.ring.dto.request;

import com.ring.model.enums.Gender;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * Represents a profile request as {@link ProfileRequest} to change user's profile.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileRequest {

	@Size(max = 150, message = "{validation.constraints.size.max}")
	private String name;

	@Pattern(regexp="\\(?([0-9]{3})\\)?([ .-]?)([0-9]{3})\\2([0-9]{3})", message = "{validation.constraints.pattern}")
	private String phone;

	@Past(message = "{validation.constraints.date.past}")
	@DateTimeFormat(pattern = "dd-MM-yyyy")
	private LocalDate dob;
	
	private Gender gender;

	private String image;
}
