package com.ring.exception;

import com.ring.common.AppConstants;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception class named {@link ReCaptchaInvalidException} thrown when the reCAPTCHA validation is suspicious.
 */
@Getter
@ResponseStatus(code = HttpStatus.PRECONDITION_FAILED)
public final class ReCaptchaSuspiciousException extends RuntimeException {

    private final String error;
    private String message;

    public ReCaptchaSuspiciousException() {
        super();
        this.error = AppConstants.SUSPICIOUS_RECAPTCHA;
    }

    public ReCaptchaSuspiciousException(String message) {
        super();
        this.error = AppConstants.SUSPICIOUS_RECAPTCHA;
        this.message = message;
    }

    public ReCaptchaSuspiciousException(String error, String message) {
        super();
        this.error = error;
        this.message = message;
    }
}
