package com.ring.repository;

import com.ring.dto.projection.coupons.ICoupon;
import com.ring.dto.projection.dashboard.IStat;
import com.ring.model.entity.Account;
import com.ring.model.entity.Coupon;
import com.ring.model.enums.CouponCriteria;
import com.ring.model.enums.CouponType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface named {@link CouponRepository} for managing
 * {@link Coupon} entities.
 */
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    /**
     * Checks whether a user has used a specific coupon.
     *
     * @param id     the identifier of the coupon
     * @param userId the identifier of the user
     * @return true if the user has used the coupon; false otherwise
     */
    @Query("""
                SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END
                FROM OrderReceipt o
                JOIN o.details od
                WHERE (o.coupon.id = :id OR od.coupon.id = :id)
                AND o.user.id = :userId
            """)
    boolean hasUserUsedCoupon(Long id, Long userId);

    /**
     * Finds coupons based on the provided filter criteria. The method executes a
     * query to retrieve
     * coupons along with associated shop names and shop images if applicable.
     * Filters include
     * coupon types, specific codes, shop ID, and conditions like whether to include
     * expired coupons
     * or coupons linked with shops.
     *
     * @param types       a list of {@code CouponType} representing the types of
     *                    coupons to filter by
     * @param criterias   a list of {@code CouponCriteria} representing the criteria
     *                    of
     *                    coupons to filter by
     * @param codes       a list of coupon codes to filter the results by
     * @param code        a specific coupon code to filter the results by
     * @param shopId      the ID of the shop to filter the associated coupons
     * @param userId      the ID of the shop owner to filter the associated coupons
     * @param byShop      a boolean flag to determine whether to include coupons
     *                    linked with a shop
     * @param showExpired a boolean flag to include expired
     */
    @Query("""
                SELECT c AS coupon,
                    s.name AS shopName,
                    i AS shopImage,
                    CASE WHEN COALESCE(:userId) IS NULL OR o.couponId IS NOT NULL
                        THEN TRUE
                        ELSE FALSE END
                    AS isUsed
                FROM Coupon c
                JOIN FETCH c.detail cd
                LEFT JOIN c.shop s
                LEFT JOIN s.image i
                LEFT JOIN (
                    SELECT od.coupon.id AS couponId
                    FROM OrderDetail od
                    LEFT JOIN (
                        SELECT os.id AS id
                        FROM OrderReceipt os
                        WHERE os.user.id = :userId
                        GROUP BY os.id
                    ) ors ON od.order.id = ors.id
                    GROUP BY od.coupon.id
                ) o ON o.couponId = c.id
                WHERE (CASE WHEN :showExpired = false THEN (cd.expDate > CURRENT DATE AND cd.usage > 0) ELSE TRUE END)
                AND (COALESCE(:codes) IS NULL OR c.code IN :codes)
                AND (COALESCE(:code) IS NULL OR c.code = :code)
                AND (COALESCE(:types) IS NULL OR cd.type IN :types)
                AND (COALESCE(:criterias) IS NULL OR cd.criteria IN :criterias)
                AND (COALESCE(:shopId) IS NULL OR s.id = :shopId)
                AND (COALESCE(:ownerId) IS NULL OR s.owner.id = :ownerId)
                AND (COALESCE(:byShop) IS NULL OR CASE WHEN :byShop = true THEN s.id IS NOT NULL ELSE s.id IS NULL END)
                AND (CASE WHEN :showUsed = false THEN o.couponId IS NULL ELSE TRUE END)
                GROUP BY c.id, cd.id, s.name, i.id, o.couponId
            """)
    Page<ICoupon> findCoupons(List<CouponType> types,
            List<CouponCriteria> criterias,
            List<String> codes,
            String code,
            Long shopId,
            Long ownerId,
            Boolean byShop,
            Boolean showExpired,
            Boolean showUsed,
            Long userId,
            Pageable pageable);

    /**
     * Retrieves a list of coupon IDs based on the provided coupon IDs and seller's
     * owner ID.
     * This method filters the coupon IDs that belong to the specified seller.
     *
     * @param ids     a list of coupon IDs to filter.
     * @param ownerId the ID of the seller (shop owner) to filter the coupons by.
     * @return a list of coupon IDs that match the criteria.
     */
    @Query("""
                SELECT c.id FROM Coupon c
                WHERE c.id IN :ids
                AND c.shop.owner.id = :ownerId
            """)
    List<Long> findCouponIdsByInIdsAndSeller(List<Long> ids, Long ownerId);

    /**
     * Retrieves a list of coupon IDs that do not match the specified criteria.
     *
     * @param types     The list of {@code CouponType} to filter by, or {@code null}
     *                  to
     *                  ignore this filter.
     * @param criterias The list of {@code CouponCriteria} to filter by, or
     *                  {@code null} to
     *                  ignore this filter.
     * @param codes     The list of coupon codes to filter by, or {@code null} to
     *                  ignore this filter.
     * @param code      A specific coupon code to filter by, or {@code null} to
     *                  ignore
     *                  this filter.
     * @param shopId    The ID of the shop to filter by, or {@code null} to ignore
     *                  this
     *                  filter.
     * @param byShop    A {@code Boolean} determining whether to
     */
    @Query("""
                SELECT c.id FROM Coupon c
                JOIN c.detail cd
                LEFT JOIN c.shop s
                WHERE (COALESCE(:showExpired) IS NULL OR (cd.expDate > CURRENT DATE AND cd.usage > 0))
                AND (COALESCE(:codes) IS NULL OR c.code IN :codes)
                AND (COALESCE(:code) IS NULL OR c.code = :code)
                AND (COALESCE(:types) IS NULL OR cd.type IN :types)
                AND (COALESCE(:criterias) IS NULL OR cd.criteria IN :criterias)
                AND (COALESCE(:shopId) IS NULL OR s.id = :shopId)
                AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
                AND (COALESCE(:byShop) IS NULL OR CASE WHEN :byShop = true THEN s.id IS NOT NULL ELSE s.id IS NULL END)
                AND c.id NOT IN :ids
                GROUP BY c.id, cd.id
            """)
    List<Long> findInverseIds(List<CouponType> types,
            List<CouponCriteria> criterias,
            List<String> codes,
            String code,
            Long shopId,
            Long userId,
            Boolean byShop,
            Boolean showExpired,
            List<Long> ids);

    /**
     * Recommends a list of coupons for the provided shop IDs while excluding
     * coupons
     * already used by the specified user (if provided). For anonymous users, pass
     * null
     * for {@code userId} and no exclusion will be applied.
     *
     * @param shopIds the list of shop IDs; may include null to include global
     *                coupons
     * @param userId  the current user ID to exclude already-used coupons; nullable
     * @return a list of recommended coupons (one per shop and one for global if
     *         present)
     */
    @Query("""
                SELECT c AS coupon,
                    s.name AS shopName,
                    i AS image
                FROM Coupon c
                JOIN FETCH c.detail cd
                LEFT JOIN c.shop s
                LEFT JOIN s.image i
                JOIN (
                    SELECT c2.id AS id,
                        c2.shop.id AS shopId,
                        ROW_NUMBER() OVER (
                            PARTITION BY c2.shop.id
                            ORDER BY
                                CASE WHEN cd2.type = com.ring.model.enums.CouponType.PRODUCT THEN 0
                                     WHEN cd2.type = com.ring.model.enums.CouponType.SHIPPING THEN 1
                                     ELSE 2 END ASC,
                                CASE WHEN cd2.criteria = com.ring.model.enums.CouponCriteria.VALUE THEN 0
                                     WHEN cd2.criteria = com.ring.model.enums.CouponCriteria.QUANTITY THEN 1
                                     ELSE 2 END ASC,
                                cd2.attribute ASC,
                                (cd2.discount * cd2.maxDiscount) DESC
                        ) AS rn
                    FROM Coupon c2
                    JOIN c2.detail cd2
                    WHERE (cd2.expDate > CURRENT DATE AND cd2.usage > 0)
                    AND ((c2.shop.id IN :shopIds) OR c2.shop.id IS NULL)
                    AND (COALESCE(:userId) IS NULL OR NOT EXISTS (
                            SELECT 1 FROM OrderReceipt o
                            JOIN o.details od
                            WHERE (o.coupon.id = c2.id OR od.coupon.id = c2.id)
                            AND o.user.id = :userId))
                ) t ON c.id = t.id AND t.rn = 1
            """)
    List<ICoupon> recommendCoupons(List<Long> shopIds, Long userId);

    /**
     * Retrieves a list of coupons, along with associated shop names and shop
     * images,
     * based on the provided codes.
     *
     * @param codes a list of coupon codes to search for
     * @return a list of ICoupon objects containing the coupon, shop name, and shop
     *         image
     */
    @Query("""
                SELECT c AS coupon,
                    s.name AS shopName,
                    i AS image
                FROM Coupon c
                JOIN FETCH c.detail cd
                LEFT JOIN c.shop s
                LEFT JOIN s.image i
                WHERE c.code IN :codes
            """)
    List<ICoupon> findCouponInCodes(List<String> codes);

    /**
     * Recommends a suitable coupon based on the provided parameters such as shop
     * ID, value, and quantity.
     * The method fetches a coupon meeting the specified conditions, including
     * availability, expiration,
     * and attribute constraints, prioritizing discount attributes.
     *
     * @param shopId   the ID of the shop to filter coupons by; if null, fetches
     *                 coupons not tied to a shop
     * @param value    the value threshold to filter coupons by; can be null
     * @param quantity the quantity threshold to filter coupons by; can be null
     * @return an optional containing the recommended coupon if matching criteria
     *         exists; otherwise, an empty optional
     */
    @Query("""
                SELECT c AS coupon,
                    s.name AS shopName,
                    i AS image,
                    FALSE AS isUsed
                FROM Coupon c
                JOIN FETCH c.detail cd
                LEFT JOIN c.shop s
                LEFT JOIN s.image i
                WHERE (cd.expDate > CURRENT DATE AND cd.usage > 0)
                AND (COALESCE(:userId) IS NULL OR NOT EXISTS (
                    SELECT 1 FROM OrderReceipt o
                    JOIN o.details od
                    WHERE (o.coupon.id = c.id OR od.coupon.id = c.id)
                    AND o.user.id = :userId))
                AND (CASE WHEN COALESCE(:shopId) IS NULL THEN s.id IS NULL ELSE s.id = :shopId END)
                AND (COALESCE(:value) IS NULL
                    OR (cd.criteria = com.ring.model.enums.CouponCriteria.VALUE AND cd.attribute < :value)
                    OR (COALESCE(:quantity) IS NULL
                    OR (cd.criteria = com.ring.model.enums.CouponCriteria.QUANTITY AND cd.attribute < :quantity)))
                GROUP BY s.id, c.id, cd.id, cd.attribute, cd.discount, cd.maxDiscount, s.name, i.id
                ORDER BY cd.attribute ASC, cd.discount DESC, cd.maxDiscount DESC
                LIMIT 1
            """)
    Optional<ICoupon> recommendCoupon(Long shopId, Double value, Integer quantity, Long userId);

    /**
     * Finds a coupon by its unique code.
     * This method retrieves the coupon details, the associated shop name,
     * and the shop's linked image (if any).
     *
     * @param code   The unique code of the coupon to retrieve.
     * @param userId The ID of the user to check if the coupon has been used.
     * @return An {@code Optional} containing {@code ICoupon} details including the
     *         coupon,
     *         shop name, and shop image, or an empty {@code Optional} if no coupon
     *         matches the code.
     */
    @Query("""
                SELECT c AS coupon,
                    s.name AS shopName,
                    i AS image,
                    CASE WHEN EXISTS (
                        SELECT 1 FROM OrderReceipt o
                        JOIN o.details od
                        WHERE (o.coupon.id = c.id OR od.coupon.id = c.id)
                        AND o.user.id = :userId
                    ) THEN TRUE ELSE FALSE END AS isUsed
                FROM Coupon c
                JOIN FETCH c.detail cd
                LEFT JOIN c.shop s
                LEFT JOIN s.image i
                WHERE c.code = :code
            """)
    Optional<ICoupon> findCouponByCode(String code, Long userId);

    /**
     * Finds a Coupon by its unique identifier and retrieves associated details,
     * including the shop name and shop image, if available.
     *
     * @param id the unique identifier of the coupon to be retrieved
     * @return an {@link Optional} containing a custom projection {@link ICoupon}
     *         representing the coupon details, shop name, and shop image,
     *         or an empty {@link Optional
     */
    @Query("""
                SELECT c AS coupon,
                    s.name AS shopName,
                    i AS image
                FROM Coupon c
                JOIN FETCH c.detail cd
                LEFT JOIN c.shop s
                LEFT JOIN s.image i
                WHERE c.id = :id
            """)
    Optional<ICoupon> findCouponById(Long id);

    /**
     * Retrieves coupon analytics data for a specific shop or all shops.
     * The analytics includes the total count of coupons, the count of coupons
     * created in the current month,
     * and the count of coupons created in the last month.
     *
     * @param shopId the ID of the shop for which the coupon analytics should be
     *               retrieved. If null, analytics
     *               for all shops will be retrieved.
     * @param userId the identifier of the shop owner which analytics is to be
     *               retrieved;
     *               if null, analytics is calculated for all owners
     *
     * @return an object implementing the {@code IStat} interface containing
     *         analytics data such as total coupons,
     *         coupons created in the current month, and coupons created in the last
     *         month.
     */
    @Query("""
                SELECT COUNT(c.id) AS total,
                    COUNT(CASE WHEN c.createdDate >= DATE_TRUNC('month', CURRENT DATE) THEN 1 END)   currentMonth,
                    COUNT(CASE WHEN c.createdDate >= DATE_TRUNC('month', CURRENT DATE) - 1 MONTH
                        AND c.createdDate < DATE_TRUNC('month', CURRENT DATE) THEN 1 END) AS lastMonth
                FROM Coupon c
                LEFT JOIN c.shop s
                WHERE (COALESCE(:shopId) IS NULL OR s.id = :shopId)
                AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
            """)
    IStat getCouponAnalytics(Long shopId,
            Long userId);

    /**
     * Decreases the usage count of a coupon by 1 based on the coupon's ID.
     *
     * @param id the ID of the coupon for which the usage count needs to be
     *           decreased
     */
    @Modifying
    @Query("""
                UPDATE CouponDetail c
                SET c.usage = c.usage - CAST(1 AS short)
                WHERE c.coupon.id = :id
            """)
    void decreaseUsage(Long id);

    /**
     * Deletes all coupon entities associated with the specified shop ID.
     *
     * @param shopId the ID of the shop whose associated coupons should be deleted
     */
    void deleteAllByShopId(Long shopId);

    /**
     * Deletes all entities associated with the specified shop owner.
     *
     * @param owner the owner of the shop for whom all associated entities will be
     *              deleted
     */
    void deleteAllByShop_Owner(Account owner);

    /**
     * Deletes all entities associated with the given shop ID and its corresponding
     * owner.
     *
     * @param shopId the unique identifier for the shop whose entities are to be
     *               deleted
     * @param owner  the account representing the owner of the shop
     */
    void deleteAllByShopIdAndShop_Owner(Long shopId, Account owner);
}
