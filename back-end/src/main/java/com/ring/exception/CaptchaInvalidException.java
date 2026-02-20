package com.ring.exception;

import com.ring.common.AppConstants;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception class named {@link CaptchaInvalidException} thrown when the Captcha
 * validation failed.
 */
@Getter
@ResponseStatus(code = HttpStatus.FORBIDDEN)
public final class CaptchaInvalidException extends RuntimeException {

    private final String error;
    private String message;

    public CaptchaInvalidException() {
        super();
        this.error = AppConstants.INVALID_CAPTCHA;
    }

    public CaptchaInvalidException(String message) {
        super();
        this.error = AppConstants.INVALID_CAPTCHA;
        this.message = message;
    }

    public CaptchaInvalidException(String error, String message) {
        super();
        this.error = error;
        this.message = message;
    }
}
