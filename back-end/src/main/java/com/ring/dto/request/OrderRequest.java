package com.ring.dto.request;

import com.ring.model.enums.PaymentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents a checkout request as {@link OrderRequest} to proceed a checkout.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequest {

	@NotNull(message = "{validation.constraints.not.blank}")
	@NotEmpty(message = "{validation.constraints.not.blank}")
	private List<CartDetailRequest> cart;

	private String coupon;

	@NotNull(message = "{validation.constraints.not.blank}")
	private PaymentType paymentMethod;

	@Valid
	@NotNull(groups = AddressRequest.class)
	private AddressRequest address;
}
