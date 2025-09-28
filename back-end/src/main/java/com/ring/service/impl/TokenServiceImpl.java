package com.ring.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.google.common.hash.Hashing;
import com.ring.common.AppConstants;
import com.ring.config.security.TokenSettings;
import com.ring.dto.projection.images.IImage;
import com.ring.exception.HttpResponseException;
import com.ring.exception.TokenRefreshException;
import com.ring.model.entity.Account;
import com.ring.repository.ImageRepository;
import com.ring.service.TokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.util.WebUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.*;
import java.util.function.Function;

/**
 * Service implementation named {@link TokenServiceImpl} for managing
 * authentication tokens.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenServiceImpl implements TokenService {

    private final TokenSettings tokenSettings;
    private final ImageRepository imageRepo;
    private final Cloudinary cloudinary;

    /**
     * Generates an authentication token with user details claims for the specified
     * user details.
     *
     * @param user The user to include in the token.
     * @return The generated authentication token.
     */
    public String generateAccessToken(Account user) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("id", user.getId());
        IImage image = imageRepo.findByProfile(user.getProfile().getId()).orElse(null);

        if (image != null) {
            String url = cloudinary.url().transformation(new Transformation()
                    .aspectRatio("1.0")
                    .width(35)
                    .crop("thumb")
                    .chain()
                    .radius("max")
                    .quality("auto")
                    .fetchFormat("auto"))
                    .secure(true).generate(image.getPublicId());
            extraClaims.put("image", url);
        }

        return this.generateToken(extraClaims, user);
    }

    /**
     * Generates an authentication token for the specified user details.
     *
     * @param userDetails The user details to include in the token.
     * @return The generated authentication token.
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Generates an authentication token with additional custom claims.
     *
     * @param extraClaims Additional claims to include in the token.
     * @param userDetails The user details to include in the token.
     * @return The generated authentication token.
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims,
                userDetails,
                tokenSettings.getTokenExpiration(),
                tokenSettings.getSecretKey());
    }

    /**
     * Generates a refresh token for the specified user details.
     *
     * @param userDetails The user details to include in the refresh token.
     * @return The generated refresh token.
     */
    public String generateRefreshToken(UserDetails userDetails) {
        return buildCustomToken(userDetails.getUsername(),
                tokenSettings.getRefreshTokenExpiration(),
                tokenSettings.getSecretRefreshKey());
    }

    /**
     * Generates a custom token with a specified username, expiration time, and key.
     *
     * @param username The username to include in the token.
     * @param expTime  The expiration time of the token in milliseconds.
     * @param key      The signing key for the token.
     * @return The generated custom token.
     */
    public String generateCustomToken(String username, long expTime, String key) {
        // Hash the key string
        String sha256hex = Hashing.sha256()
                .hashString(key, StandardCharsets.UTF_8)
                .toString();

        return buildCustomToken(username, expTime, sha256hex);
    }

    /**
     * Extracts the username from the given authentication token.
     *
     * @param token The authentication token.
     * @return The extracted username.
     */
    public String extractUsername(String token) {
        return extractClaim(token,
                Claims::getSubject,
                getSignInKey(tokenSettings.getSecretKey()));
    }

    /**
     * Extracts the username from a refresh token.
     *
     * @param token The refresh token.
     * @return The extracted username.
     */
    public String extractRefreshUsername(String token) {
        return extractClaim(token,
                Claims::getSubject,
                getSignInKey(tokenSettings.getSecretRefreshKey()));
    }

    /**
     * Extracts the username from a custom token using a provided key.
     *
     * @param token The custom token.
     * @param key   The key used to verify the token.
     * @return The extracted username.
     */
    public String extractCustomUsername(String token, String key) {
        // Hash the key string
        String sha256hex = Hashing.sha256()
                .hashString(key, StandardCharsets.UTF_8)
                .toString();
        return extractClaim(token, Claims::getSubject, getSignInKey(sha256hex));
    }

    /**
     * Extracts a specific claim from the token using a claims resolver function.
     *
     * @param token          The token to extract the claim from.
     * @param claimsResolver The function used to resolve the claim.
     * @param key            The signing key for the token.
     * @param <T>            The type of the claim.
     * @return The extracted claim.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver, Key key) {
        final Claims claims = extractAllClaims(token, key);
        return claimsResolver.apply(claims);
    }

    /**
     * Checks whether the authentication token is valid for the provided user
     * details.
     *
     * @param token       The authentication token.
     * @param userDetails The user details to validate against.
     * @return True if the token is valid; otherwise, false.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token); // Extract username
        return (username.equals(userDetails.getUsername()))
                && !isTokenExpired(token, tokenSettings.getSecretKey()); // Check expiration and valid username
    }

    /**
     * Checks whether the refresh token is valid for the given username.
     *
     * @param token    The refresh token.
     * @param username The username to validate against.
     * @return True if the refresh token is valid; otherwise, false.
     */
    public boolean isRefreshTokenValid(String token, String username) {
        final String extractedUsername = extractRefreshUsername(token); // Extract username
        return (extractedUsername.equals(username))
                && !isTokenExpired(token, tokenSettings.getSecretRefreshKey()); // Check expiration and valid username
    }

    /**
     * Checks whether a custom token is valid using the provided username and key.
     *
     * @param token    The custom token.
     * @param username The username to validate against.
     * @param key      The key used to validate the token.
     * @return True if the custom token is valid; otherwise, false.
     */
    public boolean isCustomTokenValid(String token, String username, String key) {
        // Hash the key string
        String sha256hex = Hashing.sha256()
                .hashString(key, StandardCharsets.UTF_8)
                .toString();
        final String extractedUsername = extractCustomUsername(token, key); // Extract username
        return (extractedUsername.equals(username))
                && !isTokenExpired(token, sha256hex); // Check expiration and valid username
    }

    /**
     * Validates the structure and signature of a token.
     *
     * @param token The token to validate.
     * @return True if the token is valid; otherwise, false.
     */
    public boolean validateToken(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey(tokenSettings.getSecretKey()))
                .build()
                .parseClaimsJws(token)
                .getBody() != null;
    }

    /**
     * Generates a response cookie containing a refresh token value.
     *
     * @param value The refresh token value to store in the cookie.
     * @return The generated response cookie.
     */
    public ResponseCookie generateRefreshCookie(String value) {
        return ResponseCookie
                .from(AppConstants.REFRESH_TOKEN, value)
                .path("/api/auth")
                .maxAge(tokenSettings.getRefreshTokenExpiration())
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
    }

    /**
     * Extracts the refresh token value from an HTTP request's cookies.
     *
     * @param request The HTTP request.
     * @return The refresh token value, or null if not found.
     */
    public String extractRefreshToken(HttpServletRequest request) {

        // Cookie
        Cookie cookie = WebUtils.getCookie(request, AppConstants.REFRESH_TOKEN);
        if (cookie != null && !cookie.getValue().isEmpty()) {
            log.debug("Using refresh token from cookie");
            return cookie.getValue();
        }

        // Custom header
        String customHeaderToken = request.getHeader("X-Refresh-Token");
        if (customHeaderToken != null && !customHeaderToken.isEmpty()) {
            log.debug("Using refresh token from X-Refresh-Token header");
            return customHeaderToken;
        }

        // Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith(AppConstants.TOKEN_PREFIX)) {
            String token = authHeader.substring(AppConstants.TOKEN_PREFIX.length());
            log.debug("Using refresh token from Authorization header");
            return token;
        }

        return null;
    }

    /**
     * Clears the refresh token by generating an empty cookie.
     *
     * @return The cleared response cookie.
     */
    public ResponseCookie clearRefreshCookie() {
        return ResponseCookie
                .from(AppConstants.REFRESH_TOKEN, null)
                .path("/api/auth")
                .build();
    }

    /**
     * Builds a JWT token using the provided claims, user details, expiration time,
     * and signing key.
     *
     * @param extraClaims Additional claims to embed in the token.
     * @param userDetails The user details to extract subject and roles.
     * @param expiration  The expiration time for the token in milliseconds.
     * @param key         The secret key used to sign the token.
     * @return The generated JWT token.
     */
    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration,
            String key) {
        // Add roles with token
        List<String> roles = new ArrayList<>();
        userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE"))
                .forEach(roles::add);
        extraClaims.put("roles", roles);

        return Jwts // Create JWT
                .builder()
                .setClaims(extraClaims) // Claims
                .setSubject(userDetails.getUsername()) // Name
                .setIssuedAt(new Date(System.currentTimeMillis())) // Create date
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // Expiration date
                .signWith(getSignInKey(key), SignatureAlgorithm.HS256) // Encrypt
                .compact();
    }

    /**
     * Builds a custom JWT token with the given username, expiration time, and
     * signing key.
     *
     * @param username   The username to include as the token's subject.
     * @param expiration The expiration time for the token in milliseconds.
     * @param key        The secret key used to sign the token.
     * @return The generated custom JWT token.
     */
    private String buildCustomToken(
            String username,
            long expiration,
            String key) {
        return Jwts // Create JWT
                .builder()
                .setSubject(username) // Name
                .setIssuedAt(new Date(System.currentTimeMillis())) // Create date
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // Expiration date
                .signWith(getSignInKey(key), SignatureAlgorithm.HS256) // Encrypt
                .compact();
    }

    /**
     * Checks whether a JWT token has expired.
     *
     * @param token The JWT token to check.
     * @param key   The secret key used to verify the token.
     * @return True if the token has expired; otherwise, false.
     */
    private boolean isTokenExpired(String token, String key) {
        return extractExpiration(token, getSignInKey(key)).before(new Date());
    }

    /**
     * Extracts the expiration date from a JWT token.
     *
     * @param token The JWT token.
     * @param key   The signing key used to validate the token.
     * @return The expiration date of the token.
     */
    private Date extractExpiration(String token, Key key) {
        return extractClaim(token, Claims::getExpiration, key);
    }

    /**
     * Extracts all claims from a JWT token.
     * If the token is expired, it still returns the claims safely.
     *
     * @param token The JWT token.
     * @param key   The signing key used to parse the token.
     * @return The claims extracted from the token.
     */
    private Claims extractAllClaims(String token, Key key) {
        try { // Get Claims from valid token
            return Jwts
                    .parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) { // Get Claims from expired token
            return e.getClaims();
        }
    }

    /**
     * Converts a base64-encoded secret key string into a cryptographic signing key.
     *
     * @param key The base64-encoded secret key.
     * @return The cryptographic key for signing JWTs.
     */
    private Key getSignInKey(String key) {
        byte[] keyBytes = Decoders.BASE64.decode(key);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
