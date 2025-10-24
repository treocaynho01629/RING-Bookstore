package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.dto.request.RegisterRequest;
import com.ring.dto.request.ResetPassRequest;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.listener.events.OnRegistrationCompleteEvent;
import com.ring.listener.events.OnResetPasswordCompletedEvent;
import com.ring.listener.events.OnResetTokenCreatedEvent;
import com.ring.model.entity.Account;
import com.ring.model.entity.AccountProfile;
import com.ring.model.entity.Role;
import com.ring.model.enums.UserRole;
import com.ring.repository.AccountRepository;
import com.ring.repository.RoleRepository;
import com.ring.service.CaptchaService;
import com.ring.service.RegisterService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RegisterServiceImpl implements RegisterService {

	private final AccountRepository accountRepo;
	private final RoleRepository roleRepo;

	private final CaptchaService captchaService;
	private final ResetTokenServiceImpl resetService;
	private final MessageService messageService;

	private final PasswordEncoder passwordEncoder;
	private final ApplicationEventPublisher eventPublisher;

	/**
	 * Performs user login based on the provided login request.
	 *
	 * @param registerRequest The registration request containing user details.
	 * @param request         The HTTP request containing reCAPTCHA score in the
	 *                        header.
	 * @return The registered user entity.
	 */
	public Account register(RegisterRequest registerRequest, HttpServletRequest request) {

		// Recaptcha
		final String recaptchaToken = request.getHeader(AppConstants.HEADER_RESPONSE);
		final String source = request.getHeader(AppConstants.HEADER_RECAPTCHA_SOURCE);
		captchaService.validate(recaptchaToken, source, CaptchaServiceImpl.REGISTER_ACTION);

		// Check user with this username already exists
		if (accountRepo.existsByUsernameOrEmail(registerRequest.getUsername(), registerRequest.getEmail())) {

			var errorMsg = messageService.getMessage("exception.user.existed");
			throw new HttpResponseException(
					HttpStatus.CONFLICT,
					AppConstants.USER_EXISTED,
					errorMsg);
		} else {
			// Set role for USER
			Set<Role> roles = new HashSet<>();
			roles.add(roleRepo.findByRoleName(UserRole.ROLE_USER)
					.orElseThrow(() -> {
						var errorMsg = messageService.getMessage("exception.not.found",
								new Object[]{ new DefaultMessageSourceResolvable("label.user.role") });
						return new ResourceNotFoundException(errorMsg);
					}));

			// Create and set new Account info
			var user = Account.builder()
					.username(registerRequest.getUsername())
					.pass(passwordEncoder.encode(registerRequest.getPass()))
					.email(registerRequest.getEmail())
					.roles(roles)
					.build();

			user.setProfile(new AccountProfile());
			accountRepo.save(user); // Save to database

			// Trigger email event
			eventPublisher.publishEvent(new OnRegistrationCompleteEvent(
					registerRequest.getUsername(),
					registerRequest.getEmail()));
			return user;
		}
	}

	/**
	 * Initiates the forgot password process for the given email address.
	 * Sends a reset password link to the user's email.
	 *
	 * @param email   The email address of the user requesting password reset.
	 * @param request The HTTP request containing reCAPTCHA score in the header.
	 */
	public void forgotPassword(String email, HttpServletRequest request) {

		// Recaptcha
		final String recaptchaToken = request.getHeader(AppConstants.HEADER_RESPONSE);
		final String source = request.getHeader(AppConstants.HEADER_RECAPTCHA_SOURCE);
		captchaService.validate(recaptchaToken, source, CaptchaServiceImpl.FORGOT_ACTION);

		// Get all accounts with this email
		Account user = accountRepo.findByEmail(email)
				.orElseThrow(() -> {
					var errorMsg = messageService.getMessage("exception.not.found",
							new Object[]{ new DefaultMessageSourceResolvable("label.user") });
					return new ResourceNotFoundException(errorMsg);
				});

		// Generate reset password token
		String token = resetService.generateResetToken(user);

		// Email event
		eventPublisher.publishEvent(new OnResetTokenCreatedEvent(
				user.getUsername(),
				user.getEmail(),
				token));
	}

	/**
	 * Resets the user's password using the provided reset token and new password
	 * details.
	 *
	 * @param token        The reset password token sent to the user's email.
	 * @param resetRequest The request body containing the new password details.
	 * @param request      The HTTP request containing reCAPTCHA score in the
	 *                     header.
	 * @return The updated {@link Account} after password has been successfully
	 *         reset.
	 */
	public Account resetPassword(String token, ResetPassRequest resetRequest, HttpServletRequest request) {

		// Recaptcha
		final String recaptchaToken = request.getHeader(AppConstants.HEADER_RESPONSE);
		final String source = request.getHeader(AppConstants.HEADER_RECAPTCHA_SOURCE);
		captchaService.validate(recaptchaToken, source, CaptchaServiceImpl.RESET_ACTION);

		// Find token
		Account user = accountRepo.findByResetToken(token)
				.orElseThrow(() -> {
					var errorMsg = messageService.getMessage("exception.not.found",
							new Object[]{ new DefaultMessageSourceResolvable("label.token.reset") });
					return new ResourceNotFoundException(errorMsg);
				});

		// Verify
		resetService.verifyResetToken(user);

		// Validate new password
		if (!resetRequest.getNewPass().equals(resetRequest.getNewPassRe())) {

			var errorMsg = messageService.getMessage("exception.password.not.match");
			throw new HttpResponseException(
					HttpStatus.BAD_REQUEST,
					AppConstants.PASSWORD_NOT_MATCH,
					errorMsg);
		}

		// Change password and save to the database
		user.setPass(passwordEncoder.encode(resetRequest.getNewPass()));
		resetService.clearResetToken(token);
		accountRepo.save(user);

		// Email event
		eventPublisher.publishEvent(new OnResetPasswordCompletedEvent(
				user.getUsername(),
				user.getEmail()));
		return user;
	}

}