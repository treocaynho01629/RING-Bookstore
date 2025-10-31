package com.ring.repository;

import com.ring.dto.projection.orders.IOrderReceipt;
import com.ring.dto.projection.orders.IReceiptDetail;
import com.ring.dto.projection.orders.IReceiptSummary;
import com.ring.model.entity.OrderReceipt;
import com.ring.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

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

    @Query("""
        SELECT o.id AS id, 
            a.name AS name, 
            a.companyName AS companyName,
            a.city AS city, 
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
    Optional<IReceiptDetail> findReceiptDetail(Long id, Long userId);

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
    @Query(value = """
        SELECT DISTINCT o.id AS id, 
            i AS image, 
            a.name AS name,
            o.lastModifiedDate AS date, 
            o.total - o.totalDiscount AS totalPrice,
        SUM(oi.quantity) AS totalItems
        FROM OrderReceipt o
        JOIN o.details od
        JOIN o.address a
        JOIN od.items oi
        LEFT JOIN o.user u
        LEFT JOIN u.profile p
        LEFT JOIN p.image i
        LEFT JOIN od.shop s
        LEFT JOIN oi.book b
        WHERE (COALESCE(:shopId) IS NULL OR s.id = :shopId)
        AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
        AND (COALESCE(:bookId) IS NULL OR b.id = :bookId)
        GROUP BY o.id, i.id, a.name, o.lastModifiedDate
    """, 
    countQuery = """
        SELECT COUNT(o.id)
        FROM OrderReceipt o
        JOIN o.details od
        JOIN od.items oi
        LEFT JOIN od.shop s
        LEFT JOIN oi.book b
        WHERE (COALESCE(:shopId) IS NULL OR s.id = :shopId)
        AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
        AND (COALESCE(:bookId) IS NULL OR b.id = :bookId)
    """)
    Page<IReceiptSummary> findAllSummaries(Long shopId,
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
     * @param shopId the ID of the shop to filter sales by; if null, no shop
     *               filtering will be applied
     * @param userId the ID of the user (shop owner) to filter sales by; if null, no
     *               user filtering will be applied
     * @param year   the year to filter sales by; if null, no year filtering will be
     *               applied
     * @return a list of maps where each map represents sales data for a specific
     *         month
     *         including keys for the month (name), total sales (sales), and total
     *         discounts (discount)
     */
    @Query("""
        SELECT MONTH(o.lastModifiedDate) AS name,
            COALESCE(SUM(DISTINCT od.discount), 0) AS discount,
            COALESCE(SUM(DISTINCT o.total), 0) AS sales
        FROM OrderReceipt o
        JOIN o.details od
        LEFT JOIN od.shop s
        WHERE od.status = com.ring.model.enums.OrderStatus.COMPLETED
        AND (COALESCE(:shopId) IS NULL OR s.id = :shopId)
        AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
        AND (COALESCE(:year) IS NULL OR YEAR(o.lastModifiedDate) = :year)
        GROUP BY MONTH(o.lastModifiedDate)
    """)
    List<Map<String, Object>> getMonthlySales(Long shopId,
            Long userId,
            Integer year); // Get monthly sale
}
