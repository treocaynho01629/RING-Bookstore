package com.ring.repository;

import com.ring.dto.projection.banners.IBanner;
import com.ring.model.entity.Account;
import com.ring.model.entity.Banner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface named {@link BannerRepository} for managing
 * {@link Banner} entities.
 */
@Repository
public interface BannerRepository extends JpaRepository<Banner, Integer> {

	/**
	 * Retrieves a paginated list of banners based on the provided search criteria.
	 *
	 * @param keyword  a string used to search banners by their name or description
	 *                 using a case-insensitive match.
	 * @param shopId   an optional shop ID to filter banners belonging to a specific
	 *                 shop. If null, this filter is ignored.
	 * @param byShop   a boolean value specifying whether to include banners that
	 *                 are associated with a shop (true)
	 *                 or banners not associated with any shop (false). If null,
	 *                 this condition is ignored.
	 * @param pageable a {@link Pageable} object to define pagination and sorting
	 *                 options.
	 * @return a {@link Page} containing a list of banners as {@link IBanner}
	 *         projections matching the criteria.
	 */
	@Query("""
		SELECT b.id AS id, 
			b.shop.id AS shopId, 
			b.name AS name,
			b.description AS description, 
			b.url AS url, 
			i AS image
		FROM Banner b 
		LEFT JOIN b.image i
		WHERE CONCAT(b.name, b.description) ILIKE %:keyword%
		AND (COALESCE(:shopId) IS NULL OR b.shop.id = :shopId)
		AND (COALESCE(:byShop) IS NULL OR CASE WHEN :byShop = TRUE THEN b.shop.id IS NOT NULL ELSE b.shop.id IS NULL END)
	""")
	Page<IBanner> findBanners(String keyword,
			Long shopId,
			Boolean byShop,
			Pageable pageable);

	/**
	 * Retrieves a list of banner IDs that match the given list of IDs and belong to
	 * the specified owner.
	 *
	 * @param ids     the list of banner IDs to be checked.
	 * @param ownerId the ID of the owner for whom the banners should belong.
	 * @return a list of banner IDs that satisfy the criteria, or an empty list if
	 *         no match is found.
	 */
	@Query("""
		SELECT b.id FROM Banner b
		WHERE b.id IN :ids
		AND b.shop.owner.id = :ownerId
	""")
	List<Integer> findBannerIdsByInIdsAndOwner(List<Integer> ids,
			Long ownerId);

	/**
	 * Finds a list of banner IDs that match the specified search criteria and are
	 * not included in the provided list of IDs.
	 * The method uses query parameters to filter banners based on their name,
	 * description, associated shop, ownership,
	 * and whether they are linked to any shop.
	 *
	 * @param keyword the keyword to search for in the name and description of
	 *                banners
	 * @param shopId  the ID of the shop to which the banners should belong; can be
	 *                null for no shop-specific filtering
	 * @param byShop  a flag indicating whether to filter based on banners being
	 *                associated with a shop (true) or not (false)
	 * @param userId  the ID of the user who owns the shop associated with the
	 *                banners; can be null for no owner-specific filtering
	 * @param ids     a list of IDs to exclude from the search results
	 * @return a list of banner IDs that meet the filtering criteria
	 */
	@Query("""
		SELECT b.id 
		from Banner b 
		LEFT JOIN b.shop s
		WHERE CONCAT(b.name, b.description) ILIKE %:keyword%
		AND (COALESCE(:shopId) IS NULL OR s.id = :shopId)
		AND (COALESCE(:byShop) IS NULL OR CASE WHEN :byShop = TRUE THEN s.id IS NOT NULL ELSE s.id IS NULL END)
		AND (COALESCE(:userId) IS NULL OR s.owner.id = :userId)
		AND b.id NOT IN :ids
		GROUP BY b.id
	""")
	List<Integer> findInverseIds(String keyword,
			Long shopId,
			Boolean byShop,
			Long userId,
			List<Integer> ids);

	/**
	 * Deletes all {@link Banner} entities associated with the specified shop ID.
	 *
	 * @param shopId the ID of the shop whose banners are to be deleted
	 */
	void deleteAllByShopId(Long shopId);

	/**
	 * Deletes all {@link Banner} entities associated with the shop owned by the
	 * specified shop owner.
	 *
	 * @param owner the {@link Account} representing the owner of the shops whose
	 *              banners should be deleted
	 */
	void deleteAllByShop_Owner(Account owner);

	/**
	 * Deletes all {@link Banner} entities that belong to a specific shop and are
	 * associated with a specific shop owner.
	 *
	 * @param shopId the ID of the shop whose banners are to be deleted
	 * @param owner  the account of the shop owner associated with the shop
	 */
	void deleteAllByShopIdAndShop_Owner(Long shopId, Account owner);
}
