package com.ring.controller;

import com.ring.dto.request.AuthenticationRequest;
import com.ring.dto.request.RegisterRequest;
import com.ring.dto.request.ResetPassRequest;
import com.ring.dto.response.AuthenticationResponse;
import com.ring.exception.HttpResponseException;
import com.ring.model.entity.Account;
import com.ring.service.AuthenticationService;
import com.ring.service.RefreshTokenService;
import com.ring.service.RegisterService;
import com.ring.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller named {@link AuthenticationController}
 * for handling authentication-related requests such as registration, login, token refresh.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

	private final AuthenticationService authService;
	private final RegisterService registerService;
	private final TokenService tokenService;
	private final RefreshTokenService refreshService;

	/**
	 * Registers a new user.
	 *
	 * @param registerRequest 	The registration request containing user details.
	 * @param request 			The HTTP request containing reCAPTCHA score in the header.
	 * @return a {@link ResponseEntity} containing a success or failure message.
	 */
	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest registerRequest,
									  HttpServletRequest request) {
		Account newUser = registerService.register(registerRequest, request);
		return ResponseEntity.ok(newUser.getUsername() + " đã đăng ký thành công!");
	}

	/**
	 * Logs in a user and returns an access token.
	 *
	 * @param authRequest 	The login request containing user credentials.
	 * @param request 		The HTTP request containing reCAPTCHA score in the header.
	 * @param persist whether to persist the refresh token.
	 * @return a {@link ResponseEntity} containing the {@link AuthenticationResponse} with the JWT token and refresh token in headers cookie.
	 */
	@PostMapping("/authenticate")
	public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody @Valid AuthenticationRequest authRequest,
			@RequestParam(value = "persist", defaultValue = "true") Boolean persist,
			HttpServletRequest request) {
		//Generate new JWT & refresh token
		Account auth = authService.authenticate(authRequest, request);
		String jwtToken = tokenService.generateAccessToken(auth);

		//Set refresh token
		ResponseCookie refreshCookie;
		if (persist) {
			refreshCookie = refreshService.generateRefreshCookie(auth);
		} else {
			refreshCookie = refreshService.clearRefreshCookie();
		}

		return ResponseEntity.ok()
				.header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
				.body(new AuthenticationResponse(jwtToken));
	}

	/**
	 * Refreshes the authentication token using the refresh token from the HTTP request.
	 *
	 * @param request 		The HTTP request containing the refresh token in the cookie.
	 * @param refreshToken  The refresh token value.
	 * @return a {@link ResponseEntity} containing the new {@link AuthenticationResponse} with the refreshed JWT token.
	 */
	@GetMapping("/refresh-token")
	public ResponseEntity<AuthenticationResponse> refreshToken(HttpServletRequest request,
		   @RequestParam(required = false) String refreshToken) {

		//Generate new token
		String token = refreshToken != null ? refreshToken : tokenService.extractRefreshToken(request);
		if (token == null) throw new HttpResponseException(HttpStatus.BAD_REQUEST, "Phải bao gồm refresh token");

		Account auth = refreshService.refreshToken(token);
		String jwtToken = tokenService.generateAccessToken(auth);

		return ResponseEntity.ok().body(new AuthenticationResponse(jwtToken));
	}

	/**
	 * Sends a password recovery email to the user.
	 *
	 * @param email   The email address of the user requesting password reset.
	 * @param request The HTTP request containing reCAPTCHA score in the header.
	 * @return a {@link ResponseEntity} containing a success message.
	 */
	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(@RequestParam(value="email") String email,
											HttpServletRequest request){
		registerService.forgotPassword(email, request);

		return ResponseEntity.ok("Đã gửi email khôi phục mật khẩu!");
	}

	/**
	 * Resets the user's password using the provided reset token and new password details.
	 *
	 * @param token         The reset password token sent to the user's email.
	 * @param resetRequest  The request body containing the new password details.
	 * @param request       The HTTP request containing reCAPTCHA score in the header.
	 * @return a {@link ResponseEntity} containing a success message.
	 */
	@PutMapping("/reset-password/{token}")
	public ResponseEntity<?> resetPassword(@PathVariable("token") String token,
										   @Valid @RequestBody ResetPassRequest resetRequest,
											HttpServletRequest request){
		Account updatedUser = registerService.resetPassword(token, resetRequest, request);

		return ResponseEntity.ok("Người dùng " + updatedUser.getUsername() + " thay đổi mật khẩu thành công!");
	}
}
