package com.ring.repository;

import com.ring.dto.projection.orders.IOrderReceipt;
import com.ring.dto.projection.orders.ICheckoutDetail;
import com.ring.dto.projection.orders.IOrderSummary;
import com.ring.model.entity.OrderReceipt;
import com.ring.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Repository interface named {@link OrderReceiptRepository} for managing
 * {@link OrderReceipt} entities.
 */
@Repository
public interface OrderReceiptRepository extends JpaRepository<OrderReceipt, Long> {

    /**
     * Checks if a user has purchased a book.
     *
     * @param id     the ID of the book to check.
     * @param userId the ID of the user to check for the purchase.
     * @return true if the user has purchased the book, false otherwise.
     */
    @Query("""
                SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END
                FROM OrderReceipt o
                JOIN o.details od
                JOIN od.items oi
                WHERE o.user.id = :userId
                AND oi.book.id = :id
                AND od.status = com.ring.model.enums.OrderStatus.COMPLETED
            """)
    boolean hasUserBoughtBook(Long id,
            Long userId); // Check if user have bought this book before

    /**
     * Retrieves a checkout detail by ID and user ID.
     *
     * @param id     the ID of the checkout to retrieve.
     * @param userId the ID of the user to check for the checkout.
     * @return the {@link ICheckoutDetail} object.
     *         containing the checkout details matching the criteria
     */
    @Query("""
                SELECT o.id AS id,
                    a.name AS name,
                    a.companyName AS companyName,
                    a.detail AS detail,
                    a.address AS address,
                    a.phone AS phone,
                    o.createdDate AS orderedDate,
                    o.lastModifiedDate AS date,
                    p.paymentType AS paymentType,
                    p.status AS paymentStatus,
                    o.total AS total,
                    o.totalDiscount AS totalDiscount,
                    p.expiredAt AS expiredAt
                FROM OrderReceipt o
                JOIN o.payment p
                JOIN o.address a
                WHERE o.id = :id
                AND (COALESCE(:userId) IS NULL OR o.user.id = :userId)
                GROUP BY o.id, a.id, p.id
            """)
    Optional<ICheckoutDetail> findCheckoutDetail(Long id, Long userId);

    /**
     * Retrieves a paginated list of receipt summaries based on the provided
     * filtering criteria.
     * The method allows filtering by shop ID, user ID, and book ID. If no filters
     * are provided,
     * all summaries are retrieved.
     *
     * @param shopId   the ID of the shop to filter receipts by; if null, the filter
     *                 is not applied
     * @param userId   the ID of the shop owner to filter receipts by; if null, the
     *                 filter is not applied
     * @param bookId   the ID of the book to filter receipts by; if null, the filter
     *                 is not applied
     * @param pageable the pagination and sorting information
     * @return a paginated list of {@code IReceiptSummary}, containing the receipt
     *         summaries matching the criteria
     */
    @Query("""
                SELECT od.id AS id,
                    a.name AS name,
                    od.lastModifiedDate AS date,
                    od.status AS status,
                    SUM(oi.price * oi.quantity - oi.couponDiscount) AS totalPrice,
                    SUM(oi.quantity) AS totalItems
                FROM OrderReceipt o
                JOIN o.details od
                JOIN o.address a
                JOIN od.items oi
                JOIN od.shop s
                JOIN oi.book b
                WHERE (COALESCE(:shopId) IS NULL OR s.id = :shopId)
                AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
                AND (COALESCE(:bookId) IS NULL OR b.id = :bookId)
                GROUP BY od.id, a.name, od.lastModifiedDate
            """)
    Page<IOrderSummary> findAllSummaries(Long shopId,
            Long userId,
            Long bookId,
            Pageable pageable);

    @Query("""
                SELECT o.id AS id,
                    o.email AS email,
                    a.phone AS phone,
                    a.name AS name,
                    u.username AS username,
                    i AS image,
                    a.address AS address,
                    o.lastModifiedDate AS date,
                    o.total AS total,
                    o.totalDiscount AS totalDiscount
                FROM OrderReceipt o
                JOIN o.details od
                JOIN od.items oi
                JOIN o.address a
                LEFT JOIN o.user u
                LEFT JOIN u.profile p
                LEFT JOIN p.image i
                LEFT JOIN od.shop s
                LEFT JOIN Book b ON oi.book.id = b.id
                WHERE (COALESCE(:shopId) IS NULL OR s.id = :shopId)
                AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
                AND (COALESCE(:status) IS NULL OR od.status = :status)
                AND CONCAT(b.title, o.id) ILIKE %:keyword%
                GROUP BY o.id, a.id, u.id, i.id
            """)
    Page<IOrderReceipt> findAllBy(Long shopId,
            Long userId,
            OrderStatus status,
            String keyword,
            Pageable pageable);

    /**
     * Retrieves monthly sales data, including sales totals and discounts, grouped
     * by month.
     *
     * @param shopId    the ID of the shop to filter sales by; if null, no shop
     *                  filtering will be applied
     * @param userId    the ID of the user (shop owner) to filter sales by; if null,
     *                  no user filtering will be applied
     * @param bookId    the ID of the book to filter sales by; if null, no book
     *                  filtering will be applied
     * @param startDate the start date-time (inclusive) of the sales range
     * @param endDate   the end date-time (inclusive) of the sales range
     * @return a list of maps where each map represents sales data for a specific
     *         month
     *         including keys for the month (name), total sales (sales), and total
     *         discounts (discount)
     */
    @Query("""
                SELECT FUNCTION('TO_CHAR', o.lastModifiedDate, 'YYYY-MM') AS name,
                    COALESCE(SUM(DISTINCT o.total), 0) AS sales
                FROM OrderReceipt o
                JOIN o.details od
                JOIN od.items oi
                LEFT JOIN od.shop s
                WHERE od.status = com.ring.model.enums.OrderStatus.COMPLETED
                AND (COALESCE(:shopId) IS NULL OR s.id = :shopId)
                AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
                AND (COALESCE(:bookId) IS NULL OR oi.book.id = :bookId)
                AND o.lastModifiedDate >= :startDate
                AND o.lastModifiedDate <= :endDate
                GROUP BY YEAR(o.lastModifiedDate), MONTH(o.lastModifiedDate), FUNCTION('TO_CHAR', o.lastModifiedDate, 'YYYY-MM')
                ORDER BY YEAR(o.lastModifiedDate), MONTH(o.lastModifiedDate)
            """)
    List<Map<String, Object>> getSales(Long shopId,
            Long userId,
            Long bookId,
            LocalDateTime startDate,
            LocalDateTime endDate);
}
