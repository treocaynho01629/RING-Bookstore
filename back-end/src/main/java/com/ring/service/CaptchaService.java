package com.ring.service;

import com.ring.exception.ReCaptchaInvalidException;

public interface CaptchaService {

    /**
     * Validate reCaptcha action.
     *
     * @param recaptchaToken    The reCaptcha token.
     * @param source            The version of reCaptcha.
     * @param action            The action needed to be validated.
     */
    void validate(final String recaptchaToken,
                  String source,
                  String action) throws ReCaptchaInvalidException;

}
