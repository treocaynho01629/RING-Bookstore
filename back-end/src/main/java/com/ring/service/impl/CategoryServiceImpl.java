package com.ring.service.impl;

import com.github.slugify.Slugify;
import com.ring.common.AppConstants;
import com.ring.dto.projection.categories.ICategory;
import com.ring.dto.request.CategoryRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.categories.CategoryDTO;
import com.ring.dto.response.categories.CategoryDetailDTO;
import com.ring.dto.response.categories.PreviewCategoryDTO;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.CategoryMapper;
import com.ring.model.entity.Category;
import com.ring.repository.CategoryRepository;
import com.ring.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service class for managing categories.
 */
@RequiredArgsConstructor
@Service
public class CategoryServiceImpl implements CategoryService {

        private final MessageService messageService;

        private final CategoryRepository cateRepo;
        private final CategoryMapper cateMapper;
        private final Slugify slg = Slugify.builder().lowerCase(false).build();

        @Cacheable(cacheNames = AppConstants.CATEGORIES)
        public PagingResponse<CategoryDTO> getCategories(Integer pageNo,
                        Integer pageSize,
                        String sortBy,
                        String sortDir,
                        String include,
                        Integer parentId) {

                Pageable pageable = PageRequest.of(pageNo, pageSize,
                                sortDir.equals(AppConstants.ASCENDING)
                                                ? Sort.by(sortBy).ascending()
                                                : Sort.by(sortBy).descending());

                // Include child categories
                if (AppConstants.CHILDREN.equalsIgnoreCase(include)) {

                        Page<Integer> pagedIds = cateRepo.findCateIdsByParent(parentId, pageable);

                        List<Integer> cateIds = pagedIds.getContent();
                        List<ICategory> fullList = cateRepo.findParentAndSubCatesWithParentIds(cateIds);

                        // Map
                        List<CategoryDTO> catesList = cateMapper.parentAndChildToCateDTOS(fullList);

                        // Sort by parent ids
                        Map<Integer, Integer> idOrder = new HashMap<>();
                        for (int i = 0; i < cateIds.size(); i++) {
                                idOrder.put(cateIds.get(i), i);
                        }
                        catesList.sort(Comparator.comparingInt(c -> idOrder.get(c.id())));

                        return new PagingResponse<>(
                                        catesList,
                                        pagedIds.getTotalPages(),
                                        pagedIds.getTotalElements(),
                                        pagedIds.getSize(),
                                        pagedIds.getNumber(),
                                        pagedIds.isEmpty());
                        // Only categories without child
                } else {

                        Page<ICategory> catesList = cateRepo.findCates(parentId, pageable);
                        List<CategoryDTO> cateDTOS = catesList.map(cateMapper::projectionToDTO).toList();
                        return new PagingResponse<>(
                                        cateDTOS,
                                        catesList.getTotalPages(),
                                        catesList.getTotalElements(),
                                        catesList.getSize(),
                                        catesList.getNumber(),
                                        catesList.isEmpty());
                }
        }

        @Cacheable(cacheNames = AppConstants.CATEGORIES)
        public PagingResponse<CategoryDTO> getRelevantCategories(Integer pageNo,
                        Integer pageSize,
                        Long shopId) {
                Pageable pageable = PageRequest.of(pageNo,
                                pageSize,
                                Sort.by(AppConstants.ID).descending());

                Page<Integer> pagedIds = cateRepo.findRelevantCategoryIds(shopId, pageable);
                List<Integer> cateIds = pagedIds.getContent();
                List<ICategory> fullList = cateRepo.findParentAndSubCatesWithParentIds(cateIds);

                // Map
                List<CategoryDTO> catesList = cateMapper.parentAndChildToCateDTOS(fullList);

                // Sort by parent ids
                Map<Integer, Integer> idOrder = new HashMap<>();
                for (int i = 0; i < cateIds.size(); i++) {
                        idOrder.put(cateIds.get(i), i);
                }
                catesList.sort(Comparator.comparingInt(c -> idOrder.get(c.id())));

                return new PagingResponse<>(
                                catesList,
                                pagedIds.getTotalPages(),
                                pagedIds.getTotalElements(),
                                pagedIds.getSize(),
                                pagedIds.getNumber(),
                                pagedIds.isEmpty());
        }

        @Cacheable(cacheNames = AppConstants.CATEGORY_PREVIEWS)
        public List<PreviewCategoryDTO> getPreviewCategories() {

                List<ICategory> previews = cateRepo.findPreviewCategories();
                return previews.stream().map(cateMapper::projectionToPreviewDTO).collect(Collectors.toList());
        }

        @Cacheable(cacheNames = AppConstants.CATEGORY_DETAIL)
        public CategoryDetailDTO getCategory(Integer id, String slug, String include) {

                CategoryDetailDTO result;

                if (AppConstants.CHILDREN.equalsIgnoreCase(include)) {
                        Category cate = cateRepo.findCateWithChildren(id, slug)
                                        .orElseThrow(() -> {
                                                var errorMsg = messageService.getMessage("exception.not.found",
                                                                new Object[] { new DefaultMessageSourceResolvable(
                                                                                "label.cate.children") });
                                                return new ResourceNotFoundException(errorMsg);
                                        });
                        result = cateMapper.cateToDetailDTO(cate, AppConstants.CHILDREN);
                } else if (AppConstants.PARENT.equalsIgnoreCase(include)) {
                        Category cate = cateRepo.findCateWithParent(id, slug)
                                        .orElseThrow(() -> {
                                                var errorMsg = messageService.getMessage("exception.not.found",
                                                                new Object[] { new DefaultMessageSourceResolvable(
                                                                                "label.cate.parent") });
                                                return new ResourceNotFoundException(errorMsg);
                                        });
                        result = cateMapper.cateToDetailDTO(cate, AppConstants.PARENT);
                } else {
                        Category cate = cateRepo.findCate(id, slug)
                                        .orElseThrow(() -> {
                                                var errorMsg = messageService.getMessage("exception.not.found",
                                                                new Object[] { new DefaultMessageSourceResolvable(
                                                                                "label.cate") });
                                                return new ResourceNotFoundException(errorMsg);
                                        });
                        result = cateMapper.cateToDetailDTO(cate);
                }

                return result;
        }

        @CacheEvict(cacheNames = { AppConstants.CATEGORIES, AppConstants.CATEGORY_PREVIEWS }, allEntries = true)
        @Transactional
        public Category addCategory(CategoryRequest request) {

                // Slugify
                String slug = slg.slugify(request.getName());

                // New cate
                var category = Category.builder()
                                .slug(slug)
                                .name(request.getName())
                                .description(request.getDescription())
                                .build();

                // Set parent
                if (request.getParentId() != null) {

                        Category parent = cateRepo.findById(request.getParentId())
                                        .orElseThrow(() -> {
                                                var errorMsg = messageService.getMessage("exception.not.found",
                                                                new Object[] { new DefaultMessageSourceResolvable(
                                                                                "label.cate") });
                                                return new ResourceNotFoundException(errorMsg);
                                        });

                        if (parent.getParent() != null) {

                                var errorMsg = messageService.getMessage("exception.invalid",
                                                new Object[] { new DefaultMessageSourceResolvable(
                                                                "label.cate.parent") });
                                throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                                                AppConstants.INVALID_ARGUMENT,
                                                errorMsg);
                        }

                        category.setParent(parent);
                }

                return cateRepo.save(category); // Save to the database
        }

        @Caching(evict = {
                        @CacheEvict(cacheNames = { AppConstants.CATEGORIES,
                                        AppConstants.CATEGORY_PREVIEWS }, allEntries = true),
                        @CacheEvict(cacheNames = AppConstants.CATEGORY_DETAIL, key = "#id") })
        @Transactional
        public Category updateCategory(Integer id, CategoryRequest request) {

                // Get the original category
                Category category = cateRepo.findById(id)
                                .orElseThrow(() -> {
                                        var errorMsg = messageService.getMessage("exception.not.found",
                                                        new Object[] { new DefaultMessageSourceResolvable(
                                                                        "label.cate") });
                                        return new ResourceNotFoundException(errorMsg);
                                });

                // Set new info
                String slug = slg.slugify(request.getName());

                // Update
                category.setSlug(slug);
                category.setName(request.getName());
                category.setDescription(request.getDescription());

                // Parent
                if (request.getParentId() != null
                                && (category.getParent() == null
                                                || !request.getParentId().equals(category.getParent().getId()))) {

                        // Check child categories
                        if (!category.getSubCates().isEmpty()) {

                                var errorMsg = messageService.getMessage("exception.invalid",
                                                new Object[] { new DefaultMessageSourceResolvable(
                                                                "label.cate.child") });
                                throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                                                AppConstants.INVALID_ARGUMENT,
                                                errorMsg);
                        }

                        Category parent = cateRepo.findById(request.getParentId())
                                        .orElseThrow(() -> {
                                                var errorMsg = messageService.getMessage("exception.not.found",
                                                                new Object[] { new DefaultMessageSourceResolvable(
                                                                                "label.cate.parent") });
                                                return new ResourceNotFoundException(errorMsg);
                                        });

                        // Check parent category
                        if (parent.getParent() != null) {

                                var errorMsg = messageService.getMessage("exception.invalid",
                                                new Object[] { new DefaultMessageSourceResolvable(
                                                                "label.cate.parent") });
                                throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                                                AppConstants.INVALID_ARGUMENT,
                                                errorMsg);
                        }

                        category.setParent(parent);
                }

                // Update
                return cateRepo.save(category);
        }

        @Caching(evict = {
                        @CacheEvict(cacheNames = { AppConstants.CATEGORIES,
                                        AppConstants.CATEGORY_PREVIEWS }, allEntries = true),
                        @CacheEvict(cacheNames = AppConstants.CATEGORY_DETAIL, key = "#id") })
        @Transactional
        public void deleteCategory(Integer id) {
                cateRepo.deleteById(id);
        }

        @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.CATEGORIES,
                        AppConstants.CATEGORY_PREVIEWS }, allEntries = true) })
        @Transactional
        public void deleteCategories(List<Integer> ids) {
                cateRepo.deleteAllByIdInBatch(ids);
        }

        @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.CATEGORIES,
                        AppConstants.CATEGORY_PREVIEWS }, allEntries = true) })
        @Transactional
        public void deleteCategoriesInverse(Integer parentId, List<Integer> ids) {
                List<Integer> listDelete = cateRepo.findInverseIds(parentId, ids);
                cateRepo.deleteAllByIdInBatch(listDelete);
        }

        @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.CATEGORIES,
                        AppConstants.CATEGORY_PREVIEWS }, allEntries = true) })
        @Transactional
        public void deleteAllCategories() {
                cateRepo.deleteAll();
        }
}
