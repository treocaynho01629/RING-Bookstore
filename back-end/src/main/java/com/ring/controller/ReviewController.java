package com.ring.controller;

import com.ring.config.CurrentAccount;
import com.ring.dto.request.ReviewRequest;
import com.ring.dto.response.GenericResponse;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.reviews.ReviewDTO;
import com.ring.model.entity.Account;
import com.ring.model.entity.Review;
import com.ring.service.ReviewService;
import com.ring.service.impl.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller named {@link ReviewController} for handling review-related
 * operations.
 * Exposes endpoints under "/api/reviews".
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final MessageService messageService;

    /**
     * Retrieves all reviews with optional filters and pagination.
     *
     * @param bookId   optional filter by book ID.
     * @param userId   optional filter by user ID.
     * @param rating   optional filter by rating.
     * @param keyword  optional keyword to search in reviews.
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param sortBy   sorting field.
     * @param sortDir  sorting direction.
     * @return a {@link ResponseEntity} containing paginated reviews.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','GUEST') and hasAuthority('read:review')")
    public ResponseEntity<PagingResponse<ReviewDTO>> getReviews(
            @RequestParam(value = "bookId", required = false) Long bookId,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "pSize", defaultValue = "5") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        PagingResponse<ReviewDTO> reviews = reviewService.getReviews(bookId,
                userId,
                rating,
                keyword,
                pageNo,
                pageSize,
                sortBy,
                sortDir);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    /**
     * Retrieves the current user's review for a specific book.
     *
     * @param bookId   the ID of the book.
     * @param currUser the current authenticated user.
     * @return a {@link ResponseEntity} containing the user's review.
     */
    @GetMapping("/book/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('read:review')")
    public ResponseEntity<ReviewDTO> getReviewByBook(
            @PathVariable("id") Long bookId,
            @CurrentAccount Account currUser) {

        ReviewDTO review = reviewService.getReviewByBook(bookId, currUser);
        return new ResponseEntity<>(review, HttpStatus.OK);
    }

    /**
     * Retrieves all reviews for a specific book.
     *
     * @param bookId   the ID of the book.
     * @param rating   optional filter by rating.
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param sortBy   sorting field.
     * @param sortDir  sorting direction.
     * @return a {@link ResponseEntity} containing the book's reviews.
     */
    @GetMapping("/books/{id}")
    public ResponseEntity<PagingResponse<ReviewDTO>> getReviewsByBook(
            @PathVariable("id") Long bookId,
            @RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "pSize", defaultValue = "5") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        PagingResponse<ReviewDTO> reviews = reviewService.getReviewsByBookId(bookId,
                rating,
                pageNo,
                pageSize,
                sortBy,
                sortDir);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    /**
     * Retrieves reviews written by the current user.
     *
     * @param rating   optional filter by rating.
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param sortBy   sorting field.
     * @param sortDir  sorting direction.
     * @param currUser the current authenticated user.
     * @return a {@link ResponseEntity} containing the user's reviews.
     */
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') and hasAuthority('read:review')")
    public ResponseEntity<PagingResponse<ReviewDTO>> getUserReviews(
            @RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "pSize", defaultValue = "5") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @CurrentAccount Account currUser) {

        PagingResponse<ReviewDTO> reviews = reviewService.getUserReviews(currUser,
                rating,
                pageNo,
                pageSize,
                sortBy,
                sortDir);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    /**
     * Creates a review for a specific book.
     *
     * @param bookId   the ID of the book.
     * @param request  the {@link ReviewRequest} data.
     * @param currUser the current authenticated user.
     * @return a {@link ResponseEntity} containing the created review.
     */
    @PostMapping("/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('create:review')")
    public ResponseEntity<Review> reviewBook(
            @PathVariable("id") Long bookId,
            @RequestBody @Valid ReviewRequest request,
            @CurrentAccount Account currUser) {

        Review review = reviewService.review(bookId, request, currUser);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }

    /**
     * Updates a review for a specific book.
     *
     * @param bookId   the ID of the book.
     * @param request  the updated review {@link ReviewRequest} data.
     * @param currUser the current authenticated user.
     * @return a {@link ResponseEntity} containing the updated review.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('update:review')")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable("id") Long bookId,
            @Valid @RequestBody ReviewRequest request,
            @CurrentAccount Account currUser) {

        ReviewDTO review = reviewService.updateReview(bookId, request, currUser);
        return new ResponseEntity<>(review, HttpStatus.OK);
    }

    /**
     * Hides a review by its ID.
     *
     * @param id the ID of the review to hide.
     * @return a {@link ResponseEntity} with a success message.
     */
    @PutMapping("/hide/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('update:review')")
    public ResponseEntity<?> hideReview(@PathVariable("id") Long id) {

        reviewService.setReviewVisibility(id, true);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.update.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Unhides a review by its ID.
     *
     * @param id the ID of the review to unhide.
     * @return a {@link ResponseEntity} with a success message.
     */
    @PutMapping("/unhide/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('update:review')")
    public ResponseEntity<?> unhideReview(@PathVariable("id") Long id) {

        reviewService.setReviewVisibility(id, false);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.update.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    /**
     * Deletes a review by its ID.
     *
     * @param id the ID of the review to delete.
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('delete:review')")
    public ResponseEntity<?> deleteReview(@PathVariable("id") Long id) {

        reviewService.deleteReview(id);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.delete.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes multiple reviews by a list of IDs.
     *
     * @param ids list of review IDs to delete.
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/delete-multiple")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('delete:review')")
    public ResponseEntity<?> deleteReviews(@RequestParam("ids") List<Long> ids) {

        reviewService.deleteReviews(ids);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.delete.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes reviews that are NOT in the given list of IDs.
     *
     * @param bookId  optional filter by book ID.
     * @param userId  optional filter by user ID.
     * @param rating  optional filter by rating.
     * @param keyword optional keyword to search in reviews.
     * @param ids     list of IDs to exclude from deletion.
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/delete-inverse")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('delete:review')")
    public ResponseEntity<?> deleteReviewsInverse(
            @RequestParam(value = "bookId", required = false) Long bookId,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam("ids") List<Long> ids) {

        reviewService.deleteReviewsInverse(bookId, userId, rating, keyword, ids);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.delete.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes all reviews in the system.
     *
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/delete-all")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('delete:review')")
    public ResponseEntity<?> deleteAllReviews() {

        reviewService.deleteAllReviews();
        GenericResponse message = new GenericResponse(messageService.getMessage("message.delete.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
