package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.dto.request.AuthenticationRequest;
import com.ring.exception.HttpResponseException;
import com.ring.model.entity.Account;
import com.ring.service.AuthenticationService;
import com.ring.service.CaptchaService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service class for handling user authentication operations.
 */
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

	private final Logger log = LoggerFactory.getLogger(getClass());

	private final LoginProtectionService loginProtectionService;
	private final CaptchaService captchaService;
	private final MessageService messageService;

	private final AuthenticationManager authenticationManager;


	/**
	 * Performs user login based on the provided login request.
	 *
	 * @param authRequest 	The login request containing user credentials.
	 * @param request 		The HTTP request containing reCAPTCHA score in the header.
	 * @return The authed user entity.
	 */
	public Account authenticate(AuthenticationRequest authRequest, HttpServletRequest request) {

		// Recaptcha (only after x number of failed attempts)
		if (loginProtectionService.isSuspicious()) {
			final String recaptchaToken = request.getHeader(AppConstants.HEADER_RESPONSE);
			final String source = request.getHeader(AppConstants.HEADER_RECAPTCHA_SOURCE);
			captchaService.validate(recaptchaToken, source, CaptchaServiceImpl.LOGIN_ACTION);
		}

		if (loginProtectionService.isBlocked()) {
			var errorMsg = messageService.getMessage("exception.login.protection");
			throw new HttpResponseException(HttpStatus.TOO_MANY_REQUESTS,
					AppConstants.TOO_MANY_LOGIN_ATTEMPTS,
					errorMsg);
		}

		// Validate token
		Account user;
		try {
			Authentication authentication = authenticationManager
					.authenticate(new UsernamePasswordAuthenticationToken(
							authRequest.getUsername(),
							authRequest.getPass())
					);
			SecurityContextHolder.getContext().setAuthentication(authentication); //All good >> security context
			user = (Account) authentication.getPrincipal();
		} catch (Exception e) {
			log.error(e.getMessage());
			var errorMsg = messageService.getMessage("exception.login.invalid");
			throw new BadCredentialsException(errorMsg);
		}

		return user;
	}
}