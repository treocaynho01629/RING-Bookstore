package com.ring.exception;

import com.ring.common.AppConstants;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception class named {@link ResourceNotFoundException} thrown when the specified resource is not found.
 */
@Getter
@ResponseStatus(code = HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
	
    private final String error;
    private String message;

    public ResourceNotFoundException() {
        super();
        this.error = AppConstants.NOT_FOUND;
    }

    public ResourceNotFoundException(String message) {
        super();
        this.error = AppConstants.NOT_FOUND;
        this.message = message;
    }

    public ResourceNotFoundException(String error, String message) {
        super();
        this.error = error;
        this.message = message;
    }
}
