package com.ring.repository;

import com.ring.dto.projection.dashboard.IStat;
import com.ring.dto.projection.orders.IOrder;
import com.ring.dto.projection.orders.IOrderDetail;
import com.ring.model.entity.OrderDetail;
import com.ring.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface named {@link OrderDetailRepository} for managing
 * {@link OrderDetail} entities.
 */
@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    /**
     * Retrieves an OrderDetail entity by its ID.
     * It fetches related Order entity data using a join fetch.
     *
     * @param id the ID of the OrderDetail to retrieve
     * @return an Optional containing the OrderDetail if found, or an empty Optional
     *         if not found
     */
    @Query("""
        SELECT od 
        FROM OrderDetail od
        JOIN FETCH od.order o
        WHERE od.id = :id
    """)
    Optional<OrderDetail> findDetailById(Long id);

    @Query("""
        SELECT o.id AS orderId, 
                od.id AS id, 
                s.id AS shopId, 
                s.name AS shopName, 
                od.note AS note,
                od.lastModifiedDate AS date, 
                od.totalPrice AS totalPrice, 
                od.discount AS discount,
                od.shippingFee AS shippingFee, 
                od.shippingDiscount AS shippingDiscount, 
                SUM(oi.quantity) AS totalItems,
                od.status AS status
        FROM OrderDetail od
        JOIN od.order o
        JOIN OrderItem oi ON od.id = oi.detail.id
        LEFT JOIN Shop s ON od.shop.id = s.id
        LEFT JOIN Book b ON oi.book.id = b.id
        WHERE od.order.user.id = :id
        AND (COALESCE(:status) IS NULL OR od.status = :status)
        AND CONCAT(b.title, s.name, od.order.id) ILIKE %:keyword%
        GROUP BY o.id, s.id, od.id
        ORDER BY od.id DESC
    """)
    Page<IOrder> findAllByUserId(Long id,
            OrderStatus status,
            String keyword,
            Pageable pageable);

    @Query("""
        SELECT o.id AS orderId, 
                od.id AS id, 
                s.id AS shopId, 
                s.name AS shopName, 
                od.note AS note,
                od.lastModifiedDate AS date, 
                od.totalPrice AS totalPrice, 
                od.discount AS discount,
                od.shippingFee AS shippingFee, 
                od.shippingDiscount AS shippingDiscount, 
                SUM(oi.quantity) AS totalItems,
                od.status AS status
        FROM OrderDetail od
        JOIN od.order o
        JOIN OrderItem oi ON od.id = oi.detail.id
        LEFT JOIN Shop s ON od.shop.id = s.id
        LEFT JOIN Book b ON oi.book.id = b.id
        WHERE b.id = :id
        GROUP BY o.id, s.id, od.id
        ORDER BY od.id DESC
    """)
    Page<IOrder> findAllByBookId(Long id,
            Pageable pageable); // Get orders with book's {id}

    /**
     * Retrieves a list of distinct order details along with additional information
     * such AS order ID, shop name, user data, address details, and aggregated
     * information of the provided receipt IDs.
     *
     * @param ids the list of receipt IDs to retrieve order details for
     * @return a list of {@code IOrder} objects matching the provided receipt
     *         IDs,
     *         containing detailed information about the orders
     */
    @Query("""
        SELECT o.id AS orderId, 
                od.id AS id, 
                s.id AS shopId, 
                s.name AS shopName, 
                od.note AS note,
                od.lastModifiedDate AS date, 
                od.totalPrice AS totalPrice, 
                od.discount AS discount,
                od.shippingFee AS shippingFee, 
                od.shippingDiscount AS shippingDiscount, 
                SUM(oi.quantity) AS totalItems,
                od.status AS status
        FROM OrderDetail od
        JOIN od.order o
        JOIN OrderItem oi ON od.id = oi.detail.id
        LEFT JOIN Shop s ON od.shop.id = s.id
        WHERE o.id IN :ids
        GROUP BY o.id, s.id, od.id
    """)
    List<IOrder> findAllByReceiptIds(List<Long> ids);

    @Query("""
        SELECT o.id AS orderId, 
                od.id AS id, 
                s.id AS shopId, 
                s.name AS shopName, 
                od.note AS note,
                od.lastModifiedDate AS date, 
                od.totalPrice AS totalPrice, 
                od.discount AS discount,
                od.shippingFee AS shippingFee, 
                od.shippingDiscount AS shippingDiscount, 
                SUM(oi.quantity) AS totalItems,
                od.status AS status
        FROM OrderDetail od
        JOIN od.order o
        JOIN OrderItem oi ON od.id = oi.detail.id
        LEFT JOIN Shop s ON od.shop.id = s.id
        WHERE o.id = :id
        GROUP BY o.id, s.id, od.id
    """)
    List<IOrder> findAllByReceiptId(Long id);

    @Query("""
        SELECT od.id AS id, 
                o.id AS orderId, 
                a.name AS name, 
                a.companyName AS companyName,
                a.city AS city, 
                a.address AS address, 
                od.note AS note, 
                a.phone AS phone,
                od.createdDate AS orderedDate, 
                od.lastModifiedDate AS date, 
                p.paymentType AS paymentType,
                od.totalPrice AS totalPrice, 
                od.shippingFee AS shippingFee, 
                od.shippingType AS shippingType,
                od.shippingDiscount AS shippingDiscount, 
                od.discount AS discount, 
                od.status AS status,
                s.id AS shopId, 
                s.name AS shopName, 
                p.status AS paymentStatus
        FROM OrderDetail od
        JOIN od.items oi
        JOIN od.order o
        LEFT JOIN o.payment p
        LEFT JOIN o.address a
        LEFT JOIN od.shop s
        LEFT JOIN oi.book b
        LEFT JOIN b.image i
        WHERE od.id = :id
        AND (COALESCE(:userId) IS NULL OR o.user.id = :userId)
        GROUP BY o.id, s.id, od.id, a.id, p.id
    """)
    Optional<IOrderDetail> findOrderDetail(Long id, Long userId);

    /**
     * Retrieves sales analytics for a shop or user, including total sales for the
     * current and last month.
     * The query calculates the total revenue after applying discounts and excludes
     * shipping fees.
     *
     * @param shopId the ID of the shop to filter the analytics. If null, analytics
     *               for all shops are included.
     * @param userId the ID of the user (shop owner) to filter the analytics. If
     *               null, analytics for all users are included.
     * @return statistics containing total sales for the current month and the
     *         previous month.
     */
    @Query("""
        SELECT COALESCE(SUM(CASE WHEN od.lastModifiedDate >= DATE_TRUNC('month', current date)
                THEN (od.totalPrice - od.discount) END), 0) AS currentMonth,
        COALESCE(SUM(CASE WHEN od.lastModifiedDate >= DATE_TRUNC('month', current date) - 1 month
                AND od.lastModifiedDate < DATE_TRUNC('month', current date)
                THEN (od.totalPrice - od.discount) END), 0) lastMonth
        FROM OrderDetail od
        LEFT JOIN od.shop s
        WHERE od.status = com.ring.model.enums.OrderStatus.COMPLETED
        AND od.lastModifiedDate >= DATE_TRUNC('month', current date) - 1 month
        AND (COALESCE(:shopId) IS NULL OR s.id = :shopId)
        AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
    """)
    IStat getSalesAnalytics(Long shopId,
            Long userId);

    @Modifying
    @Query("""
        UPDATE OrderDetail od
        SET od.status = com.ring.model.enums.OrderStatus.CANCELED,
                od.note = :reason
        WHERE od.order.id = :id
        AND od.status = com.ring.model.enums.OrderStatus.PENDING_PAYMENT
    """)
    void cancelUnpaidByOrderId(Long id, String reason);

    @Modifying
    @Query("""
        UPDATE OrderDetail od
        SET od.status = com.ring.model.enums.OrderStatus.PENDING
        WHERE od.order.id = :id
        AND od.status = com.ring.model.enums.OrderStatus.PENDING_PAYMENT
    """)
    void confirmPaymentByOrderId(Long id);
}
