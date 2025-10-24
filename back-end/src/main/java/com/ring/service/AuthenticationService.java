package com.ring.service;

import com.ring.dto.request.AuthenticationRequest;
import com.ring.model.entity.Account;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Service interface for handling user authentication operations.
 */
public interface AuthenticationService {

    /**
     * Performs user login based on the provided login request.
     *
     * @param authRequest The login request containing user credentials.
     * @param request The servlet request containing reCAPTCHA score in the header.
     * @return The authed user entity.
     */
    Account authenticate(AuthenticationRequest authRequest, HttpServletRequest request);

}
