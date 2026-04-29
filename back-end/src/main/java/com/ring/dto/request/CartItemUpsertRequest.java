package com.ring.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a cart item upsert request as {@link CartItemUpsertRequest}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CartItemUpsertRequest {

    @NotNull(message = "{validation.constraints.not.blank}")
    private Long productId;

    @NotNull(message = "{validation.constraints.not.blank}")
    @Min(value = 1, message = "{validation.constraints.min}")
    private Short quantity;
}
