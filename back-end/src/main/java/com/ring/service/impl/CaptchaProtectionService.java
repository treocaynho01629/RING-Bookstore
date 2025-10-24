package com.ring.service.impl;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Service class for managing captcha protection by tracking captcha verification attempts.
 * It enforces rate-limiting and blocks users after a certain number of failed captcha attempts.
 */
@Service("captchaProtectionService")
public class CaptchaProtectionService {

    public final int EXPIRE_TIME = 4;
    public final int MAX_ATTEMPT = 5;

    private final LoadingCache<String, Integer> attemptsCache;

    /**
     * Constructs a new CaptchaProtectionService.
     * Initializes the cache to track captcha attempts.
     */
    public CaptchaProtectionService() {
        attemptsCache = CacheBuilder.newBuilder().expireAfterWrite(EXPIRE_TIME, TimeUnit.HOURS)
                .build(new CacheLoader<String, Integer>() {
            @Override
            public Integer load(final String key) {
                return 0;
            }
        });
    }

    /**
     * Marks the captcha verification as successful for the given client identifier.
     * This resets the failed attempts count for the client.
     *
     * @param key The client identifier (e.g., IP address or session ID) for which the captcha attempt was successful.
     */
    public void captchaSucceeded(final String key) {
        attemptsCache.invalidate(key);
    }

    /**
     * Increments the captcha failure attempt count for the given client identifier.
     *
     * @param key The client identifier (e.g., IP address or session ID) for which the captcha attempt failed.
     */
    public void captchaFailed(final String key) {
        int attempts = attemptsCache.getUnchecked(key);
        attempts++;
        attemptsCache.put(key, attempts);
    }

    /**
     * Checks if the client has exceeded the maximum allowed number of failed captcha attempts.
     * If the client has exceeded the threshold, they are considered blocked.
     *
     * @param key The client identifier (e.g., IP address or session ID) to check for failed attempts.
     * @return True if the client has exceeded the maximum failed attempts; otherwise, false.
     */
    public boolean isBlocked(final String key) {
        return attemptsCache.getUnchecked(key) >= MAX_ATTEMPT;
    }

}
