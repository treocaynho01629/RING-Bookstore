package com.ring.service;

import com.ring.dto.request.ReviewRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.reviews.ReviewDTO;
import com.ring.model.entity.Account;
import com.ring.model.entity.Review;

import java.util.List;

/**
 * Service interface for handling review-related operations.
 */
public interface ReviewService {

    /**
     * Retrieves reviews with pagination and filtering options.
     *
     * @param bookId   the book ID to filter reviews by
     * @param userId   the user ID to filter reviews by
     * @param rating   the rating to filter reviews by
     * @param keyword  the search keyword to filter reviews
     * @param pageNo   the page number for pagination
     * @param pageSize the size of each page
     * @param sortBy   the field to sort by
     * @param sortDir  the sorting direction (asc/desc)
     * @return a paginated list of {@link ReviewDTO} objects
     */
    PagingResponse<ReviewDTO> getReviews(Long bookId,
            Long userId,
            Integer rating,
            String keyword,
            Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir);

    /**
     * Retrieves reviews by user with pagination and filtering options.
     *
     * @param user     the authenticated user
     * @param rating   the rating to filter reviews by
     * @param pageNo   the page number for pagination
     * @param pageSize the size of each page
     * @param sortBy   the field to sort by
     * @param sortDir  the sorting direction (asc/desc)
     * @return a paginated list of {@link ReviewDTO} objects
     */
    PagingResponse<ReviewDTO> getUserReviews(Account user,
            Integer rating,
            Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir);

    /**
     * Retrieves reviews by book ID with pagination and filtering options.
     *
     * @param bookId   the book ID to filter reviews by
     * @param rating   the rating to filter reviews by
     * @param pageNo   the page number for pagination
     * @param pageSize the size of each page
     * @param sortBy   the field to sort by
     * @param sortDir  the sorting direction (asc/desc)
     * @return a paginated list of {@link ReviewDTO} objects
     */
    PagingResponse<ReviewDTO> getReviewsByBookId(Long bookId,
            Integer rating,
            Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir);

    /**
     * Retrieves a review by book ID for a specific user.
     *
     * @param id   the book ID
     * @param user the authenticated user
     * @return the {@link ReviewDTO} object
     */
    ReviewDTO getReviewByBook(Long id,
            Account user);

    /**
     * Creates or updates a review for a book.
     *
     * @param id      the book ID
     * @param request the review request details
     * @param user    the authenticated user
     * @return the {@link Review} entity
     */
    Review review(Long id,
            ReviewRequest request,
            Account user);

    /**
     * Updates an existing review by its ID.
     *
     * @param id      the ID of the review to update
     * @param request the review update details
     * @param user    the authenticated user
     * @return the updated {@link ReviewDTO} object
     */
    ReviewDTO updateReview(Long id,
            ReviewRequest request,
            Account user);

    /**
     * Deletes a review by its ID.
     *
     * @param id the ID of the review to delete
     */
    void deleteReview(Long id);

    /**
     * Deletes multiple reviews by their IDs.
     *
     * @param ids the list of review IDs to delete
     */
    void deleteReviews(List<Long> ids);

    /**
     * Deletes reviews that are not in the provided list of IDs.
     *
     * @param bookId  the book ID to filter reviews by
     * @param userId  the user ID to filter reviews by
     * @param rating  the rating to filter reviews by
     * @param keyword the search keyword to filter reviews
     * @param ids     the list of review IDs to exclude from deletion
     */
    void deleteReviewsInverse(Long bookId,
            Long userId,
            Integer rating,
            String keyword,
            List<Long> ids);

    /**
     * Deletes all reviews.
     */
    void deleteAllReviews();

    /**
     * Sets the visibility of a review by its ID.
     *
     * @param id the ID of the review to set the visibility
     * @param isHidden the visibility to set
     */
    void setReviewVisibility(Long id, boolean isHidden);

}
