package com.ring.service;

import com.ring.exception.CaptchaInvalidException;

public interface CaptchaService {

    /**
     * Validate Cloudflare Turnstile token.
     *
     * @param token  The Turnstile token from the client-side widget.
     * @param source The captcha source (e.g. "turnstile") - kept for API
     *               compatibility.
     * @param action The action to validate (e.g. "login", "register").
     */
    void validate(String token, String source, String action) throws CaptchaInvalidException;

}
