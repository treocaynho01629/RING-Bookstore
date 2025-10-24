package com.ring.repository;

import com.ring.base.AbstractRepositoryTest;
import com.ring.dto.projection.books.IBookDisplay;
import com.ring.dto.projection.dashboard.IStat;
import com.ring.model.entity.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class BookRepositoryTest extends AbstractRepositoryTest {

    @Autowired
    private BookRepository bookRepo;

    @Autowired
    private BookDetailRepository detailRepo;

    @Autowired
    private ShopRepository shopRepo;

    @Autowired
    private CategoryRepository cateRepo;

    @Autowired
    private AccountRepository accountRepo;

    @Autowired
    private ImageRepository imageRepo;

    @Autowired
    private PublisherRepository pubRepo;

    @Autowired
    private ReviewRepository reviewRepo;

    @Autowired
    private OrderItemRepository itemRepo;

    @PersistenceContext
    private EntityManager entityManager;

    private Book book;
    private Account account;
    private Shop shop;
    private Image image;
    private Category cate;

    @BeforeEach
    void setUp() {
        account = Account.builder()
                .username("initial")
                .pass("asd")
                .email("initialEmail@initial.com")
                .build();
        account.setCreatedDate(LocalDateTime.now());
        Account savedAccount = accountRepo.save(account);

        shop = Shop.builder().name("shop").owner(savedAccount).build();
        shop.setCreatedDate(LocalDateTime.now());
        Shop savedShop = shopRepo.save(shop);

        cate = Category.builder().name("test").build();
        Category savedCate = cateRepo.save(cate);

        image = Image.builder().name("image").build();
        Image image2 = Image.builder().name("image2").build();
        Image image3 = Image.builder().name("image3").build();

        book = Book.builder()
                .image(image)
                .title("book")
                .author("author")
                .price(10000.0)
                .discount(BigDecimal.valueOf(0))
                .amount((short) 88)
                .shop(savedShop)
                .cate(savedCate)
                .build();
        Book book2 = Book.builder()
                .image(image2)
                .title("book2")
                .author("author2")
                .price(20000.0)
                .discount(BigDecimal.valueOf(0))
                .amount((short) 1)
                .shop(savedShop)
                .cate(savedCate)
                .build();
        Book book3 = Book.builder()
                .image(image3)
                .title("3koob")
                .author("author3")
                .price(30000.0)
                .discount(BigDecimal.valueOf(0))
                .amount((short) 0)
                .shop(savedShop)
                .cate(savedCate)
                .build();
        book.setCreatedDate(LocalDateTime.now().minusMonths(1));
        book2.setCreatedDate(LocalDateTime.now().minusMonths(1));
        book3.setCreatedDate(LocalDateTime.now());
        List<Book> books = new ArrayList<>(List.of(book, book2, book3));
        bookRepo.saveAll(books);
    }

    @Test
    public void givenNewBook_whenSaveBook_ThenReturnBook() {

        // Given
        Image image = Image.builder().build();
        Book book = Book.builder()
                .image(image)
                .title("book4")
                .author("author4")
                .price(60000.0)
                .discount(BigDecimal.valueOf(0.3))
                .amount((short) 111)
                .build();

        // When
        Book savedBook = bookRepo.save(book);

        // Then
        assertNotNull(savedBook);
        assertNotNull(savedBook.getId());
    }

    @Test
    public void whenUpdateBook_ThenReturnBook() {

        // Given
        Book foundBook = bookRepo.findById(book.getId()).orElse(null);
        assertNotNull(foundBook);

        // When
        foundBook.setTitle("tset");
        foundBook.setDescription("description");

        Book updatedBook = bookRepo.save(foundBook);

        // Then
        assertNotNull(updatedBook);
        assertNotNull(updatedBook.getDescription());
        assertEquals("tset", updatedBook.getTitle());
    }

    @Test
    public void whenReplaceBookImage_ThenDeleteOldImage_AndReturnBook() {

        // Given
        Image image4 = Image.builder().name("image4").build();
        Book foundBook = bookRepo.findById(book.getId()).orElse(null);
        assertNotNull(foundBook);

        // When
        foundBook.setImage(image4);

        Book updatedBook = bookRepo.save(foundBook);

        entityManager.flush();
        entityManager.clear();

        // Then
        Image foundImage = imageRepo.findById(image.getId()).orElse(null);

        assertNotNull(updatedBook);
        assertNotNull(updatedBook.getImage());
        assertEquals(image4.getName(), updatedBook.getImage().getName());
        assertNull(foundImage);
    }

    @Test
    public void whenDeleteBook_ThenFindNull() {

        // Given
        Book beforeChange = bookRepo.findById(book.getId()).orElse(null);
        assertNotNull(beforeChange);

        BookDetail detail = BookDetail.builder()
                .book(beforeChange)
                .pages(123)
                .build();
        detailRepo.save(detail);

        Review review = Review.builder()
                .book(book)
                .user(account)
                .rating(5)
                .rContent("test")
                .build();
        review.setCreatedDate(LocalDateTime.now());
        reviewRepo.save(review);

        OrderItem item = OrderItem.builder()
                .book(book)
                .quantity((short) 99)
                .build();
        itemRepo.save(item);

        Publisher pub = Publisher.builder().name("test2").build();
        pubRepo.save(pub);

        beforeChange.setPublisher(pub);
        bookRepo.save(beforeChange);

        entityManager.flush();
        entityManager.clear();

        // When
        bookRepo.deleteById(book.getId());

        // Then
        Book foundBook = bookRepo.findById(book.getId()).orElse(null);
        BookDetail foundDetail = detailRepo.findById(detail.getId()).orElse(null);
        Image foundImage = imageRepo.findById(image.getId()).orElse(null);
        Review foundReview = reviewRepo.findById(review.getId()).orElse(null);
        Shop foundShop = shopRepo.findById(shop.getId()).orElse(null);
        Category foundCate = cateRepo.findById(cate.getId()).orElse(null);
        Publisher foundPub = pubRepo.findById(pub.getId()).orElse(null);
        List<OrderItem> foundItems = itemRepo.findAll();

        assertNull(foundBook);
        assertNull(foundDetail);
        assertNull(foundImage);
        assertNull(foundReview);
        assertNotNull(foundShop);
        assertNotNull(foundCate);
        assertNotNull(foundPub);
        assertEquals(1, foundItems.size());
    }

    @Test
    public void whenFindBooksWithFilter_ThenReturnBooks() {

        // When
        Pageable pageable = PageRequest.of(0, 10);
        Page<IBookDisplay> foundBooks = bookRepo.findBooksWithFilter(
                "book",
                null,
                null,
                null,
                null,
                null,
                0.0,
                1000000.0,
                false,
                0,
                0,
                pageable);

        // Then
        assertNotNull(foundBooks);
        assertEquals(2, foundBooks.getContent().size());
    }

    @Test
    public void whenFindRandomBooks_ThenReturnBooks() {

        // When
        List<IBookDisplay> books = bookRepo.findRandomBooks(1, false);

        // Then
        assertNotNull(books);
        assertEquals(1, books.size());
    }

    @Test
    public void whenFindBookIdsByInIdsAndOwner_ThenReturnIds() {

        // Given
        List<Book> foundBooks = bookRepo.findAll();
        List<Long> foundIds = foundBooks.stream().map(Book::getId).collect(Collectors.toList());

        // When
        List<Long> bookIds = bookRepo.findBookIdsByInIdsAndOwner(foundIds, account.getId());

        // Then
        assertNotNull(bookIds);
        assertEquals(foundIds.size(), bookIds.size());
    }

    @Test
    public void whenFindBooksDisplayInIds_ThenReturnBooks() {

        // Given
        List<Book> foundBooks = bookRepo.findAll();
        List<Long> foundIds = foundBooks.stream().map(Book::getId).collect(Collectors.toList());
        foundIds.remove(0);

        // When
        List<IBookDisplay> books = bookRepo.findBooksDisplayInIds(foundIds);

        // Then
        assertNotNull(books);
        assertEquals(2, books.size());
    }

    @Test
    public void whenFindInverseIds_ThenReturnIds() {

        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<IBookDisplay> foundBooks = bookRepo.findBooksWithFilter(
                "",
                null,
                null,
                null,
                null,
                null,
                0.0,
                1000000.0,
                false,
                0,
                0,
                pageable);
        List<Long> foundIds = foundBooks.getContent().stream().map(IBookDisplay::getId).collect(Collectors.toList());
        foundIds.remove(0);

        // When
        List<Long> inverseIds = bookRepo.findInverseIds(
                "",
                null,
                null,
                null,
                null,
                null,
                0.0,
                1000000.0,
                0,
                0,
                foundIds);

        // Then
        assertNotNull(inverseIds);
        assertEquals(foundBooks.getTotalElements() - foundIds.size(), inverseIds.size());
    }

    @Test
    public void whenGetBookAnalytics_ThenReturnStats() {

        // When
        IStat foundData = bookRepo.getBookAnalytics(null, account.getId());

        // Then
        assertNotNull(foundData);
        assertEquals(3, foundData.getTotal());
        assertEquals(2, foundData.getLastMonth());
        assertEquals(1, foundData.getCurrentMonth());
    }

    @Test
    public void whenFindSuggestion_ThenReturnKeywords() {

        // When
        List<String> suggestions = bookRepo.findSuggestion("ko");

        // Then
        assertNotNull(suggestions);
        assertFalse(suggestions.isEmpty());
    }

    @Test
    public void whenDecreaseStock_ThenReduceAmount() {

        // When
        bookRepo.decreaseStock(book.getId(), (short) 5);
        entityManager.flush(); // Force changes to be written
        entityManager.clear(); // Clear persistence context to fetch fresh data

        // Then
        Book foundBook = bookRepo.findById(book.getId()).orElse(null);

        assertNotNull(foundBook);
        assertNotEquals(88, (short) foundBook.getAmount());
    }
}