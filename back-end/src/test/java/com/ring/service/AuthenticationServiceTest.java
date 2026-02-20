package com.ring.service;

import com.ring.base.AbstractServiceTest;
import com.ring.dto.request.AuthenticationRequest;
import com.ring.model.entity.Account;
import com.ring.service.impl.AuthenticationServiceImpl;
import com.ring.service.impl.LoginProtectionService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthenticationServiceTest extends AbstractServiceTest {

    @Mock
    private LoginProtectionService loginProtectionService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthenticationServiceImpl authService;

    @Test
    public void givenLoginRequest_whenAuthenticate_ThenReturnAuthedAccount() {

        // Given
        AuthenticationRequest authRequest = AuthenticationRequest.builder()
                .username("admin")
                .pass("123321")
                .build();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setParameter("response", "test");
        Account expected = Account.builder()
                .id(1L)
                .username("initial")
                .email("initialEmail@initial.com")
                .pass("password")
                .build();
        Authentication authentication = mock(Authentication.class);

        // When
        // when(loginProtectionService.isSuspicious()).thenReturn(false);
        when(loginProtectionService.isBlocked()).thenReturn(false);
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(expected);

        // Then
        Account result = authService.authenticate(authRequest, request);

        assertNotNull(result);
        assertEquals(expected.getUsername(), result.getUsername());

        // Verify
        // verify(loginProtectionService, times(1)).isSuspicious();
        verify(loginProtectionService, times(1)).isBlocked();
        verify(authenticationManager, times(1)).authenticate(any());
        verify(authentication, times(1)).getPrincipal();
    }

    @Test
    public void givenInvalidLoginRequest_WhenAuthenticate_ThenThrowsException() {

        // Given
        AuthenticationRequest authRequest = AuthenticationRequest.builder()
                .username("admin")
                .pass("123321")
                .build();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setParameter("response", "test");

        // When
        // when(loginProtectionService.isSuspicious()).thenReturn(false);
        when(loginProtectionService.isBlocked()).thenReturn(false);
        when(authenticationManager.authenticate(any())).thenReturn(null);

        // Then
        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> authService.authenticate(authRequest, request));
        assertEquals("Invalid Username or Password!", exception.getMessage());

        // Verify
        // verify(loginProtectionService, times(1)).isSuspicious();
        verify(loginProtectionService, times(1)).isBlocked();
        verify(authenticationManager, times(1)).authenticate(any());
    }
}