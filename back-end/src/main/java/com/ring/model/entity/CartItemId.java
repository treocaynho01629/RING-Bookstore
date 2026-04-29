package com.ring.model.entity;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Composite identifier for {@link CartItem} based on user and product.
 */
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CartItemId implements Serializable {

    private Long user;

    private Long product;
}
