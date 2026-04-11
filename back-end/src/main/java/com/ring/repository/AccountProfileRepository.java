package com.ring.repository;

import com.ring.dto.projection.accounts.IAccountDetail;
import com.ring.dto.projection.accounts.IProfile;
import com.ring.model.entity.AccountProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface named {@link AccountProfileRepository} for managing
 * {@link AccountProfile} entities.
 */
@Repository
public interface AccountProfileRepository extends JpaRepository<AccountProfile, Long> {

    /**
     * Retrieves profile details for a specific user identified by their user ID.
     * The method fetches details such AS the user's name, phone number, gender,
     * date of birth,
     * email, account creation date, total number of follows, total number of
     * reviews,
     * and associated profile image.
     *
     * @param userId the unique identifier of the user whose profile is to be
     *               retrieved.
     * @return an {@code Optional} containing {@code IProfile}, which provides a
     *         projection
     *         of the user's profile details, or an empty {@code Optional} if no
     *         profile
     *         exists for the given user ID.
     */
    @Query("""
                SELECT p.name AS name,
                    p.phone AS phone,
                    p.gender AS gender,
                    p.dob AS dob,
                    a.email AS email,
                    a.createdDate AS joinedDate,
                    size(a.following) AS totalFollows,
                    size(a.userReviews) AS totalReviews,
                    i AS image
                FROM Account a
                LEFT JOIN a.profile p
                LEFT JOIN p.image i
                WHERE a.id = :userId
            """)
    Optional<IProfile> findProfileByUser(Long userId);

    /**
     * Retrieves detailed account information for a specific account ID.
     * The method returns an optional projection of account details, including
     * user information, profile attributes, and related metadata.
     *
     * @param id the unique identifier of the account for which details are to be
     *           retrieved
     * @return an Optional containing {@link IAccountDetail} if the account exists,
     *         or an empty Optional if no account is found with the specified ID
     */
    @Query("""
                SELECT DISTINCT a.id AS id,
                    a.username AS username,
                    a.email AS email,
                    p.name AS name,
                    p.phone AS phone,
                    ARRAY_AGG(r.roleName) OVER (PARTITION BY a.id ORDER BY a.id) AS roles,
                    p.gender AS gender,
                    p.dob AS dob,
                    a.createdDate AS joinedDate,
                    SIZE(a.following) AS totalFollows,
                    SIZE(a.userReviews) AS totalReviews,
                    i AS image
                FROM Account a
                LEFT JOIN a.profile p
                LEFT JOIN p.image i
                JOIN a.roles r
                WHERE a.id = :id
                GROUP BY a.id, p.id, i.id, r.roleName
            """)
    Optional<IAccountDetail> findDetailById(Long id);
}
