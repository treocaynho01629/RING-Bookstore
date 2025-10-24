package com.ring.repository;

import com.ring.base.AbstractRepositoryTest;
import com.ring.dto.projection.images.IImage;
import com.ring.model.entity.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

class ImageRepositoryTest extends AbstractRepositoryTest {

    @Autowired
    private ImageRepository imageRepo;

    @Autowired
    private AccountProfileRepository profileRepo;

    @Autowired
    private BookRepository bookRepo;

    @Autowired
    private BookDetailRepository detailRepo;

    @PersistenceContext
    private EntityManager entityManager;

    private Image image;
    private Image image2;
    private AccountProfile profile;
    private Book book;
    private BookDetail detail;

    @BeforeEach
    void setUp() {
        image = Image.builder().name("image").publicId("image").build();
        Image image3 = Image.builder().name("image3").publicId("image3").build();
        Image image4 = Image.builder().name("image4").publicId("image4").build();
        List<Image> images = new ArrayList<>(List.of(image, image3, image4));
        imageRepo.saveAll(images);

        Account account = Account.builder()
                .username("username")
                .pass("asd")
                .email("email")
                .build();
        account.setCreatedDate(LocalDateTime.now());
        profile = AccountProfile.builder()
                .dob(LocalDate.now())
                .user(account)
                .image(image4)
                .build();
        profileRepo.save(profile);

        book = Book.builder()
                .image(image)
                .slug("test")
                .title("book")
                .author("author")
                .price(10000.0)
                .discount(BigDecimal.valueOf(0))
                .amount((short) 88)
                .build();
        book.setCreatedDate(LocalDateTime.now());
        bookRepo.save(book);

        detail = BookDetail.builder()
                .book(book)
                .pages(123)
                .build();
        detailRepo.save(detail);
        image2 = Image.builder().name("image2").publicId("image2").detail(detail).build();
        imageRepo.save(image2);

        entityManager.flush();
        entityManager.clear();
    }

    @Test
    public void givenNewImage_whenSaveImage_ThenReturnImage() {

        // Given
        Image image = Image.builder().name("test").build();

        // When
        Image savedImage = imageRepo.save(image);

        // Then
        assertNotNull(savedImage);
        assertNotNull(savedImage.getId());
    }

    @Test
    public void whenUpdateImage_ThenReturnImage() {

        // Given
        Image foundImage = imageRepo.findById(image.getId()).orElse(null);
        assertNotNull(foundImage);

        // When
        foundImage.setName("test");
        foundImage.setUrl("test.com");

        Image updatedImage = imageRepo.save(foundImage);

        // Then
        assertNotNull(updatedImage);
        assertNotNull(updatedImage.getUrl());
        assertEquals("test", updatedImage.getName());
    }

    @Test
    public void whenDeleteImage_ThenFindNull() {

        // When
        imageRepo.deleteById(image2.getId());

        // Then
        Image foundImage = imageRepo.findById(image2.getId()).orElse(null);
        BookDetail foundDetail = detailRepo.findById(detail.getId()).orElse(null);

        assertNull(foundImage);
        assertNotNull(foundDetail);
    }

    @Test
    public void whenFindPublicIds_ThenReturnPublicIds() {

        // Given
        List<Image> images = imageRepo.findAll();
        List<Long> ids = images.stream().map(Image::getId).collect(Collectors.toList());

        // When
        List<String> foundPublicIds = imageRepo.findPublicIds(ids);

        // Then
        assertNotNull(foundPublicIds);
        assertFalse(foundPublicIds.isEmpty());
    }

    @Test
    public void whenFindImagesByIds_ThenReturnImages() {

        // Given
        List<Image> images = imageRepo.findAll();
        List<Long> ids = images.stream().map(Image::getId).collect(Collectors.toList());
        ids.remove(0);

        // When
        List<Image> foundImages = imageRepo.findImages(ids);

        // Then
        assertNotNull(foundImages);
        assertEquals(3, foundImages.size());
    }

    @Test
    public void whenFindByProfile_ThenReturnImageDetails() {

        // When
        IImage foundImage = imageRepo.findByProfile(profile.getId()).orElse(null);

        // Then
        assertNotNull(foundImage);
        assertEquals(profile.getImage().getPublicId(), foundImage.getPublicId());
    }

    @Test
    public void whenFindBookImage_ThenReturnImage() {

        // When
        Image foundImage = imageRepo.findBookImage(book.getId(), image.getId()).orElse(null);
        Image foundImage2 = imageRepo.findBookImage(book.getId(), image2.getId()).orElse(null);

        // Then
        assertNotNull(foundImage);
        assertNotNull(foundImage2);
        assertEquals(book.getImage().getId(), foundImage.getId());
        assertEquals(image2.getId(), foundImage2.getId());
    }

//    @Test
//    public void whenFindBookImagePublicIds_ThenReturnPublicIds() {
//
//        // When
//        List<String> foundPublicIds = imageRepo.findBookImagePublicIds(book.getId(),
//                new ArrayList<>(List.of(image.getId(), image2.getId())));
//
//        // Then
//        assertNotNull(foundPublicIds);
//        assertEquals(2, foundPublicIds.size());
//    }
}