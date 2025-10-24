package com.ring.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an order item request as {@link CartItemRequest}.
 */
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemRequest {

    @NotNull(message = "{validation.constraints.not.blank}")
    private Long id;

    @NotNull(message = "{validation.constraints.not.blank}")
    private Short quantity;
}
