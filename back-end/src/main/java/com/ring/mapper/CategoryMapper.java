package com.ring.mapper;

import com.cloudinary.Cloudinary;
import com.ring.common.AppConstants;
import com.ring.common.CloudinaryTransformations;
import com.ring.dto.projection.categories.ICategory;
import com.ring.dto.response.categories.CategoryDTO;
import com.ring.dto.response.categories.CategoryDetailDTO;
import com.ring.dto.response.categories.PreviewCategoryDTO;
import com.ring.model.entity.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * A mapper for {@link ICategory}, {@link Category} to {@link CategoryDTO}, {@link CategoryDetailDTO}, {@link PreviewCategoryDTO}.
 */
@RequiredArgsConstructor
@Service
public class CategoryMapper {

    private final Cloudinary cloudinary;

    /**
     * Maps a {@link ICategory} to a {@link CategoryDTO}.
     * 
     * @param category the category to map
     * @return the mapped {@link CategoryDTO}
     */
    public CategoryDTO projectionToDTO(ICategory category) {

        return new CategoryDTO(category.getId(),
                category.getSlug(),
                category.getName(),
                category.getParentId());
    }

    /**
     * Maps a {@link Category} to a {@link CategoryDTO}.
     * 
     * @param category the category to map
     * @return the mapped {@link CategoryDTO}
     */
    public CategoryDTO projectionToDTO(Category category) {

        return new CategoryDTO(category.getId(),
                category.getSlug(),
                category.getName(),
                category.getParent() != null ? category.getParent().getId() : null);
    }

    /**
     * Maps a list of {@link ICategory} to a list of {@link CategoryDTO}.
     * 
     * @param all the list of categories to map
     * @return the mapped list of {@link CategoryDTO}
     */
    public List<CategoryDTO> parentAndChildToCateDTOS(List<ICategory> all) {

        Map<Integer, CategoryDTO> catesMap = new LinkedHashMap<>();
        Collections.reverse(all);

        for (ICategory projection : all) {
            if (projection.getParentId() == null) {

                var newCate = CategoryDTO.builder().id(projection.getId())
                        .name(projection.getName())
                        .slug(projection.getSlug())
                        .parentId(projection.getParentId())
                        .children(new ArrayList<>())
                        .build();

                catesMap.put(newCate.id(), newCate);
            } else {

                var newChild = CategoryDTO.builder().id(projection.getId())
                        .name(projection.getName())
                        .slug(projection.getSlug())
                        .parentId(projection.getParentId())
                        .build();

                catesMap.get(projection.getParentId()).children().add(newChild);
            }

        }

        // Convert & return
        List<CategoryDTO> result = new ArrayList<CategoryDTO>(catesMap.values());
        return result;
    }

    /**
     * Maps a {@link Category} to a {@link CategoryDTO}.
     * 
     * @param category the category to map
     * @param include the include type
     * @return the mapped {@link CategoryDTO}
     */
    public CategoryDTO cateToDTO(Category category, String include) {

        List<CategoryDTO> children = null;
        CategoryDTO parent = null;
        Category parentCate = category.getParent();

        // Include?
        if (include == null) return this.projectionToDTO(category);

        if (include.equalsIgnoreCase(AppConstants.PARENT)) {

            parent = parentCate != null ? this.cateToDTO(parentCate, AppConstants.PARENT) : null;
        } else if (include.equalsIgnoreCase(AppConstants.CHILDREN)) {

            children = category.getSubCates()
                    .stream()
                    .sorted(Comparator.comparingInt(Category::getId))
                    .map(this::projectionToDTO).collect(Collectors.toList());
        }

        return new CategoryDTO(category.getId(),
                category.getSlug(),
                category.getName(),
                parentCate != null ? parentCate.getId() : null,
                parent,
                children);
    }

    /**
     * Maps a {@link Category} to a {@link CategoryDetailDTO}.
     * 
     * @param category the category to map
     * @return the mapped {@link CategoryDetailDTO}
     */
    public CategoryDetailDTO cateToDetailDTO(Category category) {

        return new CategoryDetailDTO(category.getId(),
                category.getSlug(),
                category.getName(),
                category.getDescription(),
                category.getParent() != null ? category.getParent().getId() : null);
    }

    /**
     * Maps a {@link Category} to a {@link CategoryDetailDTO}.
     * 
     * @param category the category to map
     * @param include the include type
     * @return the mapped {@link CategoryDetailDTO}
     */
    public CategoryDetailDTO cateToDetailDTO(Category category, String include) {

        List<CategoryDTO> children = null;
        CategoryDTO parent = null;
        Category parentCate = category.getParent();

        // Include?
        if (include == null) return this.cateToDetailDTO(category);
        if (include.equalsIgnoreCase(AppConstants.PARENT)) {

            parent = parentCate != null ? this.cateToDTO(parentCate, AppConstants.PARENT) : null;
        } else if (include.equalsIgnoreCase(AppConstants.CHILDREN)) {

            children = category.getSubCates()
                    .stream()
                    .sorted(Comparator.comparingInt(Category::getId))
                    .map(this::projectionToDTO).collect(Collectors.toList());
        }

        return new CategoryDetailDTO(category.getId(),
                category.getSlug(),
                category.getName(),
                category.getDescription(),
                parentCate != null ? parentCate.getId() : null,
                parent,
                children);
    }

    /**
     * Maps a {@link ICategory} to a {@link PreviewCategoryDTO}.
     * 
     * @param projection the projection to map
     * @return the mapped {@link PreviewCategoryDTO}
     */
    public PreviewCategoryDTO projectionToPreviewDTO(ICategory projection) {

        String imageUrl = cloudinary.url()
                    .transformation(CloudinaryTransformations.PREVIEW_CATEGORY_TRANSFORMATION)
                    .secure(true)
                    .generate(projection.getPublicId());

        return new PreviewCategoryDTO(projection.getId(),
                projection.getSlug(),
                projection.getParentId(),
                projection.getName(),
                imageUrl);
    }
}
