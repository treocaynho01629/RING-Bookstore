package com.ring.repository;

import com.ring.base.AbstractRepositoryTest;
import com.ring.dto.projection.categories.ICategory;
import com.ring.model.entity.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class CategoryRepositoryTest extends AbstractRepositoryTest {

    @Autowired
    private CategoryRepository cateRepo;

    @Autowired
    private BookRepository bookRepo;

    @Autowired
    private ShopRepository shopRepo;

    @Autowired
    private AccountRepository accountRepo;

    @PersistenceContext
    private EntityManager entityManager;

    private Category cate;
    private Category childCate;
    private Shop shop;
    private Book book;
    private Book bookwithChild;

    @BeforeEach
    void setUp() {
        Account account = Account.builder()
                .username("initial")
                .pass("asd")
                .email("initialEmail@initial.com")
                .build();
        account.setCreatedDate(LocalDateTime.now());
        Account savedAccount = accountRepo.save(account);

        shop = Shop.builder().name("shop").owner(savedAccount).build();
        shop.setCreatedDate(LocalDateTime.now());
        Shop savedShop = shopRepo.save(shop);

        cate = Category.builder()
                .name("test")
                .slug("test")
                .build();
        Category cate2 = Category.builder()
                .name("test2")
                .slug("test2")
                .build();
        List<Category> categories = new ArrayList<>(List.of(cate, cate2));
        cateRepo.saveAll(categories);

        childCate = Category.builder()
                .name("testChild")
                .slug("slug")
                .parent(cate)
                .build();
        cateRepo.save(childCate);

        Image image = Image.builder().publicId("image").build();
        Image image2 = Image.builder().publicId("image2").build();
        Image image3 = Image.builder().publicId("image3").build();

        book = Book.builder()
                .image(image)
                .cate(cate)
                .build();
        bookwithChild = Book.builder()
                .image(image3)
                .cate(childCate)
                .build();
        Book book3 = Book.builder()
                .image(image2)
                .cate(cate2)
                .shop(savedShop)
                .build();

        book.setCreatedDate(LocalDateTime.now());
        bookwithChild.setCreatedDate(LocalDateTime.now());
        book3.setCreatedDate(LocalDateTime.now());
        List<Book> books = new ArrayList<>(List.of(book, bookwithChild, book3));
        bookRepo.saveAll(books);

        entityManager.flush();
        entityManager.clear();
    }

    @Test
    public void givenNewCategory_whenSaveCategory_ThenReturnCategory() {

        // Given
        Category category = Category.builder()
                .name("Fiction")
                .slug("fiction")
                .parent(cate)
                .build();

        // When
        Category savedCategory = cateRepo.save(category);

        // Then
        assertNotNull(savedCategory);
        assertNotNull(savedCategory.getId());
    }

    @Test
    public void whenUpdateCategory_ThenReturnUpdatedCategory() {

        // Given
        Category foundCate = cateRepo.findById(childCate.getId()).orElse(null);
        assertNotNull(foundCate);

        // When
        foundCate.setSlug("science-fiction");
        foundCate.setDescription("Science Fiction");
        foundCate.setParent(null);

        Category updatedCategory = cateRepo.save(foundCate);

        // Then
        assertNotNull(updatedCategory);
        assertNotNull(updatedCategory.getDescription());
        assertNull(updatedCategory.getParent());
        assertEquals("science-fiction", updatedCategory.getSlug());
    }

    @Test
    public void whenDeleteCategory_ThenFindNull() {

        // When
        cateRepo.deleteById(cate.getId());
        entityManager.flush();
        entityManager.clear();

        // Then
        Category foundCate = cateRepo.findById(cate.getId()).orElse(null);
        Category foundChildCate = cateRepo.findById(childCate.getId()).orElse(null);
        List<Book> foundBooks = bookRepo.findAll();

        assertNull(foundCate);
        assertNull(foundChildCate);
        assertEquals(3, foundBooks.size());
    }

    @Test
    public void whenDeleteChildCategory_ThenBookUpdateToParentCategory() {

        // When
        cateRepo.deleteById(childCate.getId());

        // Then
        Category foundChildCate = cateRepo.findById(childCate.getId()).orElse(null);
        Category foundCate = cateRepo.findById(cate.getId()).orElse(null);
        Book foundBook = bookRepo.findById(bookwithChild.getId()).orElse(null);

        assertNull(foundChildCate);
        assertNotNull(foundCate);
        assertNotNull(foundBook);
        assertEquals(foundCate.getId(), foundBook.getCate().getId());
    }

    @Test
    public void whenFindCategories_ThenReturnPagedResult() {

        // When
        Pageable pageable = PageRequest.of(0, 10);
        Page<ICategory> foundCates = cateRepo.findCates(null, pageable);
        Page<ICategory> foundCates2 = cateRepo.findCates(cate.getId(), pageable);

        // Then
        assertNotNull(foundCates);
        assertNotNull(foundCates2);
        assertEquals(2, foundCates.getContent().size());
        assertEquals(1, foundCates2.getContent().size());
    }

    @Test
    public void whenFindCategoriesWithIds_ThenReturnCorrectList() {

        // Given
        List<Category> categories = cateRepo.findAll();
        List<Integer> ids = categories.stream().map(Category::getId).collect(Collectors.toList());
        ids.remove(0);

        // When
        List<ICategory> foundCates = cateRepo.findCatesWithIds(ids);

        // Then
        assertNotNull(foundCates);
        assertEquals(2, foundCates.size());
    }

    @Test
    public void whenFindParentAndSubCategories_ThenReturnCorrectList() {

        // When
        List<Integer> ids = new ArrayList<>(List.of(cate.getId()));
        List<ICategory> foundCates = cateRepo.findParentAndSubCatesWithParentIds(ids);

        // Then
        assertNotNull(foundCates);
        assertEquals(2, foundCates.size());
    }

    @Test
    public void whenFindCateIds_ThenReturnCorrectList() {

        // When
        Pageable pageable = PageRequest.of(0, 10);
        Page<Integer> foundIds = cateRepo.findCateIdsByParent(null, pageable);
        Page<Integer> foundIds2 = cateRepo.findCateIdsByParent(cate.getId(), pageable);

        // Then
        assertNotNull(foundIds);
        assertNotNull(foundIds2);
        assertEquals(2, foundIds.getContent().size());
        assertEquals(1, foundIds2.getContent().size());
    }

    @Test
    public void whenFindRelevantCategories_ThenReturnCorrectArray() {

        // // When
        // Pageable pageable = PageRequest.of(0, 10);
        // Page<Integer[]> foundArrays = cateRepo.findRelevantCategories(shop.getId(),
        // pageable);

        // // Then
        // assertNotNull(foundArrays);
        // assertEquals(1, foundArrays.getContent().size());
    }

    @Test
    public void whenFindPreviewCategories_ThenReturnCategoriesWithImagePublicId() {

        // When
        List<ICategory> foundCates = cateRepo.findPreviewCategories();

        // Then
        assertNotNull(foundCates);
        assertEquals(3, foundCates.size());
        assertNotNull(foundCates.get(0).getPublicId());
    }

    @Test
    public void whenFindCategoryByIdOrSlug_ThenReturnCorrectCategory() {

        // When
        Category foundCate = cateRepo.findCate(cate.getId(), null).orElse(null);
        Category foundCate2 = cateRepo.findCate(null, cate.getSlug()).orElse(null);

        // Then
        assertNotNull(foundCate);
        assertNotNull(foundCate2);
        assertEquals(foundCate, foundCate2);
    }

    @Test
    public void whenFindCategoryWithChildren_ThenReturnCorrectCategory() {

        // When
        Category foundCate = cateRepo.findCateWithChildren(cate.getId(), null).orElse(null);

        // Then
        assertNotNull(foundCate);
        assertNotNull(foundCate.getSubCates());
    }

    @Test
    public void whenFindCategoryWithParent_ThenReturnCorrectCategory() {

        // When
        Category foundCate = cateRepo.findCateWithParent(childCate.getId(), null).orElse(null);

        // Then
        assertNotNull(foundCate);
        assertNotNull(foundCate.getParent());
    }

    @Test
    public void whenFindInverseCategoryIds_ThenReturnCorrectSize() {

        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<ICategory> foundCates = cateRepo.findCates(null, pageable);
        List<Integer> foundIds = foundCates.getContent().stream().map(ICategory::getId).collect(Collectors.toList());
        foundIds.remove(0);

        // When
        List<Integer> inverseIds = cateRepo.findInverseIds(null, foundIds);

        // Then
        assertNotNull(inverseIds);
        assertEquals(foundCates.getTotalElements() - foundIds.size(), inverseIds.size());
    }
}