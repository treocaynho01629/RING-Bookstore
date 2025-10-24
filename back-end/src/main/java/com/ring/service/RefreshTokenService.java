package com.ring.service;

import com.ring.model.entity.Account;
import org.springframework.http.ResponseCookie;

/**
 * Service interface named {@link RefreshTokenService} for refreshing authentication tokens and remove refresh tokens.
 */
public interface RefreshTokenService {

   /**
	 * Verifies the validity and integrity of the provided refresh token.
	 *
	 * @param token Refresh token value.
	 * @return The {@link Account} associated with the refresh token.
	 */
    Account verifyRefreshToken(String token);

    /**
     * Generates a response cookie containing a refresh token for the given user account.
     *
     * @param user The user account for which the refresh token cookie is to be generated.
     * @return A {@link ResponseCookie} containing the refresh token.
     */
    ResponseCookie generateRefreshCookie(Account user);

    /**
     * Clears the refresh token cookie by generating an empty cookie.
     */
    void clearRefreshToken(String token);

    /**
     * Clears the refresh token cookie by generating an empty cookie.
     *
     * @return A {@link ResponseCookie} that removes the refresh token from the client.
     */
    ResponseCookie clearRefreshCookie();

}
