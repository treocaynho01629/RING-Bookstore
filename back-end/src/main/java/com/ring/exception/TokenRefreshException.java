package com.ring.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.ring.common.AppConstants;

import java.io.Serial;

/**
 * Exception class named {@link TokenRefreshException} thrown when the refresh token is invalid.
 */
@Getter
@ResponseStatus(code = HttpStatus.FORBIDDEN)
public class TokenRefreshException extends RuntimeException {

    @Serial
    private static final long serialVersionUID = -6924357230755962371L;

    private final String error;
    private String message;

    public TokenRefreshException() {
        super();
        this.error = AppConstants.REFRESH_TOKEN_FAILED;
    }

    public TokenRefreshException(String message) {
        super();
        this.error = AppConstants.REFRESH_TOKEN_FAILED;
        this.message = message;
    }

    public TokenRefreshException(String error, String message) {
        super();
        this.error = error;
        this.message = message;
    }
}
