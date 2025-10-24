package com.ring.service;

import com.ring.base.AbstractServiceTest;
import com.ring.dto.projection.reviews.IReview;
import com.ring.dto.request.ReviewRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.reviews.ReviewDTO;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.ReviewMapper;
import com.ring.model.entity.Account;
import com.ring.model.entity.Book;
import com.ring.model.entity.Review;
import com.ring.model.entity.Role;
import com.ring.model.enums.UserRole;
import com.ring.repository.BookRepository;
import com.ring.repository.OrderReceiptRepository;
import com.ring.repository.ReviewRepository;
import com.ring.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class ReviewServiceTest extends AbstractServiceTest {

        @Mock
        private ReviewRepository reviewRepo;

        @Mock
        private BookRepository bookRepo;

        @Mock
        private OrderReceiptRepository orderRepo;

        @Mock
        private ReviewMapper reviewMapper;

        @InjectMocks
        private ReviewServiceImpl reviewService;

        private final Role role = Role.builder()
                        .roleName(UserRole.ROLE_ADMIN)
                        .build();
        private Account account = Account.builder()
                        .id(1L)
                        .roles(List.of(role))
                        .build();
        private final Book book = Book.builder()
                        .id(1L)
                        .title("Test Book")
                        .build();
        private final Review review = Review.builder()
                        .id(1L)
                        .book(book)
                        .user(account)
                        .rating(5)
                        .rContent("Great book!")
                        .build();
        private final ReviewRequest request = ReviewRequest.builder()
                        .rating(5)
                        .content("Great book!")
                        .build();

        @AfterEach
        public void cleanUp() {
                account = Account.builder().id(1L).roles(List.of(role)).build();
                SecurityContextHolder.clearContext();
        }

        @Test
        public void whenReview_ThenReturnsNewReview() {

                // When
                when(bookRepo.findById(anyLong())).thenReturn(Optional.of(book));
                when(orderRepo.hasUserBoughtBook(anyLong(), anyLong())).thenReturn(true);
                when(reviewRepo.findUserBookReview(anyLong(), anyLong())).thenReturn(Optional.empty());
                when(reviewRepo.save(any(Review.class))).thenReturn(review);

                // Then
                Review result = reviewService.review(1L, request, account);

                assertNotNull(result);
                assertEquals(review, result);

                // Verify
                verify(bookRepo, times(1)).findById(anyLong());
                verify(orderRepo, times(1)).hasUserBoughtBook(anyLong(), anyLong());
                verify(reviewRepo, times(1)).findUserBookReview(anyLong(), anyLong());
                verify(reviewRepo, times(1)).save(any(Review.class));
        }

        @Test
        public void whenReviewNonExistingBook_ThenThrowsException() {

                // When
                when(bookRepo.findById(anyLong())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> reviewService.review(1L, request, account));
                assertEquals("Product not found!", exception.getError());

                // Verify
                verify(bookRepo, times(1)).findById(anyLong());
                verify(orderRepo, never()).hasUserBoughtBook(anyLong(), anyLong());
                verify(reviewRepo, never()).findUserBookReview(anyLong(), anyLong());
                verify(reviewRepo, never()).save(any(Review.class));
        }

        @Test
        public void whenReviewNotBoughtBook_ThenThrowsException() {

                // When
                when(bookRepo.findById(anyLong())).thenReturn(Optional.of(book));
                when(orderRepo.hasUserBoughtBook(anyLong(), anyLong())).thenReturn(false);

                // Then
                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> reviewService.review(1L, request, account));
                assertEquals("User have not bought the product!", exception.getError());
                assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());

                // Verify
                verify(bookRepo, times(1)).findById(anyLong());
                verify(orderRepo, times(1)).hasUserBoughtBook(anyLong(), anyLong());
                verify(reviewRepo, never()).findUserBookReview(anyLong(), anyLong());
                verify(reviewRepo, never()).save(any(Review.class));
        }

        @Test
        public void whenReviewAlreadyReviewed_ThenThrowsException() {

                // When
                when(bookRepo.findById(anyLong())).thenReturn(Optional.of(book));
                when(orderRepo.hasUserBoughtBook(anyLong(), anyLong())).thenReturn(true);
                when(reviewRepo.findUserBookReview(anyLong(), anyLong())).thenReturn(Optional.of(mock(IReview.class)));

                // Then
                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> reviewService.review(1L, request, account));
                assertEquals("User have already reviewed this product!", exception.getError());
                assertEquals(HttpStatus.CONFLICT, exception.getStatus());

                // Verify
                verify(bookRepo, times(1)).findById(anyLong());
                verify(orderRepo, times(1)).hasUserBoughtBook(anyLong(), anyLong());
                verify(reviewRepo, times(1)).findUserBookReview(anyLong(), anyLong());
                verify(reviewRepo, never()).save(any(Review.class));
        }

        @Test
        public void whenGetReviews_ThenReturnsPagedReviews() {
                // Given
                Pageable pageable = PageRequest.of(0, 1, Sort.by("id").descending());
                Page<IReview> reviews = new PageImpl<>(
                                List.of(mock(IReview.class)),
                                pageable,
                                2);
                ReviewDTO mapped = new ReviewDTO(1L, "Test Review", 5, LocalDateTime.now(), LocalDateTime.now(), 1L,
                                "Test User", null, 1L, "Test Book", "test-book");
                PagingResponse<ReviewDTO> expectedResponse = new PagingResponse<>(
                                List.of(mapped),
                                2,
                                2L,
                                1,
                                0,
                                false);

                // When
                when(reviewRepo.findReviews(any(), any(), any(), any(), any())).thenReturn(reviews);
                when(reviewMapper.projectionToDTO(any(IReview.class))).thenReturn(mapped);

                // Then
                PagingResponse<ReviewDTO> result = reviewService.getReviews(null, null, null, null, 0, 1, "id", "desc");

                assertNotNull(result);
                assertEquals(expectedResponse.getContent().size(), result.getContent().size());
                assertEquals(expectedResponse.getTotalPages(), result.getTotalPages());
                assertEquals(expectedResponse.getTotalElements(), result.getTotalElements());
                assertEquals(expectedResponse.getSize(), result.getSize());
                assertEquals(expectedResponse.getPage(), result.getPage());
                assertEquals(expectedResponse.isEmpty(), result.isEmpty());

                // Verify
                verify(reviewRepo, times(1)).findReviews(any(), any(), any(), any(), any());
                verify(reviewMapper, times(1)).projectionToDTO(any(IReview.class));
        }

        @Test
        public void whenGetReviewsByBookId_ThenReturnsPagedReviews() {
                // Given
                Pageable pageable = PageRequest.of(0, 1, Sort.by("id").descending());
                Page<IReview> reviews = new PageImpl<>(
                                List.of(mock(IReview.class)),
                                pageable,
                                2);
                ReviewDTO mapped = new ReviewDTO(1L, "Test Review", 5, LocalDateTime.now(), LocalDateTime.now(), 1L,
                                "Test User", null, 1L, "Test Book", "test-book");
                PagingResponse<ReviewDTO> expectedResponse = new PagingResponse<>(
                                List.of(mapped),
                                2,
                                2L,
                                1,
                                0,
                                false);

                // When
                when(reviewRepo.findReviewsByBookId(any(), any(), any())).thenReturn(reviews);
                when(reviewMapper.projectionToDTO(any(IReview.class))).thenReturn(mapped);

                // Then
                PagingResponse<ReviewDTO> result = reviewService.getReviewsByBookId(1L, null, 0, 1, "id", "desc");

                assertNotNull(result);
                assertEquals(expectedResponse.getContent().size(), result.getContent().size());
                assertEquals(expectedResponse.getTotalPages(), result.getTotalPages());
                assertEquals(expectedResponse.getTotalElements(), result.getTotalElements());
                assertEquals(expectedResponse.getSize(), result.getSize());
                assertEquals(expectedResponse.getPage(), result.getPage());
                assertEquals(expectedResponse.isEmpty(), result.isEmpty());

                // Verify
                verify(reviewRepo, times(1)).findReviewsByBookId(any(), any(), any());
                verify(reviewMapper, times(1)).projectionToDTO(any(IReview.class));
        }

        @Test
        public void whenGetUserReviews_ThenReturnsPagedReviews() {
                // Given
                Pageable pageable = PageRequest.of(0, 1, Sort.by("id").descending());
                Page<IReview> reviews = new PageImpl<>(
                                List.of(mock(IReview.class)),
                                pageable,
                                2);
                ReviewDTO mapped = new ReviewDTO(1L, "Test Review", 5, LocalDateTime.now(), LocalDateTime.now(), 1L,
                                "Test User", null, 1L, "Test Book", "test-book");
                PagingResponse<ReviewDTO> expectedResponse = new PagingResponse<>(
                                List.of(mapped),
                                2,
                                2L,
                                1,
                                0,
                                false);

                // When
                when(reviewRepo.findUserReviews(any(), any(), any())).thenReturn(reviews);
                when(reviewMapper.projectionToDTO(any(IReview.class))).thenReturn(mapped);

                // Then
                PagingResponse<ReviewDTO> result = reviewService.getUserReviews(account, null, 0, 1, "id", "desc");

                assertNotNull(result);
                assertEquals(expectedResponse.getContent().size(), result.getContent().size());
                assertEquals(expectedResponse.getTotalPages(), result.getTotalPages());
                assertEquals(expectedResponse.getTotalElements(), result.getTotalElements());
                assertEquals(expectedResponse.getSize(), result.getSize());
                assertEquals(expectedResponse.getPage(), result.getPage());
                assertEquals(expectedResponse.isEmpty(), result.isEmpty());

                // Verify
                verify(reviewRepo, times(1)).findUserReviews(any(), any(), any());
                verify(reviewMapper, times(1)).projectionToDTO(any(IReview.class));
        }

        @Test
        public void whenGetReviewByBook_ThenReturnsDTO() {

                // Given
                IReview projection = mock(IReview.class);
                ReviewDTO expected = mock(ReviewDTO.class);

                // When
                when(orderRepo.hasUserBoughtBook(anyLong(), anyLong())).thenReturn(true);
                when(reviewRepo.findUserBookReview(anyLong(), anyLong())).thenReturn(Optional.of(projection));
                when(reviewMapper.projectionToDTO(projection)).thenReturn(expected);

                // Then
                ReviewDTO result = reviewService.getReviewByBook(1L, account);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(orderRepo, times(1)).hasUserBoughtBook(anyLong(), anyLong());
                verify(reviewRepo, times(1)).findUserBookReview(anyLong(), anyLong());
                verify(reviewMapper, times(1)).projectionToDTO(projection);
        }

        @Test
        public void whenGetReviewByBookNotBought_ThenThrowsException() {

                // When
                when(orderRepo.hasUserBoughtBook(anyLong(), anyLong())).thenReturn(false);

                // Then
                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> reviewService.getReviewByBook(1L, account));
                assertEquals("User have not bought the product!", exception.getError());
                assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());

                // Verify
                verify(orderRepo, times(1)).hasUserBoughtBook(anyLong(), anyLong());
                verify(reviewRepo, never()).findUserBookReview(anyLong(), anyLong());
                verify(reviewMapper, never()).projectionToDTO(any(IReview.class));
        }

        @Test
        public void whenGetReviewByBookNotReviewed_ThenThrowsException() {

                // When
                when(orderRepo.hasUserBoughtBook(anyLong(), anyLong())).thenReturn(true);
                when(reviewRepo.findUserBookReview(anyLong(), anyLong())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> reviewService.getReviewByBook(1L, account));
                assertEquals("Review not found!", exception.getError());

                // Verify
                verify(orderRepo, times(1)).hasUserBoughtBook(anyLong(), anyLong());
                verify(reviewRepo, times(1)).findUserBookReview(anyLong(), anyLong());
                verify(reviewMapper, never()).projectionToDTO(any(IReview.class));
        }

        @Test
        public void whenUpdateReview_ThenReturnsDTO() {

                // Given
                ReviewDTO expected = mock(ReviewDTO.class);

                // When
                when(reviewRepo.findById(anyLong())).thenReturn(Optional.of(review));
                when(reviewRepo.save(any(Review.class))).thenReturn(review);
                when(reviewMapper.reviewToDTO(any(Review.class))).thenReturn(expected);

                // Then
                ReviewDTO result = reviewService.updateReview(1L, request, account);

                assertNotNull(result);
                assertEquals(expected, result);

                // Verify
                verify(reviewRepo, times(1)).findById(anyLong());
                verify(reviewRepo, times(1)).save(any(Review.class));
                verify(reviewMapper, times(1)).reviewToDTO(any(Review.class));
        }

        @Test
        public void whenUpdateNonExistingReview_ThenThrowsException() {

                // When
                when(reviewRepo.findById(anyLong())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> reviewService.updateReview(1L, request, account));
                assertEquals("Review not found!", exception.getError());

                // Verify
                verify(reviewRepo, times(1)).findById(anyLong());
                verify(reviewRepo, never()).save(any(Review.class));
                verify(reviewMapper, never()).reviewToDTO(any(Review.class));
        }

        @Test
        public void whenUpdateSomeoneElseReview_ThenThrowsException() {

                // Given
                Account altAccount = Account.builder()
                                .id(2L)
                                .roles(List.of(Role.builder().roleName(UserRole.ROLE_SELLER).build()))
                                .build();
                setupSecurityContext(altAccount);

                // When
                when(reviewRepo.findById(anyLong())).thenReturn(Optional.of(review));

                // Then
                EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                                () -> reviewService.updateReview(1L, request, altAccount));
                assertEquals("Invalid ownership!", exception.getError());

                // Verify
                verify(reviewRepo, times(1)).findById(anyLong());
                verify(reviewRepo, never()).save(any(Review.class));
                verify(reviewMapper, never()).reviewToDTO(any(Review.class));
        }

        @Test
        public void whenDeleteReview_ThenSuccess() {

                // When
                doNothing().when(reviewRepo).deleteById(anyLong());

                // Then
                reviewService.deleteReview(1L);

                // Verify
                verify(reviewRepo, times(1)).deleteById(anyLong());
        }

        @Test
        public void whenDeleteReviews_ThenSuccess() {

                // Given
                List<Long> ids = List.of(1L, 2L);

                // When
                doNothing().when(reviewRepo).deleteAllById(anyList());

                // Then
                reviewService.deleteReviews(ids);

                // Verify
                verify(reviewRepo, times(1)).deleteAllById(ids);
        }

        @Test
        public void whenDeleteReviewsInverse_ThenSuccess() {

                // Given
                List<Long> ids = List.of(1L, 2L);
                List<Long> inverseIds = List.of(3L);

                // When
                when(reviewRepo.findInverseIds(anyLong(), anyLong(), anyInt(), anyString(), anyList()))
                                .thenReturn(inverseIds);
                doNothing().when(reviewRepo).deleteAllById(inverseIds);

                // Then
                reviewService.deleteReviewsInverse(1L, 1L, 5, "", ids);

                // Verify
                verify(reviewRepo, times(1)).findInverseIds(anyLong(), anyLong(), anyInt(), anyString(), anyList());
                verify(reviewRepo, times(1)).deleteAllById(inverseIds);
        }

        @Test
        public void whenDeleteAllReviews_ThenSuccess() {

                // When
                doNothing().when(reviewRepo).deleteAll();

                // Then
                reviewService.deleteAllReviews();

                // Verify
                verify(reviewRepo, times(1)).deleteAll();
        }

        @Test
        public void whenHideReview_ThenSuccess() {

                // When
                when(reviewRepo.findById(anyLong())).thenReturn(Optional.of(review));
                when(reviewRepo.save(any(Review.class))).thenReturn(review);

                // Then
                reviewService.setReviewVisibility(1L, true);

                // Verify
                verify(reviewRepo, times(1)).findById(anyLong());
                verify(reviewRepo, times(1)).save(any(Review.class));
        }

        @Test
        public void whenHideNonExistingReview_ThenThrowsException() {

                // When
                when(reviewRepo.findById(anyLong())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> reviewService.setReviewVisibility(1L, true));
                assertEquals("Review not found!", exception.getError());

                // Verify
                verify(reviewRepo, times(1)).findById(anyLong());
                verify(reviewRepo, never()).save(any(Review.class));
        }

        @Test
        public void whenUnhideReview_ThenSuccess() {

                // When
                when(reviewRepo.findById(anyLong())).thenReturn(Optional.of(review));
                when(reviewRepo.save(any(Review.class))).thenReturn(review);

                // Then
                reviewService.setReviewVisibility(1L, false);

                // Verify
                verify(reviewRepo, times(1)).findById(anyLong());
                verify(reviewRepo, times(1)).save(any(Review.class));
        }

        @Test
        public void whenUnhideNonExistingReview_ThenThrowsException() {

                when(reviewRepo.findById(anyLong())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> reviewService.setReviewVisibility(1L, false));
                assertEquals("Review not found!", exception.getError());

                // Verify
                verify(reviewRepo, times(1)).findById(anyLong());
                verify(reviewRepo, never()).save(any(Review.class));
        }
}