package com.ring.service;

import com.ring.base.AbstractServiceTest;
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
import com.ring.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class CategoryServiceTest extends AbstractServiceTest {

    @Mock
    private CategoryRepository cateRepo;

    @Mock
    private CategoryMapper cateMapper;

    @InjectMocks
    private CategoryServiceImpl cateService;

    private final Category category = Category.builder().id(1).subCates(new ArrayList<>()).name("Fiction").build();
    private final CategoryRequest request = CategoryRequest.builder().name("Fiction").build();

    @Test
    public void whenGetCategories_ThenReturnsPage() {

        // Given
        Pageable pageable = PageRequest.of(0, 10, Sort.by("id").descending());
        Page<ICategory> page = new PageImpl<>(List.of(mock(ICategory.class)), pageable, 2);
        CategoryDTO mapped = CategoryDTO.builder().id(1).name("fiction").build();
        PagingResponse<CategoryDTO> expectedDTOS = new PagingResponse<>(
                List.of(mapped),
                1,
                1L,
                10,
                0,
                false);

        // When
        when(cateRepo.findCates(isNull(), any(Pageable.class))).thenReturn(page);
        when(cateMapper.projectionToDTO(any(ICategory.class))).thenReturn(mapped);

        // Then
        PagingResponse<CategoryDTO> result = cateService.getCategories(pageable.getPageNumber(),
                pageable.getPageSize(),
                "id",
                "desc",
                null,
                null);

        assertNotNull(result);
        assertFalse(result.getContent().isEmpty());
        assertEquals(expectedDTOS.getPage(), result.getPage());
        assertEquals(expectedDTOS.getSize(), result.getSize());
        assertEquals(expectedDTOS.getTotalElements(), result.getTotalElements());
        assertEquals(expectedDTOS.getContent().stream().findFirst().get().id(),
                result.getContent().stream().findFirst().get().id());

        // Verify
        verify(cateRepo, times(1)).findCates(isNull(), any(Pageable.class));
        verify(cateMapper, times(1)).projectionToDTO(any(ICategory.class));
    }

    @Test
    public void whenGetPreviewCategories_ThenReturnsList() {

        // Given
        PreviewCategoryDTO mapped = PreviewCategoryDTO.builder().id(1).name("fiction").build();
        List<PreviewCategoryDTO> expected = List.of(mapped);

        // When
        when(cateRepo.findPreviewCategories()).thenReturn(List.of(mock(ICategory.class)));
        when(cateMapper.projectionToPreviewDTO(any(ICategory.class))).thenReturn(mapped);

        // Then
        List<PreviewCategoryDTO> result = cateService.getPreviewCategories();

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(cateRepo, times(1)).findPreviewCategories();
        verify(cateMapper, times(1)).projectionToPreviewDTO(any(ICategory.class));
    }

    @Test
    public void whenGetRelevantCategories_ThenReturnsPage() {

        // // Given
        // Long id = 1L;
        // Integer[] ids = { 1, 2 };
        // List<Integer[]> list = new ArrayList<>();
        // list.add(ids);
        // List<Integer> idsList = List.of(1, 2);
        // Pageable pageable = PageRequest.of(0, 10);
        // Page<Integer[]> page = new PageImpl<>(list, pageable, 2);
        // List<ICategory> categories = List.of(mock(ICategory.class));
        // List<CategoryDTO> expected = new
        // ArrayList<>(List.of(CategoryDTO.builder().id(1).build()));
        // PagingResponse<CategoryDTO> expectedDTOS = new PagingResponse<>(
        // expected,
        // 1,
        // 1L,
        // 10,
        // 0,
        // false);

        // // When
        // when(cateRepo.findRelevantCategories(eq(id),
        // any(Pageable.class))).thenReturn(page);
        // when(cateRepo.findCatesWithIds(idsList)).thenReturn(categories);
        // when(cateMapper.parentAndChildToCateDTOS(categories)).thenReturn(expected);

        // // Then
        // PagingResponse<CategoryDTO> result =
        // cateService.getRelevantCategories(pageable.getPageNumber(),
        // pageable.getPageSize(),
        // id);

        // assertNotNull(result);
        // assertEquals(expectedDTOS.getPage(), result.getPage());
        // assertEquals(expectedDTOS.getSize(), result.getSize());
        // assertEquals(expectedDTOS.getTotalElements(), result.getTotalElements());
        // assertEquals(expectedDTOS.getContent().stream().findFirst().get().id(),
        // result.getContent().stream().findFirst().get().id());

        // // Verify
        // verify(cateRepo, times(1)).findRelevantCategories(eq(id),
        // any(Pageable.class));
        // verify(cateRepo, times(1)).findCatesWithIds(idsList);
        // verify(cateMapper, times(1)).parentAndChildToCateDTOS(categories);
    }

    @Test
    public void whenGetCategory_ThenReturnDetailDTO() {

        // Given
        Integer id = 1;
        CategoryDetailDTO expected = new CategoryDetailDTO(1, "fiction", "Fiction", "Description", null);

        // When
        when(cateRepo.findCateWithChildren(id, null)).thenReturn(Optional.of(category));
        when(cateRepo.findCateWithParent(id, null)).thenReturn(Optional.of(category));
        when(cateRepo.findCate(id, null)).thenReturn(Optional.of(category));
        when(cateMapper.cateToDetailDTO(eq(category), eq("children"))).thenReturn(expected);
        when(cateMapper.cateToDetailDTO(eq(category), eq("parent"))).thenReturn(expected);
        when(cateMapper.cateToDetailDTO(eq(category))).thenReturn(expected);

        // When
        CategoryDetailDTO result = cateService.getCategory(id, null, "children");
        CategoryDetailDTO result2 = cateService.getCategory(id, null, "parent");
        CategoryDetailDTO result3 = cateService.getCategory(id, null, null);

        // Then
        assertNotNull(result);
        assertNotNull(result2);
        assertNotNull(result3);
        assertEquals(expected, result);
        assertEquals(expected, result2);
        assertEquals(expected, result3);

        // Verify
        verify(cateRepo, times(1)).findCateWithChildren(id, null);
        verify(cateRepo, times(1)).findCateWithParent(id, null);
        verify(cateRepo, times(1)).findCate(id, null);
        verify(cateMapper, times(1)).cateToDetailDTO(eq(category), eq("children"));
        verify(cateMapper, times(1)).cateToDetailDTO(eq(category), eq("parent"));
        verify(cateMapper, times(1)).cateToDetailDTO(eq(category));
    }

    @Test
    public void whenGetNoneExistingCategory_ThenThrowsException() {

        // Given
        Integer id = 1;

        // When
        when(cateRepo.findCate(id, null)).thenReturn(Optional.empty());

        // When
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> cateService.getCategory(id, null, null));
        assertEquals("Category not found!", exception.getError());

        // Verify
        verify(cateRepo, times(1)).findCate(id, null);
        verify(cateMapper, never()).cateToDetailDTO(category);
    }

    @Test
    public void whenAddCategory_ThenReturnsNewCategory() {

        // When
        when(cateRepo.save(any(Category.class))).thenReturn(category);

        // Then
        Category result = cateService.addCategory(request);

        assertNotNull(result);
        assertEquals(category, result);

        // Verify
        verify(cateRepo, times(1)).save(any(Category.class));
    }

    @Test
    public void whenAddCategoryWithParent_ThenReturnsNewCategory() {

        // Given
        CategoryRequest req = CategoryRequest.builder().name("Child").parentId(2).build();
        Category parent = Category.builder().id(2).build();

        // When
        when(cateRepo.findById(2)).thenReturn(Optional.of(parent));
        when(cateRepo.save(any(Category.class))).thenReturn(category);

        // Then
        Category result = cateService.addCategory(req);

        assertNotNull(result);
        assertEquals(category, result);

        // Verify
        verify(cateRepo, times(1)).findById(2);
        verify(cateRepo, times(1)).save(any(Category.class));
    }

    @Test
    public void whenAddCategoryWithNonExistingParent_ThenThrowsException() {

        // Given
        CategoryRequest req = CategoryRequest.builder().name("Child").parentId(2).build();

        // When
        when(cateRepo.findById(2)).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> cateService.addCategory(req));
        assertEquals("Parent category not found!", exception.getError());

        // Verify
        verify(cateRepo, times(1)).findById(2);
        verify(cateRepo, never()).save(any(Category.class));
    }

    @Test
    public void whenAddCategoryWithInvalidParent_ThenThrowsException() {

        // Given
        CategoryRequest req = CategoryRequest.builder().name("Child").parentId(2).build();
        Category parent = Category.builder().id(2).parent(category).build();

        // When
        when(cateRepo.findById(2)).thenReturn(Optional.of(parent));

        // Then
        HttpResponseException exception = assertThrows(HttpResponseException.class,
                () -> cateService.addCategory(req));
        assertEquals("Invalid parent category!", exception.getError());

        // Verify
        verify(cateRepo, times(1)).findById(req.getParentId());
        verify(cateRepo, never()).save(any(Category.class));
    }

    @Test
    public void whenUpdateCategory_ThenReturnsUpdatedCategory() {

        // Given
        Integer id = 1;

        // When
        when(cateRepo.findById(id)).thenReturn(Optional.of(category));
        when(cateRepo.save(any(Category.class))).thenReturn(category);

        // Then
        Category result = cateService.updateCategory(id, request);

        assertNotNull(result);
        assertEquals(category, result);

        // Verify
        verify(cateRepo, times(1)).findById(id);
        verify(cateRepo, times(1)).save(any(Category.class));

    }

    @Test
    public void whenUpdateNonExistingCategory_ThenThrowsException() {

        // Given
        Integer id = 1;

        // When
        when(cateRepo.findById(id)).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> cateService.updateCategory(id, request));
        assertEquals("Category not found!", exception.getError());

        // Verify
        verify(cateRepo, times(1)).findById(id);
        verify(cateRepo, never()).save(any(Category.class));
    }

    @Test
    public void whenUpdateCategoryWithParent_ThenReturnsUpdatedCategory() {

        // Given
        Integer id = 3;
        CategoryRequest req = CategoryRequest.builder().name("Child").parentId(2).build();
        Category parent = Category.builder().id(2).build();
        Category childCate = Category.builder().id(3).subCates(new ArrayList<>()).parent(category).build();

        // When
        when(cateRepo.findById(id)).thenReturn(Optional.of(childCate));
        when(cateRepo.findById(req.getParentId())).thenReturn(Optional.of(parent));
        when(cateRepo.save(any(Category.class))).thenReturn(category);

        // Then
        Category result = cateService.updateCategory(id, req);

        assertNotNull(result);
        assertEquals(category, result);

        // Verify
        verify(cateRepo, times(1)).findById(id);
        verify(cateRepo, times(1)).findById(req.getParentId());
        verify(cateRepo, times(1)).save(any(Category.class));
    }

    @Test
    public void whenUpdateInvalidChildCategoryWithParent_ThenThrowsException() {

        // Given
        Integer id = 3;
        CategoryRequest req = CategoryRequest.builder().name("Child").parentId(2).build();
        Category childCate = Category.builder().id(3).parent(category).subCates(List.of(category)).build();

        // When
        when(cateRepo.findById(id)).thenReturn(Optional.of(childCate));

        // Then
        HttpResponseException exception = assertThrows(HttpResponseException.class,
                () -> cateService.updateCategory(id, req));
        assertEquals("Invalid child category!", exception.getError());

        // Verify
        verify(cateRepo, times(1)).findById(id);
        verify(cateRepo, never()).findById(req.getParentId());
        verify(cateRepo, never()).save(any(Category.class));
    }

    @Test
    public void whenUpdateCategoryWithNonExistingNewParent_ThenThrowsException() {

        // Given
        Integer id = 3;
        CategoryRequest req = CategoryRequest.builder().name("Child").description("test").parentId(1).build();
        Category childCate = Category.builder().id(3).subCates(new ArrayList<>()).build();

        // When
        when(cateRepo.findById(id)).thenReturn(Optional.of(childCate));
        when(cateRepo.findById(req.getParentId())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> cateService.updateCategory(id, req));
        assertEquals("Parent category not found!", exception.getError());

        // Verify
        verify(cateRepo, times(1)).findById(id);
        verify(cateRepo, times(1)).findById(req.getParentId());
        verify(cateRepo, never()).save(any(Category.class));
    }

    @Test
    public void whenUpdateCategoryWithInvalidNewParent_ThenThrowsException() {

        // Given
        Integer id = 3;
        CategoryRequest req = CategoryRequest.builder().name("Child").description("test").parentId(2).build();
        Category parent = Category.builder().id(2).parent(category).build();
        Category childCate = Category.builder().id(3).subCates(new ArrayList<>()).build();

        // When
        when(cateRepo.findById(id)).thenReturn(Optional.of(childCate));
        when(cateRepo.findById(2)).thenReturn(Optional.of(parent));

        // Then
        HttpResponseException exception = assertThrows(HttpResponseException.class,
                () -> cateService.updateCategory(id, req));
        assertEquals("Invalid parent category!", exception.getError());

        // Verify
        verify(cateRepo, times(1)).findById(id);
        verify(cateRepo, times(1)).findById(req.getParentId());
        verify(cateRepo, never()).save(any(Category.class));
    }

    @Test
    public void whenDeleteCategory_ThenSuccess() {

        // Given
        Integer id = 1;

        // When
        doNothing().when(cateRepo).deleteById(id);

        // Then
        cateService.deleteCategory(id);

        // Verify
        verify(cateRepo, times(1)).deleteById(id);
    }

    @Test
    public void whenDeleteCategories_ThenSuccess() {

        // Given
        List<Integer> ids = List.of(1, 2, 3);

        // When
        doNothing().when(cateRepo).deleteAllByIdInBatch(ids);

        // Then
        cateService.deleteCategories(ids);

        // Then
        verify(cateRepo).deleteAllByIdInBatch(ids);
    }

    @Test
    public void whenDeleteCategoriesInverse_ThenSuccess() {

        // Given
        Integer parentId = 1;
        List<Integer> ids = List.of(1, 2, 3);
        List<Integer> inverseIds = List.of(4);

        // When
        when(cateRepo.findInverseIds(eq(parentId), eq(ids))).thenReturn(inverseIds);
        doNothing().when(cateRepo).deleteAllByIdInBatch(inverseIds);

        // Then
        cateService.deleteCategoriesInverse(parentId, ids);

        // Verify
        verify(cateRepo, times(1)).findInverseIds(eq(parentId), eq(ids));
        verify(cateRepo, times(1)).deleteAllByIdInBatch(inverseIds);
    }

    @Test
    public void whenDeleteAllCategories_ThenSuccess() {

        // When
        doNothing().when(cateRepo).deleteAll();

        // Then
        cateService.deleteAllCategories();

        // Verify
        verify(cateRepo, times(1)).deleteAll();
    }
}