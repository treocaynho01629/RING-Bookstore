package com.ring.controller;

import com.ring.dto.request.CategoryRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.categories.CategoryDTO;
import com.ring.dto.response.categories.CategoryDetailDTO;
import com.ring.dto.response.categories.PreviewCategoryDTO;
import com.ring.model.entity.Category;
import com.ring.service.CategoryService;
import com.ring.service.impl.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller named {@link CategoryController} for handling category-related operations.
 * Exposes endpoints under "/api/categories".
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService cateService;
    private final MessageService messageService;

    /**
     * Retrieves preview categories for quick selection.
     *
     * @return a {@link ResponseEntity} containing a list of preview categories.
     */
    @GetMapping("/preview")
    public ResponseEntity<List<PreviewCategoryDTO>> getPreviewCategories() {
        List<PreviewCategoryDTO> categories = cateService.getPreviewCategories();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    /**
     * Retrieves categories relevant to a specific shop.
     *
     * @param pageSize  size of each page.
     * @param pageNo    page number.
     * @param shopId    ID of the shop.
     * @return a {@link ResponseEntity} containing relevant categories.
     */
    @GetMapping("/relevant/{id}")
    public ResponseEntity<PagingResponse<CategoryDTO>> getRelevantCategories(
            @RequestParam(value = "pSize", defaultValue = "20") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @PathVariable("id") Long shopId) {

        PagingResponse<CategoryDTO> categories = cateService.getRelevantCategories(pageNo, pageSize, shopId);
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    /**
     * Retrieves all categories with pagination, sorting, and optional filters.
     *
     * @param pageSize  size of each page.
     * @param pageNo    page number.
     * @param sortBy    sorting field.
     * @param sortDir   sorting direction.
     * @param include   optional field to include "parent" or "children".
     * @param parentId  optional parent category ID to filter by.
     * @return a {@link ResponseEntity} containing paginated categories.
     */
    @GetMapping
    public ResponseEntity<PagingResponse<CategoryDTO>> getCategories(
            @RequestParam(value = "pSize", defaultValue = "20") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @RequestParam(value = "include", required = false) String include,
            @RequestParam(value = "parentId", required = false) Integer parentId) {

        PagingResponse<CategoryDTO> categories = cateService.getCategories(pageNo, pageSize, sortBy, sortDir, include, parentId);
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    /**
     * Retrieves a category by its ID.
     *
     * @param id the category ID.
     * @param include optional field to include "parent" or "children".
     * @return a {@link ResponseEntity} containing the category.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDetailDTO> getCategoryById(
            @PathVariable("id") Integer id,
            @RequestParam(value = "include", required = false) String include) {

        CategoryDetailDTO category = cateService.getCategory(id, null, include);
        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    /**
     * Retrieves a category by its slug.
     *
     * @param slug the slug of the category.
     * @param include optional field to include "parent" or "children".
     * @return a {@link ResponseEntity} containing the category.
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<CategoryDetailDTO> getCategoryBySlug(
            @PathVariable("slug") String slug,
            @RequestParam(value = "include", required = false) String include) {

        CategoryDetailDTO category = cateService.getCategory(null, slug, include);
        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    /**
     * Creates a new category.
     *
     * @param request the {@link CategoryRequest} containing category data.
     * @return a {@link ResponseEntity} containing the created category.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('create:category')")
    public ResponseEntity<Category> createCategory(@Valid @RequestPart("request") CategoryRequest request) {

        Category category = cateService.addCategory(request);
        return new ResponseEntity<>(category, HttpStatus.CREATED);
    }

    /**
     * Updates a category by its ID.
     *
     * @param id the ID of the category to update.
     * @param request the updated category data.
     * @return a {@link ResponseEntity} containing the updated category.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('update:category')")
    public ResponseEntity<Category> updateCategory(
            @PathVariable("id") Integer id,
            @Valid @RequestPart("request") CategoryRequest request) {

        Category category = cateService.updateCategory(id, request);
        return new ResponseEntity<>(category, HttpStatus.CREATED);
    }

    /**
     * Deletes a category by its ID.
     *
     * @param id the ID of the category to delete.
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('delete:category')")
    public ResponseEntity<String> deleteCategory(@PathVariable("id") Integer id) {

        cateService.deleteCategory(id);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes multiple categories by a list of IDs.
     *
     * @param ids list of category IDs to delete.
     * @return a {@link ResponseEntity} containing a success message.
     */
    @DeleteMapping("/delete-multiple")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('delete:category')")
    public ResponseEntity<String> deleteCategories(
        @RequestParam(value = "parentId", required = false) Integer parentId,
        @RequestParam("ids") List<Integer> ids) { 

        // TODO: Fix the method
        cateService.deleteCategories(ids);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes categories that are NOT in the given list of IDs.
     *
     * @param ids list of IDs to exclude from deletion.
     * @param parentId optional parent category ID to filter by.
     * @return a {@link ResponseEntity} containing a success message.
     */
    @DeleteMapping("/delete-inverse")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('delete:book')")
    public ResponseEntity<String> deleteCategoriesInverse(
            @RequestParam(value = "parentId", required = false) Integer parentId,
            @RequestParam("ids") List<Integer> ids) {

        cateService.deleteCategoriesInverse(parentId, ids);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes all categories in the system.
     *
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/delete-all")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('delete:category')")
    public ResponseEntity<String> deleteAllCategories() {

        cateService.deleteAllCategories();
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
