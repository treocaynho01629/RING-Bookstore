package com.ring.service;

import com.ring.dto.request.RegisterRequest;
import com.ring.dto.request.ResetPassRequest;
import com.ring.model.entity.Account;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Service interface for handling user registration operations.
 */
public interface RegisterService {

    /**
     * Performs user login based on the provided login request.
     *
     * @param registerRequest   The registration request containing user details.
     * @param request           The servlet request containing reCAPTCHA score in the header.
     * @return The registered user entity.
     */
    Account register(RegisterRequest registerRequest, HttpServletRequest request);

    /**
     * Initiates the forgot password process for the given email address.
     * Sends a reset password link or token to the user's email.
     *
     * @param email   The email address of the user requesting password reset.
     * @param request The servlet request containing reCAPTCHA score in the header.
     */
    void forgotPassword(String email, HttpServletRequest request);

    /**
     * Resets the user's password using the provided reset token and new password details.
     *
     * @param token         The reset password token sent to the user's email.
     * @param resetRequest  The request body containing the new password details.
     * @param request       The servlet request containing reCAPTCHA score in the header.
     * @return The updated {@link Account} after password has been successfully reset.
     */
    Account resetPassword(String token, ResetPassRequest resetRequest, HttpServletRequest request);
}
