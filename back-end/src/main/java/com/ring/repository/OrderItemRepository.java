package com.ring.repository;

import com.ring.dto.projection.orders.IOrderItem;
import com.ring.model.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface named {@link OrderItemRepository} for managing
 * {@link OrderItem} entities.
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Retrieves a list of order items and their associated details based on the provided
     * detail IDs. The result includes information about the order item, book, order
     * detail, and shop, if available.
     *
     * @param ids the list of detail IDs to filter the query
     * @return a list of {@link IOrderItem} projections containing order item and related details
     */
    @Query("""
        SELECT oi.id AS id, 
            oi.quantity AS quantity, 
            oi.price AS price, 
            oi.discount AS discount,
            b.id AS bookId, 
            b.title AS title, 
            b.slug AS slug, 
            i AS image, 
            od.id AS detailId
        FROM OrderItem oi
        JOIN oi.detail od
        LEFT JOIN od.shop s
        LEFT JOIN oi.book b
        LEFT JOIN b.image i
        WHERE od.id IN :ids
        GROUP BY oi.id, b.id, od.id, i.id
        ORDER BY oi.detail.id DESC
    """)
    List<IOrderItem> findAllWithDetailIds(List<Long> ids);
}
