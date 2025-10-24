package com.ring.dto.request;

import com.ring.model.enums.ShippingType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents an order detail request as {@link CartDetailRequest}.
 */
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartDetailRequest {

    @NotNull(message = "{validation.constraints.not.blank}")
    private Long shopId;

    private String coupon;

    @Size(max = 300, message = "{validation.constraints.size.max}")
    private String note;

    @NotNull(message = "{validation.constraints.not.blank}")
    private ShippingType shippingType;

    @NotNull(message = "{validation.constraints.not.blank}")
    private List<CartItemRequest> items;
}
