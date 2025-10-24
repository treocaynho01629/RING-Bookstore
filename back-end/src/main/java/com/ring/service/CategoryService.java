package com.ring.service;

import com.ring.dto.request.CategoryRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.categories.CategoryDTO;
import com.ring.dto.response.categories.CategoryDetailDTO;
import com.ring.dto.response.categories.PreviewCategoryDTO;
import com.ring.model.entity.Category;

import java.util.List;

/**
 * Service interface for handling category-related operations.
 */
public interface CategoryService {

    /**
     * Retrieves categories with pagination and filtering options.
     *
     * @param pageNo   the page number for pagination
     * @param pageSize the size of each page
     * @param sortBy   the field to sort by
     * @param sortDir  the sorting direction (asc/desc)
     * @param include  the fields to include in the response
     * @param parentId the parent category ID to filter by
     * @return a paginated list of {@link CategoryDTO} objects
     */
    PagingResponse<CategoryDTO> getCategories(Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir,
            String include,
            Integer parentId);

    /**
     * Retrieves relevant categories for a specific shop.
     *
     * @param pageNo   the page number for pagination
     * @param pageSize the size of each page
     * @param shopId   the shop ID to get relevant categories for
     * @return a paginated list of {@link CategoryDTO} objects
     */
    PagingResponse<CategoryDTO> getRelevantCategories(Integer pageNo,
            Integer pageSize,
            Long shopId);

    /**
     * Retrieves preview categories.
     *
     * @return a list of {@link PreviewCategoryDTO} objects
     */
    List<PreviewCategoryDTO> getPreviewCategories();

    /**
     * Retrieves detailed category information.
     *
     * @param id      the category ID
     * @param slug    the category slug
     * @param include the fields to include in the response
     * @return the {@link CategoryDetailDTO} object
     */
    CategoryDetailDTO getCategory(Integer id,
            String slug,
            String include);

    /**
     * Creates a new category.
     *
     * @param request the category creation details
     * @return the created {@link Category} entity
     */
    Category addCategory(CategoryRequest request);

    /**
     * Updates an existing category by its ID.
     *
     * @param id      the ID of the category to update
     * @param request the category update details
     * @return the updated {@link Category} entity
     */
    Category updateCategory(Integer id,
            CategoryRequest request);

    /**
     * Deletes a category by its ID.
     *
     * @param id the ID of the category to delete
     */
    void deleteCategory(Integer id);

    /**
     * Deletes multiple categories by their IDs.
     *
     * @param ids the list of category IDs to delete
     */
    void deleteCategories(List<Integer> ids);

    /**
     * Deletes categories that are not in the provided list of IDs.
     *
     * @param parentId the parent category ID to filter by
     * @param ids      the list of category IDs to exclude from deletion
     */
    void deleteCategoriesInverse(Integer parentId,
            List<Integer> ids);

    /**
     * Deletes all categories.
     */
    void deleteAllCategories();
}
