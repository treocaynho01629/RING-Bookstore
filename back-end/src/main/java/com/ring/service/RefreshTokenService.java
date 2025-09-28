package com.ring.service;

import com.ring.model.entity.Account;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;

/**
 * Service interface named {@link RefreshTokenService} for refreshing authentication tokens and remove refresh tokens.
 */
public interface RefreshTokenService {

    /**
     * Refreshes the authentication token using the refresh token from the HTTP request.
     *
     * @param token Refresh token value.
     * @return The updated {@link Account} with a new authentication token.
     */
    Account refreshToken(String token);

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
