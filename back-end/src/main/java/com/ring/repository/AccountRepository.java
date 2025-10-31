package com.ring.repository;

import com.ring.dto.projection.accounts.IAccount;
import com.ring.dto.projection.dashboard.IStat;
import com.ring.model.entity.Account;
import com.ring.model.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface named {@link AccountRepository} for managing {@link Account} entities.
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Long>{
	
	/**
	 * Checks if a user exists with the given username or email.
	 *
	 * @param username the username to check for existence
	 * @param email the email to check for existence
	 * @return true if a user exists with the given username or email, false otherwise
	 */
	boolean existsByUsernameOrEmail(String username, String email);

	/**
	 * Finds an Account entity by its email address.
	 *
	 * @param email the email address of the account to be retrieved
	 * @return an Optional containing the Account entity if found, or an empty Optional if not found
	 */
	Optional<Account> findByEmail(String email);

	/**
	 * Fetches an account entity along with its roles by the specified username.
	 *
	 * @param username the username of the account to be retrieved
	 * @return an {@code Optional} containing the account if found, or an empty {@code Optional} if not found
	 */
	@Query("""
		SELECT a FROM Account a
		JOIN FETCH a.roles r
		WHERE a.username = :username
	""")
	Optional<Account> findByUsername(String username);

	/**
	 * Retrieves an optional {@link Account} entity based on the specified refresh token and username.
	 * The query joins the associated roles and refresh tokens to fetch the account details.
	 *
	 * @param token the refresh token associated with the account
	 * @param username the username associated with the account
	 * @return an {@link Optional} containing the matching {@link Account} if found, or an empty {@link Optional} if no match is found
	 */
	@Query("""
		SELECT a FROM Account a
		JOIN a.refreshTokens t
		JOIN FETCH a.roles r
		WHERE t.refreshToken = :token
		AND a.username = :username
	""")
	Optional<Account> findByRefreshTokenAndUsername(String token, String username);

	/**
	 * Finds an account based on the provided reset token.
	 *
	 * @param token the reset token associated with the account.
	 * @return an {@code Optional} containing the account if found, or {@code Optional.empty()} if not found.
	 */
	Optional<Account> findByResetToken(String token);

	/**
	 * Finds a list of account IDs that match the given criteria but are excluded
	 * from the specified list of IDs.
	 *
	 * @param keyword A string used to search for accounts by email or username.
	 *                The provided keyword is checked in a case-insensitive manner.
	 * @param role    An optional user role used to filter the accounts. If the role
	 *                is null, this criterion is ignored.
	 * @param ids     A list of IDs to exclude from the search.
	 * @return A list of IDs of accounts that match the criteria but do not belong
	 *         to the excluded list.
	 */
	@Query("""
		SELECT a.id 
		FROM Account a
		JOIN a.roles r
		WHERE CONCAT(a.email, a.username) ILIKE %:keyword%
		AND (COALESCE(:role) IS NULL OR r.roleName = :role)
		AND a.id NOT IN :ids
		GROUP BY a.id
	""")
	List<Long> findInverseIds(String keyword, UserRole role, List<Long> ids);

	/**
	 * Retrieves analytics data for accounts, including total accounts created in the last two months,
	 * accounts created in the current month, and accounts created in the previous month.
	 *
	 * @return an IStat projection object containing the total number of accounts, the count of accounts
	 *         created in the current month, and the count of accounts created in the previous month.
	 */
	@Query("""
        SELECT t.currentMonth AS total, 
				t.currentMonth AS currentMonth, 
				t.lastMonth AS lastMonth
        FROM (SELECT COUNT(a.id) AS total,
			COUNT(CASE WHEN a.createdDate >= DATE_TRUNC('month', CURRENT DATE) THEN 1 END) AS currentMonth,
			COUNT(CASE WHEN a.createdDate >= DATE_TRUNC('month', CURRENT DATE) - 1 MONTH
				AND a.createdDate < DATE_TRUNC('month', CURRENT DATE) THEN 1 END) AS lastMonth
			FROM Account a
			WHERE a.createdDate >= DATE_TRUNC('month', CURRENT DATE) - 1 MONTH
        ) t
   	""")
	IStat getAccountAnalytics();

	/**
	 * Retrieves a paginated list of accounts based on the provided filters.
	 *
	 * @param keyword the search keyword used to filter accounts by their email or username
	 * @param role the user role used to filter accounts; if null, this filter is ignored
	 * @param pageable pagination information to limit and sort the results
	 * @return a page of projections containing account information, including ID, username, email, profile name, phone, roles, and associated image
	 */
	@Query("""
		SELECT DISTINCT t.id AS id, 
			t.username AS username, 
			t.email AS email, 
			p.name AS name,
			p.phone AS phone, 
			t.roles AS roles, 
			i AS image, 
			t.createdDate AS createdDate
		FROM (SELECT a.id AS id, 
				a.username AS username, 
				a.email AS email, 
				a.createdDate AS createdDate,
			ARRAY_AGG(r.roleName) OVER (PARTITION BY a.id ORDER BY a.id) AS roles
			FROM Account a
			JOIN a.roles r
			WHERE CONCAT(a.email, a.username) ILIKE %:keyword%
			AND (COALESCE(:role) IS NULL OR r.roleName = :role)
			GROUP BY a.id, r.roleName) t
		LEFT JOIN AccountProfile p ON p.id = t.id
		LEFT JOIN p.image i
	""")
	Page<IAccount> findAccountsWithFilter(String keyword, UserRole role, Pageable pageable);

	/**
	 * Clears the reset token for an account by setting it to null.
	 *
	 * @param token the reset token to search for and clear from the account
	 */
	@Modifying
	@Query("""
        UPDATE Account a
        SET a.resetToken = null
        WHERE a.resetToken = :token
    """)
	void clearResetToken(String token);
}
