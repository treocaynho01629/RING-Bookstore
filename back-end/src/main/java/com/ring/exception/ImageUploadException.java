package com.ring.exception;

import com.ring.common.AppConstants;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception class named {@link ImageUploadException} thrown when uploading image failed.
 */
@Getter
@ResponseStatus(code = HttpStatus.EXPECTATION_FAILED)
public class ImageUploadException extends RuntimeException {

    private final String error;
    private String message;

    public ImageUploadException() {
        super();
        this.error = AppConstants.UPLOAD_IMAGE_FAILED;
    }

    public ImageUploadException(String message) {
        super();
        this.error = AppConstants.UPLOAD_IMAGE_FAILED;
        this.message = message;
    }

    public ImageUploadException(String error, String message) {
        super();
        this.error = error;
        this.message = message;
    }

    public ImageUploadException(String error, String message, Throwable exception) {
        super(exception);
        this.error = error;
        this.message = message;
    }
}
