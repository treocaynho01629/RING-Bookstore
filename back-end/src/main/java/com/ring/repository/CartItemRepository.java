package com.ring.repository;

import com.ring.model.entity.CartItem;
import com.ring.model.entity.CartItemId;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface named {@link CartItemRepository} for managing
 * {@link CartItem} entities.
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, CartItemId> {

    @EntityGraph(attributePaths = { "product", "product.shop", "product.image" })
    List<CartItem> findAllByUserId(Long userId);

    @EntityGraph(attributePaths = { "product", "product.shop", "product.image" })
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);

    @EntityGraph(attributePaths = { "product", "product.shop", "product.image" })
    List<CartItem> findAllByUserIdAndProductIdIn(Long userId, List<Long> productIds);

    void deleteAllByUserId(Long userId);

    void deleteAllByUserIdAndProductIdIn(Long userId, List<Long> productIds);

    void deleteByUserIdAndProductId(Long userId, Long productId);
}
