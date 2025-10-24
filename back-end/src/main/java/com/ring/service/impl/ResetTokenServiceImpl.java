package com.ring.service.impl;

import com.ring.exception.ResetPasswordException;
import com.ring.model.entity.Account;
import com.ring.repository.AccountRepository;
import com.ring.service.ResetTokenService;
import com.ring.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for managing password reset tokens associated with
 * user accounts.
 */
@Service
@RequiredArgsConstructor
public class ResetTokenServiceImpl implements ResetTokenService {

    private final AccountRepository accRepo;

    private final TokenService tokenService;
    private final MessageService messageService;

    private static final long EXPIRE_TOKEN_TIME = 86400000;

    @Transactional
    public String generateResetToken(Account user) {

        String token = tokenService.generateCustomToken(user.getUsername(),
                EXPIRE_TOKEN_TIME,
                user.getPassword());

        user.setResetToken(token);
        accRepo.save(user);
        return token;
    }

    public void verifyResetToken(Account user) {

        String key = user.getPassword();
        String token = user.getResetToken();
        String username = tokenService.extractCustomUsername(token, key); // Verify with sign in key

        if (username != null) {
            if (!tokenService.isCustomTokenValid(token, username, key)) { // Invalidate token

                user.setResetToken(null); // Remove reset token
                accRepo.save(user);

                var errorMsg = messageService.getMessage("exception.reset.token.expired");
                throw new ResetPasswordException(errorMsg);
            }
        }
    }

    @Transactional
    public void clearResetToken(String token) {

        accRepo.clearResetToken(token);
    }
}
