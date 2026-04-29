package com.ring.service.impl;

import com.ring.dto.request.CartItemUpsertRequest;
import com.ring.dto.response.cart.CartItemDTO;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.CartMapper;
import com.ring.model.entity.Account;
import com.ring.model.entity.Book;
import com.ring.model.entity.CartItem;
import com.ring.repository.CartItemRepository;
import com.ring.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for managing server-side cart items.
 */
@RequiredArgsConstructor
@Service
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepo;
    private final MessageService messageService;
    private final CartMapper cartMapper;

    @Transactional(readOnly = true)
    public List<CartItemDTO> getMyCart(Account user) {
        return cartItemRepo.findAllByUserId(user.getId()).stream()
                .map(cartMapper::apply)
                .toList();
    }

    @Transactional
    public CartItemDTO addToCart(CartItemUpsertRequest request, Account user) {
        Book product = new Book();
        product.setId(request.getProductId());

        CartItem item = cartItemRepo.findByUserIdAndProductId(user.getId(), request.getProductId())
                .orElseGet(() -> CartItem.builder()
                        .user(user)
                        .product(product)
                        .quantity((short) 0)
                        .build());

        item.setQuantity((short) (item.getQuantity() + request.getQuantity()));
        return cartMapper.apply(cartItemRepo.save(item));
    }

    @Transactional
    public CartItemDTO updateItemQuantity(Long productId, Short quantity, Account user) {
        CartItem item = findOwnedCartItem(productId, user);
        item.setQuantity(quantity);
        return cartMapper.apply(cartItemRepo.save(item));
    }

    @Transactional
    public void removeItem(Long productId, Account user) {
        cartItemRepo.deleteByUserIdAndProductId(user.getId(), productId);
    }

    @Transactional
    public void removeItems(List<Long> productIds, Account user) {
        if (productIds == null || productIds.isEmpty()) {
            return;
        }
        cartItemRepo.deleteAllByUserIdAndProductIdIn(user.getId(), productIds);
    }

    @Transactional
    public void clearCart(Account user) {
        cartItemRepo.deleteAllByUserId(user.getId());
    }

    /**
     * Finds a cart item owned by a user.
     * 
     * @param productId the ID of the product
     * @param user      the user
     * @return the cart item
     * @throws ResourceNotFoundException if the cart item is not found
     */
    private CartItem findOwnedCartItem(Long productId, Account user) {
        return cartItemRepo.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.cart") });
                    return new ResourceNotFoundException(errorMsg);
                });
    }
}
