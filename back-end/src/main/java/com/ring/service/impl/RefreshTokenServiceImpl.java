package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.exception.TokenRefreshException;
import com.ring.model.entity.Account;
import com.ring.model.entity.RefreshToken;
import com.ring.repository.AccountRepository;
import com.ring.repository.RefreshTokenRepository;
import com.ring.service.RefreshTokenService;
import com.ring.service.TokenService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

	private final AccountRepository accountRepo;
	private final RefreshTokenRepository refreshTokenRepo;

	private final TokenService tokenService;
	private final MessageService messageService;

	public Account verifyRefreshToken(String token) {

		// Check exists
		if (token == null || token.isEmpty()) {

			var errorMsg = messageService.getMessage("exception.invalid",
					new Object[]{ AppConstants.REFRESH_TOKEN_LABEL });
			throw new HttpResponseException(HttpStatus.BAD_REQUEST, 
					AppConstants.INVALID_ARGUMENT, 
					errorMsg);
		}
			

		// Find user with token
		String username = tokenService.extractRefreshUsername(token);
		Account user = accountRepo.findByRefreshTokenAndUsername(token, username)
				.orElseThrow(() -> {
					var errorMsg = messageService.getMessage("exception.not.found",
							new Object[]{ AppConstants.REFRESH_TOKEN_LABEL });
					return new ResourceNotFoundException(errorMsg);
				});

		// Verify token
		if (username != null) {
			if (!tokenService.isRefreshTokenValid(token, username)) { // Invalidate token

				// Remove token
				refreshTokenRepo.deleteByRefreshToken(token);	
				var errorMsg = messageService.getMessage("exception.refresh.token.expired");
				throw new TokenRefreshException(errorMsg);
			}
		}

		return user;
	}

	@Transactional
	public ResponseCookie generateRefreshCookie(Account user){

		String token = tokenService.generateRefreshToken(user); // New refresh token
		RefreshToken refreshToken = RefreshToken.builder()
				.refreshToken(token)
				.user(user)
				.build();

		// Set token
		refreshTokenRepo.save(refreshToken);
		return tokenService.generateRefreshCookie(token);
	}

	@Transactional
	public void clearRefreshToken(String token) {
		refreshTokenRepo.deleteByRefreshToken(token);
	}

	public ResponseCookie clearRefreshCookie() {
		return tokenService.clearRefreshCookie();
	}
}