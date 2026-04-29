package com.ring.controller;

import com.ring.config.CurrentAccount;
import com.ring.dto.request.CartItemUpsertRequest;
import com.ring.dto.response.GenericResponse;
import com.ring.dto.response.cart.CartItemDTO;
import com.ring.model.entity.Account;
import com.ring.service.CartService;
import com.ring.service.impl.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller named {@link CartController} for handling user cart operations.
 * Exposes endpoints under "/api/cart".
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final MessageService messageService;

    @GetMapping
    @PreAuthorize("hasRole('USER') and hasAuthority('read:cart')")
    public ResponseEntity<List<CartItemDTO>> getMyCart(@CurrentAccount Account currUser) {
        return new ResponseEntity<>(cartService.getMyCart(currUser), HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') and hasAuthority('create:cart')")
    public ResponseEntity<CartItemDTO> addToCart(
            @Valid @RequestBody CartItemUpsertRequest request,
            @CurrentAccount Account currUser) {
        return new ResponseEntity<>(cartService.addToCart(request, currUser), HttpStatus.CREATED);
    }

    @PatchMapping("/{productId}")
    @PreAuthorize("hasRole('USER') and hasAuthority('update:cart')")
    public ResponseEntity<CartItemDTO> updateCartItemQuantity(
            @PathVariable("productId") Long productId,
            @RequestParam(value = "quantity", defaultValue = "1") Short quantity,
            @CurrentAccount Account currUser) {
        return new ResponseEntity<>(cartService.updateItemQuantity(productId, quantity, currUser), HttpStatus.OK);
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('USER') and hasAuthority('delete:cart')")
    public ResponseEntity<GenericResponse> removeCartItem(
            @PathVariable("productId") Long productId,
            @CurrentAccount Account currUser) {
        cartService.removeItem(productId, currUser);
        return new ResponseEntity<>(new GenericResponse(messageService.getMessage("message.delete.succeeded")),
                HttpStatus.OK);
    }

    @DeleteMapping("/delete-multiple")
    @PreAuthorize("hasRole('USER') and hasAuthority('delete:cart')")
    public ResponseEntity<GenericResponse> removeCartItems(
            @RequestParam(value = "productIds", required = false) List<Long> productIds,
            @RequestParam(value = "ids", required = false) List<Long> legacyIds,
            @CurrentAccount Account currUser) {
        List<Long> idsToDelete = productIds != null ? productIds : legacyIds;
        cartService.removeItems(idsToDelete, currUser);
        return new ResponseEntity<>(new GenericResponse(messageService.getMessage("message.delete.succeeded")),
                HttpStatus.OK);
    }

    @DeleteMapping("/delete-all")
    @PreAuthorize("hasRole('USER') and hasAuthority('delete:cart')")
    public ResponseEntity<GenericResponse> clearCart(@CurrentAccount Account currUser) {
        cartService.clearCart(currUser);
        return new ResponseEntity<>(new GenericResponse(messageService.getMessage("message.delete.succeeded")),
                HttpStatus.OK);
    }
}
