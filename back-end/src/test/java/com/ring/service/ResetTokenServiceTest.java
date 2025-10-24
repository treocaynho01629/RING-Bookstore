package com.ring.service;

import com.ring.base.AbstractServiceTest;
import com.ring.exception.ResetPasswordException;
import com.ring.model.entity.Account;
import com.ring.repository.AccountRepository;
import com.ring.service.impl.ResetTokenServiceImpl;
import com.ring.service.impl.TokenServiceImpl;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ResetTokenServiceTest extends AbstractServiceTest {

        @Mock
        private AccountRepository accRepo;

        @Mock
        private TokenServiceImpl tokenService;

        @InjectMocks
        private ResetTokenServiceImpl resetTokenService;

        private final String token = "reset-token-123";
        private final Account account = Account.builder()
                        .id(1L)
                        .username("test")
                        .pass("test")
                        .resetToken(token)
                        .build();

        @Test
        void givenValidAccount_whenGenerateResetToken_thenReturnToken() {

                // When
                when(tokenService.generateCustomToken(eq(account.getUsername()),
                                anyLong(),
                                eq(account.getPassword()))).thenReturn(token);

                // Then
                String result = resetTokenService.generateResetToken(account);

                assertNotNull(result);
                assertEquals(token, result);

                // Verify
                verify(tokenService, times(1)).generateCustomToken(eq(account.getUsername()),
                                anyLong(),
                                eq(account.getPassword()));
                verify(accRepo, times(1)).save(account);
        }

        @Test
        void givenValidToken_whenVerifyResetToken_thenReturnTrue() {

                // When
                when(tokenService.extractCustomUsername(eq(token),
                                eq(account.getPassword()))).thenReturn(account.getUsername());
                when(tokenService.isCustomTokenValid(eq(token),
                                eq(account.getUsername()),
                                eq(account.getPassword()))).thenReturn(true);

                // Then
//                boolean result = resetTokenService.verifyResetToken(account);
//                assertTrue(result);

                // Verify
                verify(tokenService, times(1)).extractCustomUsername(eq(token),
                                eq(account.getPassword()));
                verify(tokenService).isCustomTokenValid(eq(token),
                                eq(account.getUsername()),
                                eq(account.getPassword()));
                verify(accRepo, never()).save(account);
        }

        @Test
        void givenExpiredToken_whenVerifyResetToken_thenThrowException() {

                // When
                when(tokenService.extractCustomUsername(eq(token),
                                eq(account.getPassword()))).thenReturn(account.getUsername());
                when(tokenService.isCustomTokenValid(eq(token),
                                eq(account.getUsername()),
                                eq(account.getPassword()))).thenReturn(false);

                // Then
                assertThrows(ResetPasswordException.class,
                                () -> resetTokenService.verifyResetToken(account));

                // Verify
                verify(tokenService, times(1)).extractCustomUsername(eq(token),
                                eq(account.getPassword()));
                verify(tokenService, times(1)).isCustomTokenValid(eq(token),
                                eq(account.getUsername()),
                                eq(account.getPassword()));
                verify(accRepo, times(1)).save(account);
        }

        @Test
        void givenToken_whenClearResetToken_thenClearSuccessfully() {

                // When
                doNothing().when(accRepo).clearResetToken(token);

                // Then
                resetTokenService.clearResetToken(token);

                // Verify
                verify(accRepo, times(1)).clearResetToken(token);
        }
}