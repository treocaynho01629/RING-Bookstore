package com.ring.repository;

import com.ring.dto.projection.books.IBookDisplay;
import com.ring.dto.projection.books.IBookItem;
import com.ring.dto.projection.dashboard.IStat;
import com.ring.model.entity.Account;
import com.ring.model.entity.Book;
import com.ring.model.enums.BookType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Repository interface named {@link BookRepository} for managing {@link Book}
 * entities.
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    /**
     * Finds books that match the specified filter criteria.
     *
     * @param keyword   the search keyword to match against book titles, authors, or
     *                  shop names
     * @param cateId    the category ID to filter books by specific category or its
     *                  parent category; can be null
     * @param pubIds    the list of publisher IDs to filter books by publishers; can
     *                  be null
     * @param types     the list of book types to filter books by; can be null
     * @param shopId    the shop ID to filter books by a specific shop; can be null
     * @param userId    the user ID to filter books by shop owner; can be null
     * @param fromRange the minimum price range (after applying discounts) to filter
     *                  books by
     * @param toRange   the maximum price range (after applying discounts) to filter
     *                  books by
     * @param withDesc  a flag indicating whether to include book descriptions in
     *                  the result
     * @param rating    the minimum average rating to filter books by
     * @param amount    the minimum available quantity to filter books by
     * @param pageable  the pagination information to define the page size and
     *                  sorting
     * @return a page containing books matching the filter criteria encapsulated AS
     *         IBookDisplay objects
     */
    @Query(value = """
                SELECT b.id AS id,
                b.slug AS slug,
                b.title AS title,
                    (CASE WHEN :withDesc = TRUE THEN b.description ELSE NULL END) AS description,
                    b.price AS price,
                    b.discount AS discount,
                    b.amount AS amount,
                    s.id AS shopId,
                    s.name AS shopName,
                    i AS image,
                    COALESCE(rv.rating, 0) AS rating,
                    COALESCE(od.totalOrders, 0) AS totalOrders
                FROM Book b
                JOIN b.shop s
                LEFT JOIN b.image i
                LEFT JOIN (
                    SELECT r.book.id AS book_id,
                        AVG(r.rating) AS rating
                    FROM Review r
                    GROUP BY r.book.id
                ) rv ON b.id = rv.book_id
                LEFT JOIN (
                    SELECT o.book.id AS book_id,
                    SUM(o.quantity) AS totalOrders
                    FROM OrderItem o
                    GROUP BY o.book.id
                ) od ON b.id = od.book_id
                WHERE LOWER(CONCAT(b.title, ' ', b.author, ' ', s.name)) LIKE LOWER(CONCAT('%', :keyword, '%'))
                AND (:cateId IS NULL OR b.cate.id = :cateId OR b.cate.parent.id = :cateId)
                AND (:pubIds IS NULL OR b.publisher.id IN :pubIds)
                AND (:types IS NULL OR b.type IN :types)
                AND (:shopId IS NULL OR b.shop.id = :shopId)
                AND (:userId IS NULL OR b.shop.owner.id = :userId)
                AND b.price * (1 - b.discount) BETWEEN :fromRange AND :toRange
                AND b.amount >= :amount
                GROUP BY b.id, b.slug, b.title, b.description, b.price, b.discount, b.amount,
                         s.id, s.name, i.id, rv.rating, od.totalOrders
                HAVING COALESCE(rv.rating, 0) >= :rating
            """, countQuery = """
                SELECT COUNT(DISTINCT b.id)
                FROM Book b
                JOIN b.shop s
                LEFT JOIN (
                    SELECT r.book.id AS book_id,
                        AVG(r.rating) AS rating
                    FROM Review r
                    GROUP BY r.book.id
                ) rv ON b.id = rv.book_id
                WHERE LOWER(CONCAT(b.title, ' ', b.author, ' ', s.name)) LIKE LOWER(CONCAT('%', :keyword, '%'))
                AND (:cateId IS NULL OR b.cate.id = :cateId OR b.cate.parent.id = :cateId)
                AND (:pubIds IS NULL OR b.publisher.id IN :pubIds)
                AND (:types IS NULL OR b.type IN :types)
                AND (:shopId IS NULL OR b.shop.id = :shopId)
                AND (:userId IS NULL OR b.shop.owner.id = :userId)
                AND b.price * (1 - b.discount) BETWEEN :fromRange AND :toRange
                AND b.amount >= :amount
                AND COALESCE(rv.rating, 0) >= :rating
            """)
    Page<IBookDisplay> findBooksWithFilter(String keyword,
            Integer cateId,
            List<Integer> pubIds,
            List<BookType> types,
            Long shopId,
            Long userId,
            Double fromRange,
            Double toRange,
            Boolean withDesc,
            Integer rating,
            Integer amount,
            Pageable pageable);

    /**
     * Retrieves a list of random books based on the specified number of books to
     * fetch.
     * Optionally includes descriptions depending on the provided parameter.
     *
     * @param amount   the number of random books to retrieve
     * @param withDesc a boolean indicating whether to include book descriptions in
     *                 the result
     * @return a List of {@link IBookDisplay} containing the details of the randomly
     *         fetched books
     */
    @Query("""
                SELECT b.id AS id,
                    b.slug AS slug,
                    b.title AS title,
                    (CASE WHEN :withDesc = TRUE THEN b.description ELSE NULL END) AS description,
                    b.price AS price,
                    b.discount AS discount,
                    b.amount AS amount,
                    s.id AS shopId,
                    s.name AS shopName,
                    i AS image,
                    COALESCE(rv.rating, 0) AS rating,
                    COALESCE(od.totalOrders, 0) AS totalOrders
                FROM Book b
                JOIN b.shop s
                LEFT JOIN b.image i
                LEFT JOIN (
                    SELECT r.book.id AS book_id,
                        AVG(r.rating) AS rating
                    FROM Review r
                    GROUP BY r.book.id
                ) rv ON b.id = rv.book_id
                LEFT JOIN (
                    SELECT o.book.id AS book_id,
                        SUM(o.quantity) AS totalOrders
                    FROM OrderItem o
                    GROUP BY o.book.id
                ) od ON b.id = od.book_id
                GROUP BY b, i.id, rv.rating, od.totalOrders, s.id, s.name
                ORDER BY random()
                LIMIT :amount
            """)
    List<IBookDisplay> findRandomBooks(Integer amount,
            Boolean withDesc); // Get random books

    /**
     * Retrieves a list of books matching the given IDs with detailed information
     * such AS id, slug, title, price,
     * discount, amount, associated shop details (id, name), image, rating, and
     * total orders.
     *
     * This method performs a query that joins multiple entities, such AS Shop,
     * Image, Review, and OrderItem,
     * to gather the required information for display purposes.
     *
     * @param ids a list of book IDs for which the display information is to be
     *            retrieved
     * @return a list of {@link IBookDisplay} containing the display information of
     *         the books matching the given IDs
     */
    @Query("""
                SELECT b.id AS id,
                    b.slug AS slug,
                    b.title AS title,
                    b.price AS price,
                    b.discount AS discount,
                    b.amount AS amount,
                    s.id AS shopId,
                    s.name AS shopName,
                    i AS image,
                    COALESCE(rv.rating, 0) AS rating,
                    COALESCE(od.totalOrders, 0) AS totalOrders
                FROM Book b
                JOIN b.shop s
                LEFT JOIN b.image i
                LEFT JOIN (
                    SELECT r.book.id AS book_id,
                        AVG(r.rating) AS rating
                    FROM Review r
                    GROUP BY r.book.id
                ) rv ON b.id = rv.book_id
                LEFT JOIN (
                    SELECT o.book.id AS book_id,
                        SUM(o.quantity) AS totalOrders
                    FROM OrderItem o
                    GROUP BY o.book.id
                ) od ON b.id = od.book_id
                WHERE b.id IN :ids
            """)
    List<IBookDisplay> findBooksDisplayInIds(List<Long> ids);

    /**
     * Retrieves a list of books given their IDs.
     *
     * @param ids a list of book IDs to look up
     * @return a list of Book entities matching the provided IDs
     */
    @Query("""
                SELECT b.id AS id,
                    b AS book,
                    d.bLength AS length,
                    d.bWidth AS width,
                    d.bHeight AS height,
                    d.bWeight AS weight
                FROM Book b
                LEFT JOIN BookDetail d
                ON b.id = d.id
                WHERE b.id IN :ids
            """)
    List<IBookItem> findBookItemsInIds(List<Long> ids);

    /**
     * Finds and retrieves a list of book IDs from the database that match the given
     * list of IDs
     * and belong to the specified owner.
     *
     * @param ids     the list of book IDs to be searched
     * @param ownerId the ID of the owner to whom the books must belong
     * @return a list of book IDs that match the given criteria
     */
    @Query("""
                SELECT b.id FROM Book b
                WHERE b.id IN :ids
                AND b.shop.owner.id = :ownerId
            """)
    List<Long> findBookIdsByInIdsAndOwner(List<Long> ids, Long ownerId);

    /**
     * Retrieves a list of book IDs that match specified search criteria and
     * filters, excluding specific IDs.
     *
     * @param keyword   The search keyword to match against the concatenation of
     *                  book title, author, and shop name.
     * @param cateId    The ID of the category to filter books by. Supports category
     *                  or its parent ID.
     * @param pubIds    A list of publisher IDs to filter books by. Can be null.
     * @param types     A list of book types to filter by. Can be null.
     * @param shopId    The ID of the shop to filter books by. Can be null.
     * @param userId    The ID of the shop owner to filter books by. Can be null.
     * @param fromRange The minimum price range (considering discounts) for
     *                  filtering.
     * @param toRange   The maximum price range (considering discounts) for
     *                  filtering.
     * @param rating    The minimum average rating to filter books by. Defaults to
     *                  zero if not provided.
     * @param amount    The minimum stock amount to filter books by.
     * @param ids       A list of book IDs to exclude from the results.
     * @return A list of book IDs that satisfy the provided criteria.
     */
    @Query("""
                SELECT b.id
                FROM Book b
                JOIN b.shop s
                LEFT JOIN (
                    SELECT r.book.id AS book_id,
                        AVG(r.rating) AS rating
                    FROM Review r
                    GROUP BY r.book.id
                ) rv ON b.id = rv.book_id
                WHERE CONCAT(b.title, b.author, s.name) ILIKE %:keyword%
                AND (COALESCE(:cateId) IS NULL OR b.cate.id = :cateId or b.cate.parent.id = :cateId)
                AND (COALESCE(:pubIds) IS NULL OR b.publisher.id in :pubIds)
                AND (COALESCE(:types) IS NULL OR b.type in :types)
                AND (COALESCE(:shopId) IS NULL OR b.shop.id = :shopId)
                AND (COALESCE(:userId) IS NULL OR b.shop.owner.id = :userId)
                AND COALESCE(rv.rating, 0) >= :rating
                AND b.price * (1 - b.discount) BETWEEN :fromRange AND :toRange
                AND b.amount >= :amount
                AND b.id NOT IN :ids
                GROUP BY b, rv.rating, s.id, s.name
            """)
    List<Long> findInverseIds(String keyword,
            Integer cateId,
            List<Integer> pubIds,
            List<BookType> types,
            Long shopId,
            Long userId,
            Double fromRange,
            Double toRange,
            Integer rating,
            Integer amount,
            List<Long> ids);

    /**
     * Retrieves analytics related to books such AS the total number of books,
     * books created in the current month, and books created in the last month.
     *
     * @param shopId the identifier of the shop for which analytics is to be
     *               retrieved;
     *               if null, analytics is calculated for all shops
     * @param userId the identifier of the shop owner which analytics is to be
     *               retrieved;
     *               if null, analytics is calculated for all owners
     * @return an object of type {@code IStat} containing the book analytics,
     *         including the total count,
     *         current month count, and last month count
     */
    @Query("""
                SELECT COUNT(b.id) AS total,
                    COUNT(CASE WHEN b.createdDate >= DATE_TRUNC('month', CURRENT DATE) THEN 1 END) AS currentMonth,
                    COUNT(CASE WHEN b.createdDate >= DATE_TRUNC('month', CURRENT DATE) - 1 MONTH
                    AND b.createdDate < DATE_TRUNC('month', CURRENT DATE) THEN 1 END) AS lastMonth
                FROM Book b
                WHERE (COALESCE(:shopId) IS NULL OR b.shop.id = :shopId)
                AND (COALESCE(:userId) IS NULL OR b.shop.owner.id = :userId)
            """)
    IStat getBookAnalytics(Long shopId, Long userId);

    /**
     * Retrieves a list of suggested keywords that match the given keyword, based on
     * the database query.
     * The method derives possible suggestions from the `title` field of the `Book`
     * entity.
     *
     * @param keyword the search keyword used for finding suggestions. It is matched
     *                against book titles.
     * @return a list of up to 9 suggested keywords, sorted by relevance to the
     *         given keyword.
     */
    @Query(value = """
                SELECT t.keyword
                from (
                    SELECT DISTINCT substring(left(lower(regexp_replace(
                        b.title, CONCAT('^.*?(\\S*', :keyword, '\\S*)'), '\\1', 'i')) || ' ', 24) from '.*\\s') AS keyword
                    FROM Book b
                    WHERE b.title ILIKE CONCAT('%', :keyword, '%')
                ) t
                ORDER BY CASE WHEN t.keyword ILIKE CONCAT('%', :keyword, '%') THEN 1 ELSE 2 END, t.keyword
                LIMIT 9
            """, nativeQuery = true)
    List<String> findSuggestion(String keyword);

    /**
     * Decreases the stock quantity of a specified book by the given amount.
     *
     * @param id     the unique identifier of the book whose stock is to be
     *               decreased
     * @param amount the number of units to decrease from the book's stock
     */
    @Modifying
    @Transactional
    @Query("""
                UPDATE Book b
                SET b.amount = b.amount - :amount
                WHERE b.id = :id
            """)
    void decreaseStock(Long id, short amount);

    /**
     * Deletes all records associated with the given shop ID.
     *
     * @param shopId the ID of the shop whose associated records should be deleted
     */
    void deleteAllByShopId(Long shopId);

    /**
     * Deletes all entities associated with the given shop owner.
     *
     * @param owner the account representing the shop owner whose associated
     *              entities are to be deleted
     */
    void deleteAllByShop_Owner(Account owner);

    /**
     * Deletes all entities associated with the given shop ID and shop owner.
     *
     * @param shopId the unique identifier of the shop whose associated entities are
     *               to be deleted
     * @param owner  the account representing the owner of the shop
     */
    void deleteAllByShopIdAndShop_Owner(Long shopId, Account owner);
}
