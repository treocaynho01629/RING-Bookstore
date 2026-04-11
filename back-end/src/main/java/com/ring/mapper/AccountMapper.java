package com.ring.mapper;

import com.cloudinary.Cloudinary;
import com.ring.common.AppConstants;
import com.ring.common.CloudinaryTransformations;
import com.ring.dto.projection.accounts.IAccount;
import com.ring.dto.projection.accounts.IAccountDetail;
import com.ring.dto.projection.accounts.IProfile;
import com.ring.dto.projection.images.IImage;
import com.ring.dto.response.accounts.AccountDTO;
import com.ring.dto.response.accounts.AccountDetailDTO;
import com.ring.dto.response.accounts.ProfileDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * A mapper for {@link IAccount}, {@link IAccountDetail}, and {@link IProfile}
 * to {@link AccountDTO}, {@link AccountDetailDTO}, and {@link ProfileDTO}.
 */
@RequiredArgsConstructor
@Service
public class AccountMapper {

    private final Cloudinary cloudinary;

    /**
     * Maps a {@link IAccount} to a {@link AccountDTO}.
     * 
     * @param projection the projection to map
     * @return the mapped {@link AccountDTO}
     */
    public AccountDTO projectionToDTO(IAccount projection) {

        IImage image = projection.getImage();
        String imageUrl = image != null
                ? cloudinary.url()
                        .transformation(CloudinaryTransformations.AVATAR_TRANSFORMATION)
                        .secure(true)
                        .generate(image.getPublicId())
                : null;

        return new AccountDTO(projection.getId(),
                projection.getUsername(),
                projection.getEmail(),
                projection.getName(),
                projection.getPhone(),
                imageUrl,
                projection.getRoles());
    }

    /**
     * Maps a {@link IAccountDetail} to a {@link AccountDetailDTO}.
     * 
     * @param projection the projection to map
     * @return the mapped {@link AccountDetailDTO}
     */
    public AccountDetailDTO projectionToDetailDTO(IAccountDetail projection) {

        LocalDate dob = (dob = projection.getDob()) != null ? dob : AppConstants.DEFAULT_DATE;
        IImage image = projection.getImage();
        String imageUrl = image != null
                ? cloudinary.url()
                        .transformation(CloudinaryTransformations.PROFILE_TRANSFORMATION)
                        .secure(true)
                        .generate(image.getPublicId())
                : null;

        return new AccountDetailDTO(projection.getId(),
                projection.getUsername(),
                imageUrl,
                projection.getEmail(),
                projection.getRoles(),
                projection.getName(),
                projection.getPhone(),
                projection.getGender(),
                dob,
                projection.getJoinedDate(),
                projection.getTotalFollows(),
                projection.getTotalReviews());
    }

    /**
     * Maps a {@link IProfile} to a {@link ProfileDTO}.
     * 
     * @param projection the projection to map
     * @return the mapped {@link ProfileDTO}
     */
    public ProfileDTO projectionToProfileDTO(IProfile projection) {

        LocalDate dob = (dob = projection.getDob()) != null ? dob : AppConstants.DEFAULT_DATE;
        IImage image = projection.getImage();
        String imageUrl = image != null
                ? cloudinary.url()
                        .transformation(CloudinaryTransformations.PROFILE_TRANSFORMATION)
                        .secure(true)
                        .generate(image.getPublicId())
                : null;

        return new ProfileDTO(imageUrl,
                projection.getName(),
                projection.getEmail(),
                projection.getPhone(),
                projection.getGender(),
                dob,
                projection.getJoinedDate(),
                projection.getTotalFollows(),
                projection.getTotalReviews());
    }
}
