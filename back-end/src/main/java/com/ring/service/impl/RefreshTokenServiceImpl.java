package com.ring.service.impl;

import com.ring.exception.TokenRefreshException;
import com.ring.model.entity.Account;
import com.ring.model.entity.RefreshToken;
import com.ring.repository.AccountRepository;
import com.ring.repository.RefreshTokenRepository;
import com.ring.service.RefreshTokenService;
import com.ring.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

	private final AccountRepository accountRepo;
	private final RefreshTokenRepository refreshTokenRepo;

	private final TokenService tokenService;

	/**
	 * Refreshes the authentication token using the refresh token from the HTTP request.
	 *
	 * @param token Refresh token value.
	 * @return The updated {@link Account} with a new authentication token.
	 */
	public Account refreshToken(String token) {
		if (token == null || token.isEmpty()) throw new TokenRefreshException(null, "Missing refresh token!");

		//Find token
		String username = tokenService.extractRefreshUsername(token);
		Account user = accountRepo.findByRefreshTokenAndUsername(token, username).orElseThrow(()
				-> new TokenRefreshException(token, "Refresh token not found!"));

		//Verify >> return new jwt token
		if (!this.verifyRefreshToken(token))  throw new TokenRefreshException(token, "Refresh token failed!");
		return user;
	}

	/**
	 * Generates a response cookie containing a refresh token for the given user account.
	 *
	 * @param user The user account for which the refresh token cookie is to be generated.
	 * @return A {@link ResponseCookie} containing the refresh token.
	 */
	@Transactional
	public ResponseCookie generateRefreshCookie(Account user){

		String token = tokenService.generateRefreshToken(user); //Generate refresh token
		RefreshToken refreshToken = RefreshToken.builder().refreshToken(token).user(user).build();

		//Set token
		refreshTokenRepo.save(refreshToken);
		return tokenService.generateRefreshCookie(token);
	}

	/**
	 * Clears the refresh token cookie by generating an empty cookie.
	 */
	@Transactional
	public void clearRefreshToken(String token) {
		refreshTokenRepo.deleteByRefreshToken(token);
	}

	/**
	 * Clears the refresh token cookie by generating an empty cookie.
	 *
	 * @return A {@link ResponseCookie} that removes the refresh token from the client.
	 */
	public ResponseCookie clearRefreshCookie() {
		return tokenService.clearRefreshCookie();
	}

	/**
	 * Verifies the validity and integrity of the provided refresh token.
	 *
	 * @param token The refresh token to verify.
	 * @return True if the refresh token is valid and not expired; otherwise, false.
	 */
	private boolean verifyRefreshToken(String token) {
		String username = tokenService.extractRefreshUsername(token); //Get username from token

		if (username != null) {
			if (!tokenService.isRefreshTokenValid(token, username)) { //Invalidate token
				//Remove token
				refreshTokenRepo.deleteByRefreshToken(token);
				throw new TokenRefreshException(token, "Refresh token expired. Please make a new sign in request!");
			}
		}

		return true;
	}
}