package com.ring.service.impl;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.net.HttpHeaders;
import com.ring.common.AppConstants;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

/**
 * Service class for managing login protection by tracking failed login attempts
 * and blocking suspicious or excessive login attempts.
 */
@Service
public class LoginProtectionService {

    public static final int MAX_ATTEMPT = 10;
    public static final int VALID_ATTEMPT = 5;
    public static final int EXPIRE_TIME = 15;

    private final LoadingCache<String, Integer> attemptsCache;

    private final HttpServletRequest request;

    /**
     * Constructs a new LoginProtectionService using the given HTTP request.
     *
     * @param request The HTTP request used to extract the client's IP address.
     */
    public LoginProtectionService(HttpServletRequest request) {
        super();
        attemptsCache = CacheBuilder.newBuilder()
                .expireAfterWrite(EXPIRE_TIME, TimeUnit.MINUTES)
                .build(new CacheLoader<String, Integer>() {
                    @Override
                    public Integer load(final String key) { return 0; }
                }
        );
        this.request = request;
    }

    /**
     * Increments the failed login attempts count for the given client IP.
     *
     * @param key The client IP or identifier to track failed login attempts.
     */
    public void loginFailed(final String key) {
        int attempts;
        try {
            attempts = attemptsCache.get(key);
        } catch (final ExecutionException e) {
            attempts = 0;
        }
        attempts++;
        attemptsCache.put(key, attempts);
    }

    /**
     * Checks whether the client has made enough failed login attempts to be considered suspicious.
     *
     * @return True if the client has made failed attempts greater than or equal to {@link #VALID_ATTEMPT}; otherwise, false.
     */
    public boolean isSuspicious() {
        try {
            return attemptsCache.get(getClientIP()) >= VALID_ATTEMPT;
        } catch (final ExecutionException e) {
            return false;
        }
    }

    /**
     * Checks whether the client has exceeded the maximum number of allowed failed login attempts.
     * If the client is blocked, further login attempts are prevented.
     *
     * @return True if the client has exceeded {@link #MAX_ATTEMPT} failed login attempts; otherwise, false.
     */
    public boolean isBlocked() {
        try {
            return attemptsCache.get(getClientIP()) >= MAX_ATTEMPT;
        } catch (final ExecutionException e) {
            return false;
        }
    }

    /**
     * Retrieves the client IP address from the HTTP request. First checks for the "X-Forwarded-For" header,
     * then falls back to the remote address if not available.
     *
     * @return The client's IP address.
     */
    private String getClientIP() {
        final String xfHeader = request.getHeader(HttpHeaders.X_FORWARDED_FOR);
        if (xfHeader != null) {
            return xfHeader.split(AppConstants.DELIMITER)[0];
        }
        return request.getRemoteAddr();
    }
}