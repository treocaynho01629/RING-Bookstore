package com.ring.exception;

import lombok.Getter;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.client.HttpClientErrorException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ring.common.AppConstants;

/**
 * Exception class named {@link GHNException} thrown when the GHN could not be
 * processed.
 */
@Getter
@ResponseStatus(code = HttpStatus.EXPECTATION_FAILED)
public class GHNException extends RuntimeException {

    private HttpStatus status;
    private String error;
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

    public GHNException(HttpClientErrorException exception) {
        super();
        try {
            Map<String, Object> errorBody = new ObjectMapper().readValue(
                    exception.getResponseBodyAsString(),
                    new TypeReference<Map<String, Object>>() {
                    });
            this.status = HttpStatus.valueOf(exception.getStatusCode().value());
            this.error = errorBody.get("codeMessageValue") != null ? errorBody.get("codeMessageValue").toString()
                    : AppConstants.GHN_FAILED;
            this.message = errorBody.get("message") != null ? errorBody.get("message").toString()
                    : AppConstants.GHN_FAILED;
        } catch (Exception e) {
            this.status = HttpStatus.INTERNAL_SERVER_ERROR;
            this.error = AppConstants.GHN_FAILED;
            this.message = e.getMessage();
        }
    }
}
