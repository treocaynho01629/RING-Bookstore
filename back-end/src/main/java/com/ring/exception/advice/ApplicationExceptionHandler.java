package com.ring.exception.advice;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.ring.dto.response.ExceptionResponse;
import com.ring.common.AppConstants;
import com.ring.exception.*;
import com.ring.service.impl.MessageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestCookieException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * {@link ApplicationExceptionHandler} is a global exception handler for the
 * application.
 * It handles different types of exceptions and returns appropriate
 * {@link ExceptionResponse} for each.
 */
@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class ApplicationExceptionHandler {

    private final MessageService messageService;

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public ExceptionResponse handleAllException(Exception e) {

        String message = messageService.getMessage("exception.internal.server.error");
        log.error(message, e);

        return new ExceptionResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                AppConstants.INTERNAL_SERVER_ERROR,
                message);
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(RuntimeException.class)
    public ExceptionResponse handleRuntimeException(RuntimeException e) {

        String message = messageService.getMessage("exception.internal.server.error");
        log.error(message, e);

        return new ExceptionResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                AppConstants.INTERNAL_SERVER_ERROR,
                message);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ExceptionResponse handleInvalidArgument(MethodArgumentNotValidException e) {

        Map<String, String> errorsMap = new HashMap<>();

        // Map each field error
        e.getBindingResult().getFieldErrors().forEach(error -> {
            String fieldMessage = StringUtils.capitalize(messageService.getMessage(error));
            errorsMap.put(error.getField(), fieldMessage);
        });

        String message = messageService.getMessage("exception.invalid.argument");
        log.error(message, e);

        return new ExceptionResponse(
                HttpStatus.BAD_REQUEST.value(),
                AppConstants.INVALID_ARGUMENT,
                errorsMap,
                message);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ExceptionResponse handleMissingServletRequestPart(MissingServletRequestPartException e) {

        Map<String, String> errorsMap = new HashMap<>();

        String errorMessage = messageService.getMessage("exception.empty", new Object[] { e.getRequestPartName() });
        errorsMap.put(e.getRequestPartName(), errorMessage);

        String message = messageService.getMessage("exception.invalid.argument");
        log.error(message, e);

        return new ExceptionResponse(
                HttpStatus.BAD_REQUEST.value(),
                AppConstants.INVALID_ARGUMENT,
                errorsMap,
                message);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MissingRequestCookieException.class)
    public ExceptionResponse handleMissingCookie(MissingRequestCookieException e) {

        log.error("Missing cookie", e);

        return new ExceptionResponse(
                HttpStatus.BAD_REQUEST.value(),
                AppConstants.MISSING_COOKIE,
                e.getLocalizedMessage());
    }

    @ExceptionHandler(HttpResponseException.class)
    public ResponseEntity<ExceptionResponse> handleResponseException(HttpResponseException e) {

        log.error("Response exception", e);

        ExceptionResponse response = new ExceptionResponse(
                e.getStatus().value(),
                e.getError(),
                e.getLocalizedMessage());

        return new ResponseEntity<>(response, e.getStatus());
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ExceptionResponse handleResourceNotFoundException(ResourceNotFoundException e) {

        log.error("Resource not found", e);

        return new ExceptionResponse(
                HttpStatus.NOT_FOUND.value(),
                e.getError(),
                e.getLocalizedMessage());
    }

    @ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
    @ExceptionHandler(PaymentException.class)
    public ExceptionResponse handlePaymentException(PaymentException e) {

        log.error("Payment exception", e);

        return new ExceptionResponse(
                HttpStatus.PAYMENT_REQUIRED.value(),
                e.getError(),
                e.getLocalizedMessage());
    }

    @ExceptionHandler(GHNException.class)
    public ResponseEntity<ExceptionResponse> handleGHNException(GHNException e) {

        log.error("GHN exception", e);

        ExceptionResponse response = new ExceptionResponse(
                e.getStatus().value(),
                e.getError(),
                e.getLocalizedMessage());

        return new ResponseEntity<>(response, e.getStatus());
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(EntityOwnershipException.class)
    public ExceptionResponse handleEntityOwnershipException(EntityOwnershipException e) {

        log.error("Entity ownership exception", e);

        return new ExceptionResponse(
                HttpStatus.FORBIDDEN.value(),
                e.getError(),
                e.getLocalizedMessage());
    }

    @ResponseStatus(HttpStatus.EXPECTATION_FAILED)
    @ExceptionHandler(ImageResizerException.class)
    public ExceptionResponse handleImageResizerException(ImageResizerException e) {

        log.error("Image resizer failed", e);

        return new ExceptionResponse(
                HttpStatus.EXPECTATION_FAILED.value(),
                e.getError(),
                e.getLocalizedMessage());
    }

    @ResponseStatus(HttpStatus.EXPECTATION_FAILED)
    @ExceptionHandler(ImageUploadException.class)
    public ExceptionResponse handleImageUploadException(ImageUploadException e) {

        log.error("Image upload failed", e);

        return new ExceptionResponse(
                HttpStatus.EXPECTATION_FAILED.value(),
                e.getError(),
                e.getLocalizedMessage());
    }

    @ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ExceptionResponse handleMaxSizeException(MaxUploadSizeExceededException e) {

        String message = messageService.getMessage("exception.image.size",
                new Object[] { e.getMaxUploadSize() / 1024 / 1024 });
        log.error(message, e);

        return new ExceptionResponse(
                e.getStatusCode().value(),
                AppConstants.FILE_SIZE_EXCEED_MAXIMUM_LIMIT,
                message);
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(AuthorizationDeniedException.class)
    public ExceptionResponse handleAuthorizationDeniedException(AuthorizationDeniedException e) {

        String message = messageService.getMessage("exception.authorization.failed");
        log.error(message, e);

        return new ExceptionResponse(
                HttpStatus.FORBIDDEN.value(),
                AppConstants.AUTHORIZATION_FAILED,
                message);
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(BadCredentialsException.class)
    public ExceptionResponse handleBadCredentialsException(BadCredentialsException e) {

        log.error("Bad credentials", e);

        return new ExceptionResponse(
                HttpStatus.FORBIDDEN.value(),
                AppConstants.AUTHORIZATION_FAILED,
                e.getLocalizedMessage());
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(TokenRefreshException.class)
    public ExceptionResponse handleTokenRefreshException(TokenRefreshException e) {

        log.error("Token refresh failed", e);

        return new ExceptionResponse(
                HttpStatus.FORBIDDEN.value(),
                e.getError(),
                e.getLocalizedMessage());
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(ResetPasswordException.class)
    public ExceptionResponse handleResetPasswordException(ResetPasswordException e) {

        log.error("Reset password failed", e);

        return new ExceptionResponse(
                HttpStatus.FORBIDDEN.value(),
                e.getError(),
                e.getLocalizedMessage());
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    @ExceptionHandler(CaptchaInvalidException.class)
    public ExceptionResponse handleInvalidCaptchaException(CaptchaInvalidException e) {

        log.error("Invalid captcha", e);

        return new ExceptionResponse(
                HttpStatus.FORBIDDEN.value(),
                e.getError(),
                e.getLocalizedMessage());
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ExceptionResponse handleValidationException(HttpMessageNotReadableException e) {

        String message = messageService.getMessage("exception.invalid.argument");
        log.error(message, e);

        if (e.getCause() instanceof InvalidFormatException ifx) {
            if (ifx.getTargetType() != null && ifx.getTargetType().isEnum()) {

                message = messageService.getMessage("exception.invalid.enum", new Object[] {
                        ifx.getValue(),
                        ifx.getPath().get(ifx.getPath().size() - 1).getFieldName(),
                        Arrays.toString(ifx.getTargetType().getEnumConstants())
                });
            }
        }

        return new ExceptionResponse(
                HttpStatus.BAD_REQUEST.value(),
                AppConstants.INVALID_ARGUMENT,
                message);
    }

    @ResponseStatus(HttpStatus.EXPECTATION_FAILED)
    @ExceptionHandler(IOException.class)
    public ExceptionResponse handleUploadImageException(IOException e) {

        String message = messageService.getMessage("exception.image.upload");
        log.error(message, e);

        return new ExceptionResponse(
                HttpStatus.EXPECTATION_FAILED.value(),
                AppConstants.UPLOAD_IMAGE_FAILED,
                message);
    }
}
