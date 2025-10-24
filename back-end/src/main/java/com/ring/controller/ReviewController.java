package com.ring.controller;

import com.ring.config.CurrentAccount;
import com.ring.dto.request.ReviewRequest;
import com.ring.model.entity.Account;
import com.ring.service.ReviewService;
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
    public ResponseEntity<?> getReviews(
            @RequestParam(value = "bookId", required = false) Long bookId,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "pSize", defaultValue = "5") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        return new ResponseEntity<>(reviewService.getReviews(bookId,
                userId,
                rating,
                keyword,
                pageNo,
                pageSize,
                sortBy,
                sortDir), HttpStatus.OK);
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
    public ResponseEntity<?> getReviewByBook(@PathVariable("id") Long bookId,
            @CurrentAccount Account currUser) {
        return new ResponseEntity<>(reviewService.getReviewByBook(bookId, currUser), HttpStatus.OK);
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
    public ResponseEntity<?> getReviewsByBook(@PathVariable("id") Long bookId,
            @RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "pSize", defaultValue = "5") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        return new ResponseEntity<>(reviewService.getReviewsByBookId(bookId, rating, pageNo, pageSize, sortBy, sortDir),
                HttpStatus.OK);
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
    public ResponseEntity<?> getUserReviews(@RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "pSize", defaultValue = "5") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @CurrentAccount Account currUser) {
        return new ResponseEntity<>(reviewService.getUserReviews(currUser, rating, pageNo, pageSize, sortBy, sortDir),
                HttpStatus.OK);
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
    public ResponseEntity<?> reviewBook(@PathVariable("id") Long bookId,
            @RequestBody @Valid ReviewRequest request,
            @CurrentAccount Account currUser) {
        return new ResponseEntity<>(reviewService.review(bookId, request, currUser), HttpStatus.CREATED);
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
    public ResponseEntity<?> updateReview(@PathVariable("id") Long bookId,
            @Valid @RequestBody ReviewRequest request,
            @CurrentAccount Account currUser) {
        return new ResponseEntity<>(reviewService.updateReview(bookId, request, currUser), HttpStatus.OK);
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
        return new ResponseEntity<>("Review hid successfully!", HttpStatus.OK);
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
        return new ResponseEntity<>("Review unhid successfully!", HttpStatus.CREATED);
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
        return new ResponseEntity<>("Review deleted successfully!", HttpStatus.OK);
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
        return new ResponseEntity<>("Reviews deleted successfully!", HttpStatus.OK);
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
    public ResponseEntity<?> deleteReviewsInverse(@RequestParam(value = "bookId", required = false) Long bookId,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam("ids") List<Long> ids) {
        reviewService.deleteReviewsInverse(bookId, userId, rating, keyword, ids);
        return new ResponseEntity<>("Reviews deleted successfully!", HttpStatus.OK);
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
        return new ResponseEntity<>("All reviews deleted successfully!", HttpStatus.OK);
    }
}
