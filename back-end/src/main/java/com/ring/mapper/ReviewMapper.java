package com.ring.mapper;

import com.cloudinary.Cloudinary;
import com.ring.common.CloudinaryTransformations;
import com.ring.dto.projection.images.IImage;
import com.ring.dto.projection.reviews.IReview;
import com.ring.dto.response.reviews.ReviewDTO;
import com.ring.model.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * A mapper for {@link Review}, {@link ReviewDTO}.
 */
@RequiredArgsConstructor
@Service
public class ReviewMapper {

    private final Cloudinary cloudinary;

    /**
     * Maps a {@link Review} to a {@link ReviewDTO}.
     * 
     * @param review the review to map
     * @return the mapped {@link ReviewDTO}
     */
    public ReviewDTO reviewToDTO(Review review) {

        Account user = review.getUser();
        AccountProfile profile = (profile = user.getProfile()) != null ? profile : null;
        Image image = profile != null ? profile.getImage() : null;
        String imageUrl = image != null 
                ? cloudinary.url()
                        .transformation(CloudinaryTransformations.AVATAR_SMALL_TRANSFORMATION)
                        .secure(true)
                        .generate(image.getPublicId())
                : null;
        Book book = review.getBook();

        return new ReviewDTO(review.getId(),
                review.getRContent(),
                review.getRating(),
                review.getCreatedDate(),
                review.getLastModifiedDate(),
                user.getId(),
                user.getUsername(),
                imageUrl,
                book.getId(),
                book.getTitle(),
                book.getSlug());
    }

    /**
     * Maps a {@link IReview} to a {@link ReviewDTO}.
     * 
     * @param projection the projection to map
     * @return the mapped {@link ReviewDTO}
     */
    public ReviewDTO projectionToDTO(IReview projection) {

        Review review = projection.getReview();
        IImage image = projection.getImage();
        String imageUrl = image != null 
                ? cloudinary.url()
                        .transformation(CloudinaryTransformations.AVATAR_SMALL_TRANSFORMATION)
                        .secure(true)
                        .generate(image.getPublicId())
                : null;

        return new ReviewDTO(review.getId(),
                review.getRContent(),
                review.getRating(),
                review.getCreatedDate(),
                review.getLastModifiedDate(),
                projection.getUserId(),
                projection.getUsername(),
                imageUrl,
                projection.getBookId(),
                projection.getBookTitle(),
                projection.getBookSlug());
    }
}
