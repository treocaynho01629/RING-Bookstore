package com.ring.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.ring.common.AppConstants;

/**
 * Exception class named {@link ResetPasswordException} thrown when password reset failed.
 */
@Getter
@ResponseStatus(code = HttpStatus.FORBIDDEN)
public class ResetPasswordException extends RuntimeException {

    private final String error;
    private String message;

    public ResetPasswordException() {
        super();
        this.error = AppConstants.RESET_PASSWORD_FAILED;
    }

    public ResetPasswordException(String message) {
        super();
        this.error = AppConstants.RESET_PASSWORD_FAILED;
        this.message = message;
    }

    public ResetPasswordException(String error, String message) {
        super();
        this.error = error;
        this.message = message;
    }
}
