package com.ring.repository;

import com.ring.base.AbstractRepositoryTest;
import com.ring.dto.projection.books.IBook;
import com.ring.dto.projection.books.IBookDetail;
import com.ring.model.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BookDetailRepositoryTest extends AbstractRepositoryTest {

    @Autowired
    private BookDetailRepository detailRepo;

    @Autowired
    private BookRepository bookRepo;

    @Autowired
    private ShopRepository shopRepo;

    @Autowired
    private CategoryRepository cateRepo;

    @Autowired
    private PublisherRepository pubRepo;

    @Autowired
    private AccountRepository accountRepo;

    @Autowired
    private ImageRepository imageRepo;

    private Book book;
    private BookDetail detail;

    @BeforeEach
    void setUp() {
        Account account = Account.builder()
                .username("initial")
                .pass("asd")
                .email("initialEmail@initial.com")
                .build();
        account.setCreatedDate(LocalDateTime.now());
        Account savedAccount = accountRepo.save(account);

        Shop shop = Shop.builder().name("shop").owner(savedAccount).build();
        shop.setCreatedDate(LocalDateTime.now());
        Shop savedShop = shopRepo.save(shop);

        Category cate = Category.builder().name("test").build();
        Category savedCate = cateRepo.save(cate);

        Publisher pub = Publisher.builder().name("test").build();
        Publisher savedPub = pubRepo.save(pub);

        Image image = Image.builder().name("image").build();
        Image image2 = Image.builder().name("image2").build();
        Image image3 = Image.builder().name("image3").build();

        book = Book.builder()
                .image(image)
                .slug("test")
                .title("book")
                .author("author")
                .price(10000.0)
                .discount(BigDecimal.valueOf(0))
                .amount((short) 88)
                .shop(savedShop)
                .cate(savedCate)
                .publisher(savedPub)
                .build();
        Book book2 = Book.builder()
                .image(image2)
                .slug("test2")
                .title("book2")
                .author("author2")
                .price(20000.0)
                .discount(BigDecimal.valueOf(0))
                .amount((short) 1)
                .shop(savedShop)
                .cate(savedCate)
                .publisher(savedPub)
                .build();
        book.setCreatedDate(LocalDateTime.now().minusMonths(1));
        book2.setCreatedDate(LocalDateTime.now().minusMonths(1));
        List<Book> books = new ArrayList<>(List.of(book, book2));
        bookRepo.saveAll(books);

        detail = BookDetail.builder()
                .book(book)
                .pages(123)
                .previewImages(new ArrayList<>(List.of(image3)))
                .build();
        BookDetail detail2 = BookDetail.builder()
                .book(book2)
                .pages(123)
                .build();
        List<BookDetail> details = new ArrayList<>(List.of(detail, detail2));
        detailRepo.saveAll(details);
    }

    @Test
    public void givenNewBookDetail_whenSaveBookDetail_ThenReturnBookDetail() {

        // Given
        Image image = Image.builder().name("image3").build();
        Book book = Book.builder()
                .image(image)
                .build();
        BookDetail bookDetail = BookDetail.builder()
                .book(book)
                .bLength((short) 8.5)
                .bWidth((short) 11)
                .bHeight((short) 1.2)
                .pages(300)
                .bWeight((short) 1.2)
                .build();

        // When
        BookDetail savedDetail = detailRepo.save(bookDetail);

        // Then
        assertNotNull(savedDetail);
        assertNotNull(savedDetail.getId());
    }

    @Test
    public void whenUpdateBookDetail_ThenReturnUpdatedBookDetail() {

        // Given
        BookDetail foundDetail = detailRepo.findById(detail.getId()).orElse(null);
        assertNotNull(foundDetail);

        // When
        foundDetail.setPages(320);
        foundDetail.setBDate(LocalDate.now());

        BookDetail updatedDetail = detailRepo.save(foundDetail);

        // Then
        assertNotNull(updatedDetail);
        assertNotNull(updatedDetail.getBDate());
        assertEquals(320, updatedDetail.getPages());
    }

    @Test
    public void whenDeleteBookDetail_ThenFindNull() {

        // When
        detailRepo.deleteById(detail.getId());

        // Then
        BookDetail foundDetail = detailRepo.findById(detail.getId()).orElse(null);
        Book foundBook = bookRepo.findById(book.getId()).orElse(null);
        List<Image> foundImages = imageRepo.findAll();
        assertNull(foundDetail);
        assertNotNull(foundBook);
        assertEquals(2, foundImages.size());
    }

    @Test
    public void whenFindBookDetail_ThenReturnCorrectDetail() {

        // When
        IBookDetail foundDetail = detailRepo.findBookDetail(book.getId(), null).orElse(null);
        IBookDetail foundDetail2 = detailRepo.findBookDetail(null, book.getSlug()).orElse(null);

        // Then
        assertNotNull(foundDetail);
        assertNotNull(foundDetail2);
        assertEquals(foundDetail.getId(), foundDetail2.getId());
    }

    // @Test
    // public void whenFindBook_ThenReturnBook() {

    //     // When
    //     IBook foundBook = detailRepo.findBook(book.getId()).orElse(null);

    //     // Then
    //     assertNotNull(foundBook);
    //     assertEquals(book.getId(), foundBook.getId());
    // }
}