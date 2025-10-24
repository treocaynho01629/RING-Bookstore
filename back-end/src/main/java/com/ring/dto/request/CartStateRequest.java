package com.ring.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the current cart's state {@link CartStateRequest} with cart total value, 
 * products quantity and estimated shipping fee.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartStateRequest {

	@Min(value = 0, message = "{validation.constraints.min}")
	private Double value;

	@Min(value = 0, message = "{validation.constraints.min}")
	private Double shippingFee;

	@Min(value = 0, message = "{validation.constraints.min}")
	private Integer quantity;

	private Long shopId;
}
