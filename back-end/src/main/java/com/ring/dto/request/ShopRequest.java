package com.ring.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a shop request as {@link ShopRequest}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShopRequest {

	@Size(max = 250, message = "{validation.constraints.size.max}")
	private String name;

	@Size(max = 500, message = "{validation.constraints.size.max}")
	private String description;

	private String image;

    @Valid
    @NotNull(groups = AddressRequest.class)
    private AddressRequest addressRequest;
}
