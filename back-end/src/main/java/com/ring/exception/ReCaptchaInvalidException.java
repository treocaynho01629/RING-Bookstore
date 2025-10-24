package com.ring.exception;

import com.ring.common.AppConstants;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception class named {@link ReCaptchaInvalidException} thrown when the reCAPTCHA validation failed.
 */
@Getter
@ResponseStatus(code = HttpStatus.FORBIDDEN)
public final class ReCaptchaInvalidException extends RuntimeException {

    private final String error;
    private String message;

    public ReCaptchaInvalidException() {
        super();
        this.error = AppConstants.INVALID_RECAPTCHA;
    }

    public ReCaptchaInvalidException(String message) {
        super();
        this.error = AppConstants.INVALID_RECAPTCHA;
        this.message = message;
    }

    public ReCaptchaInvalidException(String error, String message) {
        super();
        this.error = error;
        this.message = message;
    }
}
