package com.ring.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.ring.common.AppConstants;

/**
 * Exception class named {@link GHNException} thrown when the GHN could not be
 * processed.
 */
@Getter
@ResponseStatus(code = HttpStatus.EXPECTATION_FAILED)
public class GHNException extends RuntimeException {

    private final HttpStatus status;
    private final String error;
    private String message;

    public GHNException() {
        super();
        this.status = HttpStatus.EXPECTATION_FAILED;
        this.error = AppConstants.GHN_FAILED;
    }

    public GHNException(String message) {
        super();
        this.status = HttpStatus.EXPECTATION_FAILED;
        this.error = AppConstants.GHN_FAILED;
        this.message = message;
    }

    public GHNException(HttpStatus status, String error, String message) {
        super();
        this.status = status;
        this.error = error;
        this.message = message;
    }

    public GHNException(HttpStatus status, String error, String message, Throwable exception) {
        super(exception);
        this.status = status;
        this.error = error;
        this.message = message;
    }
}
