package com.ring.service;

import com.ring.model.entity.Account;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Key;
import java.util.Map;
import java.util.function.Function;

/**
 * Service interface named {@link TokenService} for handling various types of authentication tokens,
 * including access tokens, refresh tokens, and custom tokens.
 */
public interface TokenService {

    /**
     * Generates an authentication token with user details claims for the specified user details.
     *
     * @param user The user to include in the token.
     * @return The generated authentication token.
     */
    String generateAccessToken(Account user);

    /**
     * Generates an authentication token for the specified user details.
     *
     * @param userDetails The user details to include in the token.
     * @return The generated authentication token.
     */
    String generateToken(UserDetails userDetails);

    /**
     * Generates an authentication token with additional custom claims.
     *
     * @param extraClaims Additional claims to include in the token.
     * @param userDetails The user details to include in the token.
     * @return The generated authentication token.
     */
    String generateToken(Map<String, Object> extraClaims, UserDetails userDetails);

    /**
     * Generates a refresh token for the specified user details.
     *
     * @param userDetails The user details to include in the refresh token.
     * @return The generated refresh token.
     */
    String generateRefreshToken(UserDetails userDetails);

    /**
     * Generates a custom token with a specified username, expiration time, and key.
     *
     * @param username The username to include in the token.
     * @param expTime  The expiration time of the token in milliseconds.
     * @param key      The signing key for the token.
     * @return The generated custom token.
     */
    String generateCustomToken(String username, long expTime, String key);

    /**
     * Extracts the username from the given authentication token.
     *
     * @param token The authentication token.
     * @return The extracted username.
     */
    String extractUsername(String token);

    /**
     * Extracts the username from a refresh token.
     *
     * @param token The refresh token.
     * @return The extracted username.
     */
    String extractRefreshUsername(String token);

    /**
     * Extracts the username from a custom token using a provided key.
     *
     * @param token The custom token.
     * @param key   The key used to verify the token.
     * @return The extracted username.
     */
    String extractCustomUsername(String token, String key);

    /**
     * Extracts a specific claim from the token using a claims resolver function.
     *
     * @param token          The token to extract the claim from.
     * @param claimsResolver The function used to resolve the claim.
     * @param key            The signing key for the token.
     * @param <T>            The type of the claim.
     * @return The extracted claim.
     */
    <T> T extractClaim(String token, Function<Claims, T> claimsResolver, Key key);

    /**
     * Checks whether the authentication token is valid for the provided user details.
     *
     * @param token       The authentication token.
     * @param userDetails The user details to validate against.
     * @return True if the token is valid; otherwise, false.
     */
    boolean isTokenValid(String token, UserDetails userDetails);

    /**
     * Checks whether the refresh token is valid for the given username.
     *
     * @param token    The refresh token.
     * @param username The username to validate against.
     * @return True if the refresh token is valid; otherwise, false.
     */
    boolean isRefreshTokenValid(String token, String username);

    /**
     * Checks whether a custom token is valid using the provided username and key.
     *
     * @param token    The custom token.
     * @param username The username to validate against.
     * @param key      The key used to validate the token.
     * @return True if the custom token is valid; otherwise, false.
     */
    boolean isCustomTokenValid(String token, String username, String key);

    /**
     * Validates the structure and signature of a token.
     *
     * @param token The token to validate.
     * @return True if the token is valid; otherwise, false.
     */
    boolean validateToken(String token);

    /**
     * Generates a response cookie containing a refresh token value.
     *
     * @param value The refresh token value to store in the cookie.
     * @return The generated response cookie.
     */
    ResponseCookie generateRefreshCookie(String value);

    /**
     * Extracts the refresh token value from an HTTP request's cookies.
     *
     * @param request The HTTP request.
     * @return The refresh token value, or null if not found.
     */
    String extractRefreshToken(HttpServletRequest request);

    /**
     * Clears the refresh token by generating an empty cookie.
     *
     * @return The cleared response cookie.
     */
    ResponseCookie clearRefreshCookie();
}
