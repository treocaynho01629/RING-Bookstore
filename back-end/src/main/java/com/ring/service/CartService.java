package com.ring.service;

import com.ring.dto.request.CartItemUpsertRequest;
import com.ring.dto.response.cart.CartItemDTO;
import com.ring.model.entity.Account;

import java.util.List;

/**
 * Service interface for handling server-side cart operations.
 */
public interface CartService {

    /**
     * Get the cart items for a user.
     * 
     * @param user the user getting the cart items
     * @return the list of cart item DTOs
     */
    List<CartItemDTO> getMyCart(Account user);

    /**
     * Add a product to the cart.
     * 
     * @param request the request containing the product ID and quantity
     * @param user    the user adding the product to the cart
     * @return the cart item DTO
     */
    CartItemDTO addToCart(CartItemUpsertRequest request, Account user);

    /**
     * Update the quantity of a cart item.
     * 
     * @param productId the ID of the product to update
     * @param quantity  the new quantity
     * @param user      the user updating the cart item
     * @return the cart item DTO
     */
    CartItemDTO updateItemQuantity(Long productId, Short quantity, Account user);

    /**
     * Remove a cart item from the cart.
     * 
     * @param productId the ID of the product to remove
     * @param user      the user removing the cart item
     */
    void removeItem(Long productId, Account user);

    /**
     * Remove multiple cart items from the cart.
     * 
     * @param productIds the product IDs of the cart items to remove
     * @param user       the user removing the cart items
     */
    void removeItems(List<Long> productIds, Account user);

    /**
     * Clear the cart for a user.
     * 
     * @param user the user clearing the cart
     */
    void clearCart(Account user);
}
