package com.ring.repository;

import com.ring.dto.projection.dashboard.IStat;
import com.ring.dto.projection.shops.*;
import com.ring.model.entity.Account;
import com.ring.model.entity.Shop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface named {@link ShopRepository} for managing {@link Shop}
 * entities.
 */
@Repository
public interface ShopRepository extends JpaRepository<Shop, Long> {

    /**
     * Finds a pageable list of shop displays based on the specified keyword, follow
     * status,
     * and user ID. The method returns data such as shop information, review count,
     * product count,
     * follower count, status of whether the user is following the shop, and other
     * related details.
     *
     * @param keyword  the search string used to filter shops based on their name or
     *                 owner's username.
     * @param followed a Boolean indicating whether to filter shops the user follows
     *                 (true),
     *                 does not follow (false), or both (null).
     * @param userId   the ID of the user making the request, used to determine
     *                 follow status.
     * @param pageable the pageable object specifying pagination settings.
     * @return a paginated list of shop displays containing information such as shop
     *         ID,
     *         name, owner ID, total reviews, total products, total followers,
     *         join date, follow status, and shop image.
     */
    @Query("""
                SELECT s.owner.id AS ownerId,
                    s.id AS id,
                    s.name AS name,
                    count(r.id) AS totalReviews,
                    count(b.id) AS totalProducts,
                    size(s.followers) AS totalFollowers,
                    s.createdDate AS joinedDate,
                    s.verified AS verified,
                    CASE WHEN f.id IS NULL THEN FALSE ELSE TRUE END AS followed, i AS image
                FROM Shop s
                LEFT JOIN s.image i
                LEFT JOIN s.followers f ON f.id = :userId
                LEFT JOIN s.books b
                LEFT JOIN b.bookReviews r
                WHERE CONCAT(s.name, s.owner.username) ILIKE %:keyword%
                AND (COALESCE(:followed) IS NULL OR CASE WHEN :followed = TRUE
                                THEN f.id IS NOT NULL ELSE f.id IS NULL END)
                GROUP BY s.id, s.owner.id, i.id, f.id
            """)
    Page<IShopDisplay> findShopsDisplay(String keyword,
            Boolean followed,
            Long userId,
            Pageable pageable);

    /**
     * Retrieves a paginated list of shops based on a search keyword and optional
     * user ID.
     *
     * @param keyword  the search keyword used to filter shops by their name or
     *                 owner's username
     * @param userId   the ID of the user to filter shops by the associated owner,
     *                 or null to ignore filtering by user
     * @param pageable the pagination and sorting information
     * @return a page of shops containing shop details such as name, ID, owner
     *         information, followers count, created date,
     *         sales data, and an associated image
     */
    @Query(value = """
                SELECT s.owner.username AS username,
                    s.owner.id AS ownerId,
                    s.id AS id,
                    s.name AS name,
                    s.verified AS verified,
                    SIZE(s.followers) AS totalFollowers,
                    s.createdDate AS joinedDate,
                    i AS image,
                    (SELECT COALESCE(SUM(CASE WHEN od.status = com.ring.model.enums.OrderStatus.COMPLETED
                        THEN (o.total - o.totalDiscount) ELSE 0 END), 0)
                        FROM OrderDetail od JOIN od.order o
                        WHERE od.shop.id = s.id) AS sales,
                    (SELECT COALESCE(SUM(oi.quantity), 0)
                        FROM OrderItem oi JOIN oi.detail od
                        WHERE od.shop.id = s.id) AS totalOrders,
                    (SELECT COUNT(b.id) FROM Book b WHERE b.shop.id = s.id) AS totalProducts,
                    (SELECT COUNT(r.id) FROM Book b LEFT JOIN b.bookReviews r WHERE b.shop.id = s.id) AS totalReviews,
                    CASE WHEN (SELECT COUNT(od.id) FROM OrderDetail od WHERE od.shop.id = s.id) = 0 THEN 0.0
                        ELSE ((SELECT COUNT(od.id) FROM OrderDetail od WHERE od.shop.id = s.id
                        AND od.status IN (com.ring.model.enums.OrderStatus.CANCELED, com.ring.model.enums.OrderStatus.REFUNDED)) * 1.0
                        / (SELECT COUNT(od.id) FROM OrderDetail od WHERE od.shop.id = s.id))
                    END AS canceledRate
                FROM Shop s
                LEFT JOIN s.image i
                WHERE CONCAT(s.name, s.owner.username) ILIKE %:keyword%
                AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
                AND s.owner.active = true
            """, countQuery = """
                SELECT COUNT(s) FROM Shop s
                WHERE CONCAT(s.name, s.owner.username) ILIKE %:keyword%
                AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
                AND s.owner.active = true
            """)
    Page<IShop> findShops(String keyword,
            Long userId,
            Pageable pageable);

    /**
     * Retrieves a list of shops that are owned by the specified owner, providing a
     * preview of
     * the shop's id, name, and an optional image.
     *
     * @param ownerId the id of the shop owner whose shops are to be retrieved
     * @return a list of {@code IShopPreview} projections containing the shop id,
     *         name, and image
     */
    @Query("""
                SELECT s.id AS id,
                s.name AS name, i AS image
                FROM Shop s
                LEFT JOIN s.image i
                WHERE s.owner.id = :ownerId
            """)
    List<IShopPreview> findShopsPreview(Long ownerId);

    /**
     * Retrieves a list of Shop entities whose IDs match the given list of IDs.
     *
     * @param ids a list of IDs to be used to retrieve matching Shop entities
     * @return a list of Shop entities corresponding to the provided IDs
     */
    @Query("""
                SELECT s FROM Shop s
                LEFT JOIN FETCH s.address a
                WHERE s.id IN :ids
            """)
    List<Shop> findShopsInIds(List<Long> ids);

    /**
     * Finds the IDs of shops that match the specified list of shop IDs and belong
     * to a specific owner.
     *
     * @param ids     the list of shop IDs to filter by
     * @param ownerId the ID of the owner to filter shops by
     * @return a list of shop IDs that satisfy the criteria
     */
    @Query("""
                SELECT s.id FROM Shop s
                WHERE s.id IN :ids
                AND s.owner.id = :ownerId
            """)
    List<Long> findShopIdsByInIdsAndOwner(List<Long> ids,
            Long ownerId);

    /**
     * Finds the IDs of shops that do not match the specified list of IDs.
     * This query filters shops based on a concatenated keyword in the shop name
     * and owner's username, optionally restricts results to a specific owner, and
     * excludes specified IDs.
     *
     * @param keyword the keyword to search for in the shop's name and the owner's
     *                username.
     * @param ownerId the optional ID of the owner to restrict the shops to, can be
     *                null.
     * @param ids     the list of shop IDs to exclude from the results.
     * @return a list of shop IDs that match the criteria but are not in the
     *         excluded list.
     */
    @Query("""
                SELECT s.id
                FROM Shop s
                WHERE CONCAT(s.name, s.owner.username) ILIKE %:keyword%
                AND (COALESCE(:ownerId) IS NULL OR s.owner.id = :ownerId)
                AND s.id NOT IN :ids
                GROUP BY s.id
            """)
    List<Long> findInverseIds(String keyword,
            Long ownerId,
            List<Long> ids);

    /**
     * Retrieves shop information by its ID for a specific user.
     * The query fetches details such as owner information, shop details,
     * total reviews, total products, total followers, and whether the user follows
     * the shop.
     *
     * @param id     the ID of the shop to retrieve.
     * @param userId the ID of the user to check the follow status for the shop.
     * @return an {@code Optional<IShopInfo>} containing the shop information if
     *         found, or {@code Optional.empty()} if not found.
     */
    @Query("""
                SELECT s.owner.username AS username,
                    s.owner.id AS ownerId,
                    s.id AS id,
                    s.name AS name,
                    s.verified AS verified,
                    s.createdDate AS joinedDate, i AS image,
                    COUNT(DISTINCT r.id) AS totalReviews,
                    COUNT(DISTINCT b.id) AS totalProducts,
                    SIZE(s.followers) AS totalFollowers,
                    CASE WHEN f.id IS NULL THEN FALSE ELSE TRUE END AS followed
                FROM Shop s
                LEFT JOIN s.image i
                LEFT JOIN s.followers f ON f.id = :userId
                LEFT JOIN s.books b
                LEFT JOIN b.bookReviews r
                WHERE s.id = :id
                GROUP BY s.id, s.owner.username, s.owner.id, i.id, f.id
            """)
    Optional<IShopInfo> findShopInfoById(Long id,
            Long userId);

    /**
     * Retrieves the detailed display information of a shop based on its ID and a
     * user's ID.
     * The details include shop owner information, shop details, statistics, and
     * user-specific data such as follow status.
     *
     * @param id     the unique identifier of the shop whose details are to be
     *               fetched.
     * @param userId the unique identifier of the user requesting the shop details,
     *               used for determining follow status.
     * @return an {@link Optional} containing the {@link IShopDisplayDetail} with
     *         the shop's display details if found,
     *         or an empty {@link Optional} if no shop with the specified ID exists.
     */
    @Query("""
                SELECT s.owner.username AS username,
                    s.owner.id AS ownerId,
                    s.id AS id,
                    s.name AS name,
                    s.verified AS verified,
                    s.description AS description,
                    a AS address,
                    (SELECT COALESCE(SUM(oi.quantity), 0)
                        FROM OrderItem oi JOIN oi.detail od
                        WHERE od.shop.id = s.id
                        AND od.status = com.ring.model.enums.OrderStatus.COMPLETED) AS totalSold,
                    CAST(CASE WHEN (SELECT COUNT(od.id) FROM OrderDetail od WHERE od.shop.id = s.id) = 0 THEN 0
                        ELSE ((SELECT COUNT(od.id) FROM OrderDetail od WHERE od.shop.id = s.id
                        AND od.status IN (com.ring.model.enums.OrderStatus.CANCELED, com.ring.model.enums.OrderStatus.REFUNDED)) * 1.0
                        / (SELECT COUNT(od.id) FROM OrderDetail od WHERE od.shop.id = s.id))
                        END AS big_decimal) AS canceledRate,
                    (SELECT COUNT(b.id) FROM Book b WHERE b.shop.id = s.id) AS totalProducts,
                    (SELECT AVG(r.rating) FROM Book b JOIN b.bookReviews r WHERE b.shop.id = s.id) AS rating,
                    (SELECT COUNT(r.id) FROM Book b LEFT JOIN b.bookReviews r WHERE b.shop.id = s.id) AS totalReviews,
                    SIZE(s.followers) AS totalFollowers, i AS image,
                    s.createdDate AS joinedDate, CASE WHEN f.id IS NULL THEN FALSE ELSE TRUE END AS followed
                FROM Shop s
                LEFT JOIN s.image i
                LEFT JOIN s.address a
                LEFT JOIN s.followers f ON f.id = :userId
                WHERE s.id = :id
            """)
    Optional<IShopDisplayDetail> findShopDisplayDetailById(Long id,
            Long userId);

    /**
     * Retrieves detailed information about a shop based on its ID and optionally a
     * user ID.
     * The method returns shop details including owner information, shop metadata,
     * sales data,
     * total sold products, total reviews, total followers, and other related
     * details.
     *
     * @param id     the unique identifier of the shop to fetch details for
     * @param userId the optional user ID to filter results based on ownership, can
     *               be null
     * @return an {@link Optional} containing an {@link IShopDetail} with the shop
     *         details if found, otherwise empty
     */
    @Query("""
                SELECT s.owner.username AS username,
                    s.owner.id as ownerId,
                    s.id AS id,
                    s.name AS name,
                    s.verified AS verified,
                    s.description AS description,
                    a as address,
                    SUM(CASE WHEN od.status = com.ring.model.enums.OrderStatus.COMPLETED
                        THEN o.total - o.totalDiscount ELSE 0 END) AS sales,
                    SUM(CASE WHEN od.status = com.ring.model.enums.OrderStatus.COMPLETED
                        THEN oi.quantity ELSE 0 END) AS totalSold,
                    COUNT(b.id) AS totalProducts,
                    COUNT(r.id) AS totalReviews,
                    i AS image,
                    SIZE(s.followers) AS totalFollowers, s.createdDate AS joinedDate
                from Shop s
                LEFT JOIN s.image i
                LEFT JOIN s.address a
                LEFT JOIN OrderDetail od ON od.shop.id = s.id
                LEFT JOIN od.order o
                LEFT JOIN od.items oi
                LEFT JOIN Book b ON s.id = b.shop.id
                LEFT JOIN Review r ON b.id = r.book.id
                WHERE s.id = :id
                AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
                GROUP BY s.id, s.owner.username, s.owner.id, i.id, a.id
            """)
    Optional<IShopDetail> findShopDetailById(Long id,
            Long userId);

    /**
     * Retrieves shop analytics, including the total number of shops,
     * the number of shops created in the current month, and the number
     * of shops created in the previous month.
     *
     * @param userId the identifier of the shop owner which analytics is to be
     *               retrieved;
     *               if null, analytics is calculated for all owners
     *
     * @return an {@link IStat} instance containing the analytics data,
     *         including the total count of shops, the count for the current month,
     *         and the count for the previous month.
     */
    @Query("""
                SELECT COUNT(s.id) AS total,
                    COUNT(CASE WHEN s.createdDate >= DATE_TRUNC('month', CURRENT DATE) THEN 1 END) AS currentMonth,
                    COUNT(CASE WHEN s.createdDate >= DATE_TRUNC('month', CURRENT DATE) - 1 MONTH
                    AND s.createdDate < DATE_TRUNC('month', CURRENT DATE) THEN 1 END) AS lastMonth
                FROM Shop s
                WHERE (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
            """)
    IStat getShopAnalytics(Long userId);

    /**
     * Deletes all entities associated with the specified owner.
     *
     * @param owner the owner whose related entities are to be deleted
     */
    void deleteAllByOwner(Account owner);
}
