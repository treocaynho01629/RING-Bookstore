package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.common.CommonUtils;
import com.ring.dto.projection.reviews.IReview;
import com.ring.dto.request.ReviewRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.reviews.ReviewDTO;
import com.ring.dto.response.reviews.ReviewsInfoDTO;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.ReviewMapper;
import com.ring.model.entity.Account;
import com.ring.model.entity.Book;
import com.ring.model.entity.Review;
import com.ring.repository.BookRepository;
import com.ring.repository.OrderReceiptRepository;
import com.ring.repository.ReviewRepository;
import com.ring.service.ReviewService;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepo;
    private final BookRepository bookRepo;
    private final OrderReceiptRepository orderRepo;

    private final MessageService messageService;

    private final ReviewMapper reviewMapper;

    @CacheEvict(cacheNames = { AppConstants.REVIEWS, AppConstants.REVIEW_ANALYTICS }, allEntries = true)
    @Transactional
    public Review review(Long id,
            ReviewRequest request,
            Account user) {

        // Book validation
        Book book = bookRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.product") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if user had bought it yet
        if (!orderRepo.hasUserBoughtBook(id, user.getId())) {

            var errorMsg = messageService.getMessage("exception.review.invalid");
            throw new HttpResponseException(
                    HttpStatus.FORBIDDEN,
                    AppConstants.REVIEW_INVALID,
                    errorMsg);
        }

        // Check if user had reviewed it yet
        if (reviewRepo.findUserBookReview(id, user.getId()).isPresent()) {

            var errorMsg = messageService.getMessage("exception.review.existed");
            throw new HttpResponseException(
                    HttpStatus.CONFLICT,
                    AppConstants.REVIEW_EXISTED,
                    errorMsg);
        }

        // Create review
        var review = Review.builder()
                .book(book)
                .rating(request.getRating())
                .rContent(request.getContent())
                .user(user)
                .build();

        Review addedReview = reviewRepo.save(review); // Save to database
        return addedReview;
    }

    @Cacheable(cacheNames = AppConstants.REVIEWS)
    public PagingResponse<ReviewDTO> getReviews(Long bookId,
            Long userId,
            Integer rating,
            String keyword,
            Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir) {

        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING)
                        ? Sort.by(sortBy).ascending()
                        : Sort.by(sortBy).descending());
        Page<IReview> reviewsList = reviewRepo.findReviews(bookId,
                userId,
                rating,
                keyword,
                pageable);

        List<ReviewDTO> reviewDTOS = reviewsList.map(reviewMapper::projectionToDTO).toList();
        return new PagingResponse<>(
                reviewDTOS,
                reviewsList.getTotalPages(),
                reviewsList.getTotalElements(),
                reviewsList.getSize(),
                reviewsList.getNumber(),
                reviewsList.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.REVIEWS)
    public PagingResponse<ReviewDTO> getReviewsByBookId(Long id,
            Integer rating,
            Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir) {

        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING)
                        ? Sort.by(sortBy).ascending()
                        : Sort.by(sortBy).descending());
        Page<IReview> reviewsList = reviewRepo.findReviewsByBookId(id, rating, pageable); // Fetch from database
        List<ReviewDTO> reviewDTOS = reviewsList.map(reviewMapper::projectionToDTO).toList();
        return new PagingResponse<>(
                reviewDTOS,
                reviewsList.getTotalPages(),
                reviewsList.getTotalElements(),
                reviewsList.getSize(),
                reviewsList.getNumber(),
                reviewsList.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.REVIEWS)
    public PagingResponse<ReviewDTO> getUserReviews(Account user,
            Integer rating,
            Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir) {

        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING)
                        ? Sort.by(sortBy).ascending() // Pagination
                        : Sort.by(sortBy).descending());
        Page<IReview> reviewsList = reviewRepo.findUserReviews(user.getId(), rating, pageable);

        List<ReviewDTO> reviewDTOS = reviewsList.map(reviewMapper::projectionToDTO).toList();
        return new PagingResponse<>(
                reviewDTOS,
                reviewsList.getTotalPages(),
                reviewsList.getTotalElements(),
                reviewsList.getSize(),
                reviewsList.getNumber(),
                reviewsList.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.REVIEWS)
    public ReviewDTO getReviewByBook(Long id, Account user) {

        if (!orderRepo.hasUserBoughtBook(id, user.getId())) {

            var errorMsg = messageService.getMessage("exception.review.invalid");
            throw new HttpResponseException(
                    HttpStatus.FORBIDDEN,
                    AppConstants.REVIEW_INVALID,
                    errorMsg);
        }
        IReview projection = reviewRepo.findUserBookReview(id, user.getId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.review") });
                    return new ResourceNotFoundException(errorMsg);
                });
        return reviewMapper.projectionToDTO(projection);
    }

    @CacheEvict(cacheNames = { AppConstants.REVIEWS, AppConstants.REVIEW_ANALYTICS }, allEntries = true)
    @Transactional
    public ReviewDTO updateReview(Long id, ReviewRequest request, Account user) {

        // Check review exists
        Review review = reviewRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.review") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Check if correct user or admin
        if (!isValidReviewer(review, user)) {

            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[] { new DefaultMessageSourceResolvable("label.review") });
            throw new EntityOwnershipException(errorMsg);
        }

        // Set new review content
        review.setRating(request.getRating());
        review.setRContent(request.getContent());
        Review updatedReview = reviewRepo.save(review); // Save new review to database
        return reviewMapper.reviewToDTO(updatedReview); // Return added review
    }

    @CacheEvict(cacheNames = { AppConstants.REVIEWS, AppConstants.REVIEW_ANALYTICS }, allEntries = true)
    @Transactional
    public void deleteReview(Long id) {
        reviewRepo.deleteById(id);
    }

    @CacheEvict(cacheNames = { AppConstants.REVIEWS, AppConstants.REVIEW_ANALYTICS }, allEntries = true)
    @Transactional
    public void deleteReviews(List<Long> ids) {
        reviewRepo.deleteAllById(ids);
    }

    @CacheEvict(cacheNames = { AppConstants.REVIEWS, AppConstants.REVIEW_ANALYTICS }, allEntries = true)
    @Transactional
    public void deleteReviewsInverse(Long bookId,
            Long userId,
            Integer rating,
            String keyword,
            List<Long> ids) {

        List<Long> deleteIds = reviewRepo.findInverseIds(
                bookId,
                userId,
                rating,
                keyword,
                ids);
        reviewRepo.deleteAllById(deleteIds);
    }

    @CacheEvict(cacheNames = { AppConstants.REVIEWS, AppConstants.REVIEW_ANALYTICS }, allEntries = true)
    @Transactional
    public void deleteAllReviews() {
        reviewRepo.deleteAll();
    }

    @CacheEvict(cacheNames = { AppConstants.REVIEWS, AppConstants.REVIEW_ANALYTICS }, allEntries = true)
    @Transactional
    public void setReviewVisibility(Long id, boolean isHidden) {

        Review review = reviewRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[] { new DefaultMessageSourceResolvable("label.review") });
                    return new ResourceNotFoundException(errorMsg);
                });
        review.setHidden(isHidden);
        reviewRepo.save(review);
    }

    @Cacheable(cacheNames = AppConstants.REVIEW_ANALYTICS)
    public ReviewsInfoDTO getAnalytics(Account user, Long shopId, Long bookId) {

        boolean isAdmin = CommonUtils.isAuthAdmin();
        var analytics = reviewRepo.getReviewAnalytics(shopId, isAdmin ? null : user.getId(), bookId);

        return new ReviewsInfoDTO(
                analytics.getRating(),
                analytics.getTotalRates() != null ? analytics.getTotalRates().intValue() : 0,
                List.of(
                        analytics.getRate1() != null ? analytics.getRate1().intValue() : 0,
                        analytics.getRate2() != null ? analytics.getRate2().intValue() : 0,
                        analytics.getRate3() != null ? analytics.getRate3().intValue() : 0,
                        analytics.getRate4() != null ? analytics.getRate4().intValue() : 0,
                        analytics.getRate5() != null ? analytics.getRate5().intValue() : 0));
    }

    /**
     * Check if the user is the reviewer of the review
     * 
     * @param review Review
     * @param user   User
     * @return True if the user is the reviewer of the review, false otherwise
     */
    protected boolean isValidReviewer(Review review, Account user) {

        return review.getUser().getId().equals(user.getId()) || CommonUtils.isAuthAdmin();
    }
}
