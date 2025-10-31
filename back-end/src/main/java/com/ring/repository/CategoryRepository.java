package com.ring.repository;

import com.ring.dto.projection.categories.ICategory;
import com.ring.model.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface named {@link CategoryRepository} for managing {@link Category} entities.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    /**
    * Retrieves a paginated list of categories based on the provided parent category ID.
    * If the parentId is null, it fetches top-level categories (categories without a parent).
    *
    * @param parentId the ID of the parent category to filter by. If null, fetches top-level categories.
    * @param pageable the pagination and sorting information.
    * @return a page of categories matching the criteria, represented as ICategory projections.
    */
    @Query("""
      SELECT c.id AS id, 
            c.name AS name, 
            c.slug AS slug, 
            c.parent.id AS parentId
      FROM Category c
      WHERE CASE WHEN COALESCE(:parentId) IS NULL THEN (c.parent.id IS NULL) ELSE (c.parent.id = :parentId) END
    """)
    Page<ICategory> findCates(Integer parentId, Pageable pageable);

    /**
    * Retrieves a list of categories based on the specified IDs, ordered by parent category ID in descending order.
    *
    * @param ids A list of category IDs to filter and retrieve the categories.
    * @return A list of categories matching the specified IDs, represented as projections of {@link ICategory}.
    */
    @Query(value = """
      SELECT c.id AS id, 
            c.name AS name, 
            c.slug AS slug, 
            c.parent.id AS parentId
      FROM Category c
      WHERE c.id IN :ids
      ORDER BY c.parent.id DESC
    """)
    List<ICategory> findCatesWithIds(List<Integer> ids);

    /**
    * Finds categories that are either parents or subcategories of the provided parent IDs or categories whose IDs match
    * the provided parent IDs. The results are sorted by parent ID in descending order.
    *
    * @param ids a list of parent IDs or category IDs to filter the categories
    * @return a list of categories that match the provided IDs or are subcategories of the specified parent IDs
    */
    @Query(value = """
      SELECT c.id AS id, 
            c.name AS name, 
            c.slug AS slug, 
            c.parent.id AS parentId
      FROM Category c
      WHERE c.parent.id IN :ids
      OR c.id IN :ids
      ORDER BY c.parent.id DESC
    """)
    List<ICategory> findParentAndSubCatesWithParentIds(List<Integer> ids);

    /**
    * Fetches a distinct page of category IDs that have the specified parent ID.
    * If the parent ID is null, it fetches categories with no parent.
    *
    * @param parentId the ID of the parent category. If null, fetches top-level categories.
    * @param pageable the pagination information.
    * @return a page of distinct category IDs.
    */
    @Query(value = """
      SELECT DISTINCT c.id 
      FROM Category c
      WHERE CASE WHEN COALESCE(:parentId) IS NULL THEN (c.parent.id IS NULL) ELSE (c.parent.id = :parentId) END
    """)
    Page<Integer> findCateIdsByParent(Integer parentId, Pageable pageable);

    /**
    * Retrieves a paged list of distinct category IDs and their parent category IDs
    * that are linked to books in a specific shop.
    *
    * @param shopId The ID of the shop for which relevant categories are to be fetched.
    * @param pageable An instance of {@link Pageable} specifying pagination information.
    * @return A paged list of arrays where each array contains two elements:
    *    the category ID and its parent category ID.
    */
    @Query(value = """
      SELECT DISTINCT array(c.id, c.parent.id) AS id 
      FROM Category c
      JOIN c.cateBooks b
      WHERE b.shop.id = :shopId
    """)
    Page<Integer[]> findRelevantCategories(Long shopId, Pageable pageable);

    /**
    * Retrieves a list of preview categories, each including its id, slug, parent id, name,
    * and the public id of the first associated image if available.
    * This method limits the results to a maximum of 12 categories and orders them
    * by parent id in descending order with nulls first.
    *
    * @return a list of {@code ICategory} projections containing the category details along
    *    with an associated image's public id when available. The list is limited to 12 entries.
    */
    @Query("""
        select c.id as id, 
            c.slug AS slug, 
            c.parent.id AS parentId,
            c.name AS name, 
            t.image.publicId as publicId
        FROM Category c
        LEFT JOIN (
          SELECT b.cate.id AS cateId, 
            i AS image, ROW_NUMBER() OVER (PARTITION BY b.cate.id ORDER BY b.cate.id) AS rn
            FROM Book b JOIN b.image i
        ) t ON c.id = t.cateId AND t.rn = 1
        WHERE t.image IS NOT NULL
        ORDER BY c.parent.id DESC NULLS FIRST
        LIMIT 12
    """)
    List<ICategory> findPreviewCategories();

    /**
    * Retrieves a Category based on its ID or slug. If the given ID is not null, the method searches by ID.
    * Otherwise, it searches by the slug.
    *
    * @param id   the ID of the category to search for; can be null.
    * @param slug the slug of the category to search for; used if ID is null.
    * @return an {@link Optional} containing the found {@link Category} or empty if no category is found.
    */
    @Query("""
      SELECT c FROM Category c
      WHERE CASE WHEN COALESCE(:id) IS NOT NULL THEN (c.id = :id) ELSE (c.slug = :slug) END
    """)
    Optional<Category> findCate(Integer id, String slug);

    /**
    * Fetches a {@link Category} entity along with its child categories based on the provided ID or slug.
    * If an ID is provided, the query will match the category by ID; otherwise, it will match by slug.
    *
    * @param id the ID of the category to be fetched; can be null if fetching by slug.
    * @param slug the slug of the category to be fetched; can be null if fetching by ID.
    * @return an {@link Optional} containing the matched {@link Category} with its children if found,
    *    or an empty {@link Optional} if no category matches the given criteria.
    */
    @Query("""
        SELECT c FROM Category c 
        LEFT JOIN FETCH c.subCates
        WHERE CASE WHEN COALESCE(:id) IS NOT NULL THEN (c.id = :id) ELSE (c.slug = :slug) END
    """)
    Optional<Category> findCateWithChildren(Integer id, String slug);

    /**
    * Retrieves a category entity along with its parent category based on the provided identifier or slug.
    *
    * @param id the unique identifier of the category. If provided, this parameter will be used to find the category.
    *    Pass null if the lookup should be based on the slug instead.
    * @param slug the unique slug of the category. If provided, this parameter will be used to find the category.
    *    This will only be considered if the id parameter is null.
    * @return an {@link Optional} containing the category with its parent category, or an empty {@link Optional}
    *    if no matching category is found.
    */
    @Query("""
        SELECT c FROM Category c 
        LEFT JOIN FETCH c.parent
        WHERE CASE WHEN COALESCE(:id) IS NOT NULL THEN (c.id = :id) ELSE (c.slug = :slug) END
    """)
    Optional<Category> findCateWithParent(Integer id, String slug);

    /**
    * Retrieves a list of category IDs that match the given parent ID condition
    * and excludes the IDs provided in the input list.
    *
    * @param parentId the ID of the parent category to filter by, or null to include only root categories
    * @param ids a list of category IDs to exclude from the results
    * @return a list of category IDs that satisfy the given conditions
    */
    @Query("""
      SELECT c.id FROM Category c
      WHERE CASE WHEN COALESCE(:parentId) IS NULL THEN (c.parent.id IS NULL) ELSE (c.parent.id = :parentId) END
      AND c.id NOT IN :ids
    """)
    List<Integer> findInverseIds(Integer parentId, List<Integer> ids);
}
