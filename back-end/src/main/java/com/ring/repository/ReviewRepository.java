package com.ring.repository;

import com.ring.dto.projection.reviews.IReview;
import com.ring.model.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface named {@link ReviewRepository} for managing {@link Review} entities.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

	/**
	 * Retrieves a pageable list of reviews based on various filter criteria.
	 *
	 * @param bookId the ID of the book to filter reviews by; if null,*/
	@Query("""
		SELECT r AS review, 
			u.id AS userId, 
			u.username AS username, 
			i AS image,
			b.id AS bookId, 
			b.title AS bookTitle, 
			b.slug AS bookSlug
		FROM Review r
		JOIN r.book b
		LEFT JOIN r.user u
		LEFT JOIN u.profile p
		LEFT JOIN p.image i
		WHERE (COALESCE(:userId) IS NULL OR u.id = :userId)
		AND (COALESCE(:bookId) IS NULL OR r.book.id = :bookId)
		AND (COALESCE(:rating) IS NULL OR r.rating = :rating)
		AND CONCAT(r.rContent, u.username) ILIKE %:keyword%
	""")
	Page<IReview> findReviews(Long bookId,
							  Long userId,
							  Integer rating,
							  String keyword,
							  Pageable pageable);

	/**
	 * Retrieves a list of review IDs that meet the specified filtering criteria and are not included in the given list of IDs.
	 *
	 * @param bookId   the ID of the book to filter reviews by; null if the filter is not applied.
	 */
	@Query("""
		SELECT r.id 
		FROM Review r
		LEFT JOIN r.user u
		WHERE (COALESCE(:userId) IS NULL OR r.user.id = :userId)
		AND (COALESCE(:bookId) IS NULL OR r.book.id = :bookId)
		AND (COALESCE(:rating) IS NULL OR r.rating = :rating)
		AND CONCAT(r.rContent, u.username) ILIKE %:keyword%
		AND r.id NOT IN :ids
		GROUP BY r.id
	""")
	List<Long> findInverseIds(Long bookId,
							  Long userId,
							  Integer rating,
							  String keyword,
							  List<Long> ids);

	/**
	 * Retrieves reviews for a specific book based on its ID, optionally filtered by rating.
	 *
	 * @param id the ID of the book for which reviews are to be retrieved
	 * @param rating the optional rating value to filter reviews; if null, all ratings are included*/
	@Query("""
		SELECT r AS review, 
			u.id AS userId, 
			u.username AS username, 
			i AS image,
			b.id AS bookId, 
			b.title AS bookTitle, 
			b.slug AS bookSlug
		FROM Review r
		JOIN r.book b
		LEFT JOIN r.user u
		LEFT JOIN u.profile p
		LEFT JOIN p.image i
		WHERE b.id = :id
		AND r.isHidden = false
		AND (COALESCE(:rating) IS NULL OR r.rating = :rating)
	""")
	Page<IReview> findReviewsByBookId(Long id, Integer rating, Pageable pageable);

	/**
	 * Retrieves a paginated list of reviews submitted by a specific user, optionally filtered by rating.
	 *
	 * @param id the unique identifier of the user whose reviews are being retrieved
	 * @param rating the rating filter to apply; if null, reviews of all ratings are included
	 * @*/
	@Query("""
		SELECT r AS review, 
			u.id AS userId, 
			u.username AS username, 
			i AS image,
			b.id AS bookId, 
			b.title AS bookTitle, 
			b.slug AS bookSlug
		FROM Review r
		JOIN r.book b
		LEFT JOIN r.user u
		LEFT JOIN u.profile p
		LEFT JOIN p.image i
		WHERE r.user.id = :id
		AND (COALESCE(:rating) IS NULL OR r.rating = :rating)
	""")
	Page<IReview> findUserReviews(Long id, Integer rating, Pageable pageable);

	/**
	 * Retrieves a review for a specific book by a specific user.
	 *
	 * @param bookId the ID of the book for which the review is being retrieved
	 * @param userId the ID of the user who wrote the review
	 * @return an Optional containing the user's review for the specified book, or an empty Optional if no review is found
	 */
	@Query("""
		SELECT r AS review, 
			u.id AS userId, 
			u.username AS username, 
			i AS image,
			b.id AS bookId, 
			b.title AS bookTitle, 
			b.slug AS bookSlug
		FROM Review r
		JOIN r.book b
		LEFT JOIN r.user u
		LEFT JOIN u.profile p
		LEFT JOIN p.image i
		WHERE r.user.id = :userId AND b.id = :bookId
	""")
	Optional<IReview> findUserBookReview(Long bookId, Long userId);
}
