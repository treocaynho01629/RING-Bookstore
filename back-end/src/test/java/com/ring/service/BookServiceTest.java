package com.ring.service;

import com.cloudinary.api.ApiResponse;
import com.github.slugify.Slugify;
import com.ring.base.AbstractServiceTest;
import com.ring.dto.projection.books.IBook;
import com.ring.dto.projection.books.IBookDetail;
import com.ring.dto.projection.books.IBookDisplay;
import com.ring.dto.request.BookRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.books.BookDTO;
import com.ring.dto.response.books.BookDetailDTO;
import com.ring.dto.response.books.BookDisplayDTO;
import com.ring.dto.response.books.BookResponseDTO;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.listener.ImageEntityListener;
import com.ring.mapper.BookMapper;
import com.ring.model.entity.*;
import com.ring.model.enums.BookType;
import com.ring.model.enums.UserRole;
import com.ring.repository.*;
import com.ring.service.impl.BookServiceImpl;
import com.ring.common.FileUploadUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class BookServiceTest extends AbstractServiceTest {

        @Mock
        private BookRepository bookRepo;

        @Mock
        private BookDetailRepository detailRepo;

        @Mock
        private PublisherRepository pubRepo;

        @Mock
        private CategoryRepository cateRepo;

        @Mock
        private ShopRepository shopRepo;

        @Mock
        private ImageRepository imageRepo;

        @Mock
        private ImageService imageService;

        @Mock
        private ImageEntityListener eventListener;

        @Mock
        private Slugify slg;

        @Mock
        private BookMapper bookMapper;

        @InjectMocks
        private BookServiceImpl bookService;

        private final MockMultipartFile file = new MockMultipartFile(
                        "file",
                        "book_thumbnail.png",
                        MediaType.IMAGE_PNG_VALUE,
                        "Book Thumbnail".getBytes());
        private final Image image = Image.builder().id(1L).name("book_image.png").build();
        private final Role role = Role.builder()
                        .roleName(UserRole.ROLE_ADMIN)
                        .build();
        private Account account = Account.builder().id(1L).roles(List.of(role)).build();
        private final Shop shop = Shop.builder().id(1L).owner(account).build();
        private BookRequest request = BookRequest.builder()
                        .title("Test Book")
                        .description("Test Description")
                        .price(100.0)
                        .discount(BigDecimal.valueOf(0.1))
                        .amount((short) 10)
                        .shopId(1L)
                        .cateId(1)
                        .pubId(1)
                        .type(BookType.SOFT_COVER)
                        .thumbnailId(3L)
                        .removeIds(List.of(1L, 2L))
                        .build();

        @AfterEach
        public void cleanUp() {
                account = Account.builder().id(1L).roles(List.of(role)).build();
                request = BookRequest.builder()
                                .title("Test Book")
                                .description("Test Description")
                                .price(100.0)
                                .discount(BigDecimal.valueOf(0.1))
                                .amount((short) 10)
                                .shopId(1L)
                                .cateId(1)
                                .pubId(1)
                                .type(BookType.SOFT_COVER)
                                .build();
                SecurityContextHolder.clearContext();
        }

        @Test
        public void whenGetRandomBooks_ThenReturnsBooks() {

                // Given
                List<BookDisplayDTO> expectedBooks = List.of(BookDisplayDTO.builder().id(1L).build());

                // When
                when(bookRepo.findRandomBooks(anyInt(), eq(false)))
                                .thenReturn(new ArrayList<>(List.of(mock(IBookDisplay.class))));
                when(bookMapper.displayToDTO(any(IBookDisplay.class)))
                                .thenReturn(BookDisplayDTO.builder().id(1L).build());

                // Then
                List<BookDisplayDTO> result = bookService.getRandomBooks(1, false);

                assertNotNull(result);
                assertFalse(result.isEmpty());
                assertEquals(expectedBooks.size(), result.size());

                // Verify
                verify(bookRepo, times(1)).findRandomBooks(anyInt(), eq(false));
                verify(bookMapper, times(1)).displayToDTO(any(IBookDisplay.class));
        }

        @Test
        public void whenGetBooksInIds_ThenReturnsBooks() {

                // Given
                List<Long> ids = List.of(1L, 2L);
                List<BookDisplayDTO> expectedBooks = List.of(
                                BookDisplayDTO.builder().title("test").build(),
                                BookDisplayDTO.builder().title("test").build());

                // When
                when(bookRepo.findBooksDisplayInIds(eq(ids)))
                                .thenReturn(new ArrayList<>(
                                                List.of(mock(IBookDisplay.class), mock(IBookDisplay.class))));
                when(bookMapper.displayToDTO(any(IBookDisplay.class)))
                                .thenReturn(BookDisplayDTO.builder().title("test").build());

                // Then
                List<BookDisplayDTO> result = bookService.getBooksInIds(ids);

                assertNotNull(result);
                assertEquals(expectedBooks.size(), result.size());

                // Verify
                verify(bookRepo, times(1)).findBooksDisplayInIds(eq(ids));
                verify(bookMapper, times(2)).displayToDTO(any(IBookDisplay.class));
        }

        @Test
        public void whenGetBooks_ThenReturnsPagedBooks() {

                // Given
                Pageable pageable = PageRequest.of(0, 1, Sort.by("id").descending());
                Page<IBookDisplay> books = new PageImpl<>(
                                List.of(mock(IBookDisplay.class)),
                                pageable,
                                2);
                BookDisplayDTO mapped = BookDisplayDTO.builder().id(1L).build();
                PagingResponse<BookDisplayDTO> expectedResponse = new PagingResponse<>(
                                List.of(mapped),
                                2,
                                2L,
                                1,
                                0,
                                false);

                // When
                when(bookRepo.findBooksWithFilter(eq(""),
                                isNull(),
                                isNull(),
                                isNull(),
                                isNull(),
                                isNull(),
                                eq(0.0),
                                eq(1000000.0),
                                eq(false),
                                eq(0),
                                eq(0),
                                any(Pageable.class))).thenReturn(books);
                when(bookMapper.displayToDTO(any(IBookDisplay.class))).thenReturn(mapped);

                // Then
                PagingResponse<BookDisplayDTO> result = bookService.getBooks(0,
                                1,
                                "id",
                                "desc",
                                "",
                                0,
                                0,
                                null,
                                null,
                                null,
                                null,
                                null,
                                0.0,
                                1000000.0,
                                false);

                assertNotNull(result);
                assertEquals(expectedResponse.getContent().size(), result.getContent().size());
                assertEquals(expectedResponse.getTotalPages(), result.getTotalPages());
                assertEquals(expectedResponse.getTotalElements(), result.getTotalElements());
                assertEquals(expectedResponse.getSize(), result.getSize());
                assertEquals(expectedResponse.getPage(), result.getPage());
                assertEquals(expectedResponse.isEmpty(), result.isEmpty());

                // Verify
                verify(bookRepo, times(1)).findBooksWithFilter(eq(""),
                                isNull(),
                                isNull(),
                                isNull(),
                                isNull(),
                                isNull(),
                                eq(0.0),
                                eq(1000000.0),
                                eq(false),
                                eq(0),
                                eq(0),
                                any(Pageable.class));
                verify(bookMapper, times(1)).displayToDTO(any(IBookDisplay.class));
        }

        @Test
        public void whenGetBookById_ThenReturnBookDTO() {

                // Given
                Long id = 1L;
                IBook book = mock(IBook.class);
                List<Long> imageIds = new ArrayList<>(List.of(2L, 3L));
                List<Image> images = List.of(mock(Image.class));
                BookDTO expected = BookDTO.builder().id(id).build();

                // When
                when(detailRepo.findBook(id)).thenReturn(Optional.of(book));
                when(book.getImage()).thenReturn(id);
                when(book.getPreviews()).thenReturn(imageIds);
                when(imageRepo.findImages(imageIds)).thenReturn(images);
                when(bookMapper.projectionToDTO(any(IBook.class), eq(images))).thenReturn(expected);

                // Then
                BookDTO result = bookService.getBook(id);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(detailRepo, times(1)).findBook(id);
                verify(book, times(1)).getImage();
                verify(book, times(2)).getPreviews();
                verify(imageRepo, times(1)).findImages(imageIds);
                verify(bookMapper, times(1)).projectionToDTO(any(IBook.class), eq(images));
        }

        @Test
        public void whenGetBookNonExistingBookById_ThenThrowsException() {

                // Given
                Long id = 1L;

                // When
                when(detailRepo.findBook(id)).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bookService.getBook(id));
                assertEquals("Product not found!", exception.getError());

                // Verify
                verify(detailRepo, times(1)).findBook(id);
        }

        @Test
        public void whenGetBookDetailById_ThenReturnsBookDetail() {

                // Given
                Long id = 1L;
                BookDetailDTO expected = BookDetailDTO.builder().id(1L).build();

                // When
                when(detailRepo.findBookDetail(eq(id), isNull())).thenReturn(Optional.of(mock(IBookDetail.class)));
                when(bookMapper.detailToDTO(any(IBookDetail.class))).thenReturn(expected);

                // Then
                BookDetailDTO result = bookService.getBookDetail(id);

                assertNotNull(result);
                assertEquals(expected.id(), result.id());

                // Verify
                verify(detailRepo, times(1)).findBookDetail(eq(id), isNull());
                verify(bookMapper, times(1)).detailToDTO(any(IBookDetail.class));
        }

        @Test
        public void whenGetBookDetailBySlug_ThenReturnsBookDetail() {

                // Given
                String slug = "test-book";
                BookDetailDTO expected = BookDetailDTO.builder().id(1L).build();

                // When
                when(detailRepo.findBookDetail(isNull(), eq(slug))).thenReturn(Optional.of(mock(IBookDetail.class)));
                when(bookMapper.detailToDTO(any(IBookDetail.class))).thenReturn(expected);

                // Then
                BookDetailDTO result = bookService.getBookDetail(slug);

                assertNotNull(result);
                assertEquals(expected.id(), result.id());

                // Verify
                verify(detailRepo, times(1)).findBookDetail(isNull(), eq(slug));
                verify(bookMapper, times(1)).detailToDTO(any(IBookDetail.class));
        }

        @Test
        public void whenGetNonExistingBookDetail_ThenThrowsException() {

                // Given
                Long id = 999L;

                // When
                when(detailRepo.findBook(id)).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bookService.getBook(id));
                assertEquals("Product not found!", exception.getError());

                // Verify
                verify(detailRepo, times(1)).findBook(id);
                verify(bookMapper, never()).detailToDTO(any(IBookDetail.class));
        }

        @Test
        public void whenGetSuggestion_ThenReturnSuggestionList() {

                // Given
                String keyword = "test";
                List<String> expected = List.of("test-suggestion", "test-recommend");

                // When
                when(bookRepo.findSuggestion(eq(keyword))).thenReturn(expected);

                // Then
                List<String> result = bookService.getBooksSuggestion(keyword);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(bookRepo, times(1)).findSuggestion(eq(keyword));
        }

        @Test
        public void givenNewBook_WhenAddBook_ThenReturnsNewBookResponseDTO() {

                // Given
                setupSecurityContext(account);
                MultipartFile[] images = { file };
                String slug = "test-string";
                BookResponseDTO expected = BookResponseDTO.builder()
                                .title(request.getTitle())
                                .price(request.getPrice())
                                .discount(request.getDiscount())
                                .slug(slug)
                                .build();

                // When
                when(cateRepo.findById(request.getCateId())).thenReturn(Optional.of(mock(Category.class)));
                when(pubRepo.findById(request.getPubId())).thenReturn(Optional.of(mock(Publisher.class)));
                when(shopRepo.findById(request.getShopId())).thenReturn(Optional.of(shop));
                when(imageService.upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER)))
                                .thenReturn(image);
                when(imageService.uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER)))
                                .thenReturn(List.of(image));
                when(bookRepo.save(any(Book.class))).thenReturn(mock(Book.class));
                when(detailRepo.save(any(BookDetail.class))).thenReturn(mock(BookDetail.class));
                when(bookMapper.bookToResponseDTO(any(Book.class))).thenReturn(expected);

                // Then
                BookResponseDTO result = bookService.addBook(request, file, images, account);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(cateRepo, times(1)).findById(request.getCateId());
                verify(pubRepo, times(1)).findById(request.getPubId());
                verify(shopRepo, times(1)).findById(request.getShopId());
                verify(imageService, times(1)).upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(imageService, times(1)).uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(bookRepo, times(1)).save(any(Book.class));
                verify(detailRepo, times(1)).save(any(BookDetail.class));
                verify(bookMapper, times(1)).bookToResponseDTO(any(Book.class));
        }

        @Test
        public void givenNewBookWithInvalidCategory_WhenAddBook_ThenThrowsException() {

                // When
                when(cateRepo.findById(request.getCateId())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bookService.addBook(request, file, new MultipartFile[0], account));
                assertEquals("Category not found!", exception.getError());

                // Verify
                verify(cateRepo, times(1)).findById(request.getCateId());
                verify(pubRepo, never()).findById(request.getPubId());
                verify(shopRepo, never()).findById(request.getShopId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(imageService, never()).uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(bookRepo, never()).save(any(Book.class));
                verify(detailRepo, never()).save(any(BookDetail.class));
                verify(bookMapper, never()).bookToResponseDTO(any(Book.class));
        }

        @Test
        public void givenNewBookWithInvalidPublisher_WhenAddBook_ThenThrowsException() {

                // When
                when(cateRepo.findById(request.getCateId())).thenReturn(Optional.of(mock(Category.class)));
                when(pubRepo.findById(request.getPubId())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bookService.addBook(request, file, new MultipartFile[0], account));
                assertEquals("Publisher not found!", exception.getError());

                // Verify
                verify(cateRepo, times(1)).findById(request.getCateId());
                verify(pubRepo, times(1)).findById(request.getPubId());
                verify(shopRepo, never()).findById(request.getShopId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(imageService, never()).uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(bookRepo, never()).save(any(Book.class));
                verify(detailRepo, never()).save(any(BookDetail.class));
                verify(bookMapper, never()).bookToResponseDTO(any(Book.class));
        }

        @Test
        public void givenNewBookWithInvalidShop_WhenAddBook_ThenThrowsException() {

                // When
                when(shopRepo.findById(request.getShopId())).thenReturn(Optional.empty());

                // When
                when(cateRepo.findById(request.getCateId())).thenReturn(Optional.of(mock(Category.class)));
                when(pubRepo.findById(request.getPubId())).thenReturn(Optional.of(mock(Publisher.class)));
                when(shopRepo.findById(request.getShopId())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bookService.addBook(request, file, new MultipartFile[0], account));
                assertEquals("Shop not found!", exception.getError());

                // Verify
                verify(cateRepo, times(1)).findById(request.getCateId());
                verify(pubRepo, times(1)).findById(request.getPubId());
                verify(shopRepo, times(1)).findById(request.getShopId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(imageService, never()).uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(bookRepo, never()).save(any(Book.class));
                verify(detailRepo, never()).save(any(BookDetail.class));
                verify(bookMapper, never()).bookToResponseDTO(any(Book.class));
        }

        @Test
        public void givenNewBookForSomeoneElseShop_WhenAddBook_ThenThrowsException() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                when(cateRepo.findById(request.getCateId())).thenReturn(Optional.of(mock(Category.class)));
                when(pubRepo.findById(request.getPubId())).thenReturn(Optional.of(mock(Publisher.class)));
                when(shopRepo.findById(request.getShopId())).thenReturn(Optional.of(shop));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> bookService.addBook(request, file, new MultipartFile[0], altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(cateRepo, times(1)).findById(request.getCateId());
                verify(pubRepo, times(1)).findById(request.getPubId());
                verify(shopRepo, times(1)).findById(request.getShopId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(imageService, never()).uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(bookRepo, never()).save(any(Book.class));
                verify(detailRepo, never()).save(any(BookDetail.class));
                verify(bookMapper, never()).bookToResponseDTO(any(Book.class));
        }

        @Test
        public void whenUpdateBook_ThenReturnsUpdatedBookResponseDTO() {

                // Given
                setupSecurityContext(account);
                Long id = 1L;
                String slug = "test-string";
                MultipartFile[] images = { file };
                List<String> publicIds = List.of("1", "2");
                BookDetail detail = BookDetail.builder().id(1L).previewImages(new ArrayList<>()).build();
                Book book = Book.builder().id(1L).image(image).detail(detail).build();
                BookResponseDTO expected = BookResponseDTO.builder()
                                .title(request.getTitle())
                                .price(request.getPrice())
                                .discount(request.getDiscount())
                                .slug(slug)
                                .build();

                // When
                when(bookRepo.findById(id)).thenReturn(Optional.of(book));
                when(cateRepo.findById(request.getCateId())).thenReturn(Optional.of(mock(Category.class)));
                when(pubRepo.findById(request.getPubId())).thenReturn(Optional.of(mock(Publisher.class)));
                when(imageService.upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER)))
                                .thenReturn(image);
                when(imageService.uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER)))
                                .thenReturn(List.of(image));
                when(detailRepo.save(any(BookDetail.class))).thenReturn(mock(BookDetail.class));
                when(bookRepo.save(any(Book.class))).thenReturn(mock(Book.class));
//                when(imageRepo.findBookImagePublicIds(id, request.getRemoveIds())).thenReturn(publicIds);
                when(bookMapper.bookToResponseDTO(any(Book.class))).thenReturn(expected);

                // Then
                BookResponseDTO result = bookService.updateBook(id, request, file, images, account);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(bookRepo, times(1)).findById(id);
                verify(cateRepo, times(1)).findById(request.getCateId());
                verify(pubRepo, times(1)).findById(request.getPubId());
                verify(imageService, times(1)).upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(imageService, times(1)).uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(detailRepo, times(1)).save(any(BookDetail.class));
                verify(bookRepo, times(1)).save(any(Book.class));
//                verify(imageRepo, times(1)).findBookImagePublicIds(id, request.getRemoveIds());
                verify(bookMapper, times(1)).bookToResponseDTO(any(Book.class));
        }

        @Test
        public void whenUpdateNonExistingBook_ThenThrowsException() {

                // Given
                Long id = 1L;
                List<String> publicIds = List.of("1", "2");

                // When
                when(bookRepo.findById(id)).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bookService.updateBook(id, request, null, null, account));
                assertEquals("Product not found!", exception.getError());

                // Verify
                verify(bookRepo, times(1)).findById(id);
                verify(cateRepo, never()).findById(request.getCateId());
                verify(pubRepo, never()).findById(request.getPubId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(imageService, never()).uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(detailRepo, never()).save(any(BookDetail.class));
                verify(bookRepo, never()).save(any(Book.class));
//                verify(imageRepo, never()).findBookImagePublicIds(id, request.getRemoveIds());
//                verify(imageService, never()).deleteImages(publicIds);
                verify(bookMapper, never()).bookToResponseDTO(any(Book.class));
        }

        @Test
        public void whenUpdateBookToInvalidCategory_ThenThrowsException() {

                // Given
                Long id = 1L;
                List<String> publicIds = List.of("1", "2");

                // When
                when(bookRepo.findById(id)).thenReturn(Optional.of(mock(Book.class)));
                when(cateRepo.findById(request.getCateId())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bookService.updateBook(id, request, null, null, account));
                assertEquals("Category not found!", exception.getError());

                // Verify
                verify(bookRepo, times(1)).findById(id);
                verify(cateRepo, times(1)).findById(request.getCateId());
                verify(pubRepo, never()).findById(request.getPubId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(imageService, never()).uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(detailRepo, never()).save(any(BookDetail.class));
                verify(bookRepo, never()).save(any(Book.class));
//                verify(imageRepo, never()).findBookImagePublicIds(id, request.getRemoveIds());
//                verify(imageService, never()).deleteImages(publicIds);
                verify(bookMapper, never()).bookToResponseDTO(any(Book.class));
        }

        @Test
        public void whenUpdateBookToInvalidPublisher_ThenThrowsException() {

                // Given
                Long id = 1L;
                List<String> publicIds = List.of("1", "2");

                // When
                when(bookRepo.findById(id)).thenReturn(Optional.of(mock(Book.class)));
                when(cateRepo.findById(request.getCateId())).thenReturn(Optional.of(mock(Category.class)));
                when(pubRepo.findById(request.getPubId())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bookService.updateBook(id, request, null, null, account));
                assertEquals("Publisher not found!", exception.getError());

                // Verify
                verify(bookRepo, times(1)).findById(id);
                verify(cateRepo, times(1)).findById(request.getCateId());
                verify(pubRepo, times(1)).findById(request.getPubId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(imageService, never()).uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(detailRepo, never()).save(any(BookDetail.class));
                verify(bookRepo, never()).save(any(Book.class));
//                verify(imageRepo, never()).findBookImagePublicIds(id, request.getRemoveIds());
//                verify(imageService, never()).deleteImages(publicIds);
                verify(bookMapper, never()).bookToResponseDTO(any(Book.class));
        }

        @Test
        public void whenUpdateBookToNonExistingImage_ThenThrowsException() {

                // Given
                setupSecurityContext(account);
                Long id = 1L;
                MultipartFile[] images = { file };
                List<String> publicIds = List.of("1", "2");
                BookDetail detail = BookDetail.builder().id(1L).previewImages(new ArrayList<>()).build();
                Book book = Book.builder().id(1L).image(image).detail(detail).build();

                // When
                when(bookRepo.findById(id)).thenReturn(Optional.of(book));
                when(cateRepo.findById(request.getCateId())).thenReturn(Optional.of(mock(Category.class)));
                when(pubRepo.findById(request.getPubId())).thenReturn(Optional.of(mock(Publisher.class)));
                when(imageRepo.findBookImage(id, request.getThumbnailId())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bookService.updateBook(id, request, null, images, account));
                assertEquals("Image not found!", exception.getError());

                // Verify
                verify(bookRepo, times(1)).findById(id);
                verify(cateRepo, times(1)).findById(request.getCateId());
                verify(pubRepo, times(1)).findById(request.getPubId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(imageRepo, times(1)).findBookImage(id, request.getThumbnailId());
                verify(imageService, never()).uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(detailRepo, never()).save(any(BookDetail.class));
                verify(bookRepo, never()).save(any(Book.class));
//                verify(imageRepo, never()).findBookImagePublicIds(id, request.getRemoveIds());
//                verify(imageService, never()).deleteImages(publicIds);
                verify(bookMapper, never()).bookToResponseDTO(any(Book.class));
        }

        @Test
        public void whenUpdateSomeoneElseBook_ThenThrowsException() {

                // Given
                Long id = 1L;
                MultipartFile[] images = { file };
                List<String> publicIds = List.of("1", "2");
                BookDetail detail = BookDetail.builder().id(1L).previewImages(new ArrayList<>()).build();
                Book book = Book.builder().id(1L).image(image).shop(shop).detail(detail).build();
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                when(bookRepo.findById(id)).thenReturn(Optional.of(book));
                when(cateRepo.findById(request.getCateId())).thenReturn(Optional.of(mock(Category.class)));
                when(pubRepo.findById(request.getPubId())).thenReturn(Optional.of(mock(Publisher.class)));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> bookService.updateBook(id, request, null, images, altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(bookRepo, times(1)).findById(id);
                verify(cateRepo, times(1)).findById(request.getCateId());
                verify(pubRepo, times(1)).findById(request.getPubId());
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(imageRepo, never()).findBookImage(id, request.getThumbnailId());
                verify(imageService, never()).uploadMultiple(eq(List.of(file)), eq(FileUploadUtil.PRODUCT_FOLDER));
                verify(detailRepo, never()).save(any(BookDetail.class));
                verify(bookRepo, never()).save(any(Book.class));
//                verify(imageRepo, never()).findBookImagePublicIds(id, request.getRemoveIds());
//                verify(imageService, never()).deleteImages(publicIds);
                verify(bookMapper, never()).bookToResponseDTO(any(Book.class));
        }

        @Test
        public void whenDeleteBook_ThenReturnsDeletedBookResponseDTO() {

                // Given
                setupSecurityContext(account);
                Long id = 1L;
                Book book = Book.builder().id(id).shop(shop).build();
                BookResponseDTO expected = BookResponseDTO.builder()
                                .title(request.getTitle())
                                .price(request.getPrice())
                                .discount(request.getDiscount())
                                .build();

                // When
                when(bookRepo.findById(id)).thenReturn(Optional.of(book));
                when(bookMapper.bookToResponseDTO(any(Book.class))).thenReturn(expected);
                doNothing().when(bookRepo).deleteById(id);

                // Then
                BookResponseDTO result = bookService.deleteBook(id, account);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(bookRepo, times(1)).findById(id);
                verify(bookMapper, times(1)).bookToResponseDTO(any(Book.class));
                verify(bookRepo, times(1)).deleteById(id);
        }

        @Test
        public void whenDeleteBookNonExistingBook_ThenThrowsException() {

                // Given
                Long id = 1L;

                // When
                when(bookRepo.findById(id)).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> bookService.deleteBook(id, account));
                assertEquals("Product not found!", exception.getError());

                // Verify
                verify(bookRepo, times(1)).findById(id);
                verify(bookMapper, never()).bookToResponseDTO(any(Book.class));
                verify(bookRepo, never()).deleteById(id);
        }

        @Test
        public void whenDeleteSomeoneElseBook_ThenThrowsException() {

                // Given
                Long id = 1L;
                Book book = Book.builder().id(id).shop(shop).build();
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                when(bookRepo.findById(id)).thenReturn(Optional.of(book));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> bookService.deleteBook(id, altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(bookRepo, times(1)).findById(id);
                verify(bookMapper, never()).bookToResponseDTO(any(Book.class));
                verify(bookRepo, never()).deleteById(id);
        }

        @Test
        public void whenDeleteBooks_ThenSuccess() {

                // Given
                setupSecurityContext(account);
                List<Long> ids = List.of(1L, 2L, 3L);

                // When
                doNothing().when(bookRepo).deleteAllById(ids);

                // Then
                bookService.deleteBooks(ids, account);

                // Verify
                verify(bookRepo, times(1)).deleteAllById(ids);
        }

        @Test
        public void whenDeleteBooksInverse_ThenSuccess() {

                // Given
                List<Long> ids = List.of(1L, 2L, 3L);
                List<Long> inverseIds = List.of(4L);

                // When
                when(bookRepo.findInverseIds(eq(""),
                                isNull(),
                                isNull(),
                                isNull(),
                                isNull(),
                                eq(account.getId()),
                                eq(0.0),
                                eq(1000000.0),
                                eq(0),
                                eq(0),
                                eq(ids))).thenReturn(inverseIds);
                doNothing().when(bookRepo).deleteAllById(inverseIds);

                // Then
                bookService.deleteBooksInverse("",
                                0,
                                0,
                                null,
                                null,
                                null,
                                null,
                                null,
                                0.0,
                                1000000.0,
                                ids,
                                account);

                // Verify
                verify(bookRepo, times(1)).findInverseIds(eq(""),
                                isNull(),
                                isNull(),
                                isNull(),
                                isNull(),
                                eq(account.getId()),
                                eq(0.0),
                                eq(1000000.0),
                                eq(0),
                                eq(0),
                                eq(ids));
                verify(bookRepo, times(1)).deleteAllById(inverseIds);
        }

        @Test
        public void whenDeleteAllBooks_ThenSuccess() {

                // Given
                setupSecurityContext(account);

                // When
                doNothing().when(bookRepo).deleteAll();

                // Then
                bookService.deleteAllBooks(null, account);

                // Verify
                verify(bookRepo, times(1)).deleteAll();
        }

        @Test
        public void whenDeleteAllShopBooks_ThenSuccess() {

                // Given
                setupSecurityContext(account);
                Long id = 1L;

                // When
                doNothing().when(bookRepo).deleteAllByShopId(id);

                // Then
                bookService.deleteAllBooks(id, account);

                // Verify
                verify(bookRepo, times(1)).deleteAllByShopId(id);
        }

        @Test
        public void whenDeleteAllSellerBooks_ThenSuccess() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                doNothing().when(bookRepo).deleteAllByShop_Owner(altAccount);

                // Then
                bookService.deleteAllBooks(null, altAccount);

                // Verify
                verify(bookRepo, times(1)).deleteAllByShop_Owner(altAccount);
        }

        @Test
        public void whenDeleteAllSellerShopBooks_ThenSuccess() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);
                Long id = 1L;

                // When
                doNothing().when(bookRepo).deleteAllByShopIdAndShop_Owner(id, altAccount);

                // Then
                bookService.deleteAllBooks(id, altAccount);

                // Verify
                verify(bookRepo, times(1)).deleteAllByShopIdAndShop_Owner(id, altAccount);
        }
}
