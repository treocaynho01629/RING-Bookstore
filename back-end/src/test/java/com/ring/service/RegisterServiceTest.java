package com.ring.service;

import com.ring.base.AbstractServiceTest;
import com.ring.dto.request.RegisterRequest;
import com.ring.dto.request.ResetPassRequest;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResetPasswordException;
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
import com.ring.service.impl.RegisterServiceImpl;
import com.ring.service.impl.ResetTokenServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RegisterServiceTest extends AbstractServiceTest {

    @Mock
    private AccountRepository accountRepo;

    @Mock
    private RoleRepository roleRepo;

    @Mock
    private CaptchaService captchaService;

    @Mock
    private ResetTokenServiceImpl resetService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private RegisterServiceImpl registerService;

    private RegisterRequest registerRequest = RegisterRequest.builder()
            .username("testuser")
            .email("test@example.com")
            .pass("password123")
            .build();
    private ResetPassRequest resetPassRequest = ResetPassRequest.builder()
            .newPass("newpassword123")
            .newPassRe("newpassword123")
            .build();
    private Role userRole = Role.builder()
            .roleName(UserRole.ROLE_USER)
            .build();
    private Account account = Account.builder()
            .id(1L)
            .username("testuser")
            .email("test@example.com")
            .pass("encodedPassword")
            .roles(Set.of(userRole))
            .profile(new AccountProfile())
            .build();
    private String token;

    @BeforeEach
    public void setUp() {
        // Mock request headers
        when(request.getHeader("response")).thenReturn("recaptcha-token");
        when(request.getHeader("source")).thenReturn("web");
    }

    @Test
    public void givenValidRegisterRequest_whenRegister_thenReturnAccount() {

        // When
        when(accountRepo.existsByUsernameOrEmail(any(), any())).thenReturn(false);
        when(roleRepo.findByRoleName(UserRole.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(accountRepo.save(any())).thenReturn(account);

        // Then
        Account result = registerService.register(registerRequest, request);

        assertNotNull(result);
        assertEquals(account.getUsername(), result.getUsername());
        assertEquals(account.getEmail(), result.getEmail());

        // Verify
        verify(accountRepo, times(1)).existsByUsernameOrEmail(any(), any());
        verify(roleRepo, times(1)).findByRoleName(any());
        verify(passwordEncoder, times(1)).encode(any());
        verify(accountRepo, times(1)).save(any());
        verify(eventPublisher, times(1)).publishEvent(any(OnRegistrationCompleteEvent.class));
    }

    @Test
    public void givenExistingUsernameOrEmail_whenRegister_thenThrowException() {

        // When
        when(accountRepo.existsByUsernameOrEmail(any(), any())).thenReturn(true);

        // Then
        HttpResponseException exception = assertThrows(HttpResponseException.class,
                () -> registerService.register(registerRequest, request));
        assertEquals("User already existed!", exception.getError());
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());

        // Verify
        verify(accountRepo, times(1)).existsByUsernameOrEmail(any(), any());
        verify(roleRepo, never()).findByRoleName(any());
        verify(passwordEncoder, never()).encode(any());
        verify(accountRepo, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any(OnRegistrationCompleteEvent.class));
    }

    @Test
    public void givenValidRegisterRequest_whenRegisterWithNonExistingRole_thenThrowException() {

        // When
        when(accountRepo.existsByUsernameOrEmail(any(), any())).thenReturn(false);
        when(roleRepo.findByRoleName(UserRole.ROLE_USER)).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> registerService.register(registerRequest, request));
        assertEquals("No roles has been set!", exception.getError());

        // Verify
        verify(accountRepo, times(1)).existsByUsernameOrEmail(any(), any());
        verify(roleRepo, times(1)).findByRoleName(any());
        verify(passwordEncoder, never()).encode(any());
        verify(accountRepo, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any(OnRegistrationCompleteEvent.class));
    }

    @Test
    void givenValidEmail_whenForgotPassword_thenSendResetToken() {

        // When
        when(accountRepo.findByEmail(any())).thenReturn(Optional.of(account));
        when(resetService.generateResetToken(any())).thenReturn(token);

        // Then
        registerService.forgotPassword(account.getEmail(), request);

        // Verify
        verify(captchaService, times(1)).validate(any(), any(), any());
        verify(resetService, times(1)).generateResetToken(account);
        verify(eventPublisher, times(1)).publishEvent(any(OnResetTokenCreatedEvent.class));
    }

    @Test
    void givenNonExistingEmail_whenForgotPassword_thenThrowException() {

        // When
        when(accountRepo.findByEmail(any())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> registerService.forgotPassword("nonexisting@example.com", request));
        assertEquals("User with this email does not exist!", exception.getError());

        // Verify
        verify(captchaService, times(1)).validate(any(), any(), any());
        verify(resetService, never()).generateResetToken(account);
        verify(eventPublisher, never()).publishEvent(any(OnResetTokenCreatedEvent.class));
    }

    @Test
    void givenValidTokenAndPassword_whenResetPassword_thenUpdatePassword() {

        // When
        when(accountRepo.findByResetToken(any())).thenReturn(Optional.of(account));
//        doNothing().when(resetService.verifyResetToken(any()));
        when(passwordEncoder.encode(any())).thenReturn("newEncodedPassword");

        // Then
        Account result = registerService.resetPassword(token, resetPassRequest, request);

        assertNotNull(result);

        // Verify
        verify(captchaService, times(1)).validate(any(), any(), any());
        verify(resetService, times(1)).verifyResetToken(account);
        verify(resetService, times(1)).clearResetToken(token);
        verify(eventPublisher, times(1)).publishEvent(any(OnResetPasswordCompletedEvent.class));
    }

    @Test
    void givenInvalidToken_whenResetPassword_thenThrowException() {

        // Given
        when(accountRepo.findByResetToken(any())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResetPasswordException.class,
                () -> registerService.resetPassword("invalid-token", resetPassRequest, request));

        // Verify
        verify(captchaService, times(1)).validate(any(), any(), any());
        verify(resetService, never()).verifyResetToken(account);
        verify(resetService, never()).clearResetToken(token);
        verify(eventPublisher, never()).publishEvent(any(OnResetPasswordCompletedEvent.class));
    }

    @Test
    void givenMismatchedPasswords_whenResetPassword_thenThrowException() {

        // Given
        ResetPassRequest mismatchedRequest = ResetPassRequest.builder()
                .newPass("password1")
                .newPassRe("password2")
                .build();

        // When
        when(accountRepo.findByResetToken(any())).thenReturn(Optional.of(account));
//        when(resetService.verifyResetToken(any())).thenReturn(true);

        // Then
        HttpResponseException exception = assertThrows(HttpResponseException.class,
                () -> registerService.resetPassword(token, mismatchedRequest, request));
        assertEquals("Re input password does not match!", exception.getError());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());

        // Verify
        verify(captchaService, times(1)).validate(any(), any(), any());
        verify(resetService, times(1)).verifyResetToken(account);
        verify(resetService, never()).clearResetToken(token);
        verify(eventPublisher, never()).publishEvent(any(OnResetPasswordCompletedEvent.class));
    }
}