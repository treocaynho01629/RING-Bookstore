package com.ring.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents a calculation request as {@link CalculateRequest} to calculate cart value.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CalculateRequest {
	
	@NotNull(message = "{validation.constraints.not.blank}")
	@NotEmpty(message = "{validation.constraints.not.blank}")
	private List<CartDetailRequest> cart;

	private String coupon;

	@Valid
	private AddressRequest address;
}
