package com.ring.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

/**
 * Represents a response as {@link ExceptionResponse} containing error messages and error status.
 */
@Data
@AllArgsConstructor
public class ExceptionResponse {

    private int status;
    private String error;
    private Map<String, String> errors;
    private String message;

    public ExceptionResponse(int status, String error, String message) {
        
        this.status = status;
        this.error = error;
        this.message = message;
    }
}
