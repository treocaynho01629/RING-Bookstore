package com.ring.config.security;

import com.google.common.net.HttpHeaders;
import com.ring.common.AppConstants;
import com.ring.service.impl.LoginProtectionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

/**
 * Listener for authentication failure events triggered due to bad credentials.
 *
 * This component listens for {@link AuthenticationFailureBadCredentialsEvent} and interacts with
 * {@link LoginProtectionService} to track failed login attempts, helping to prevent brute-force attacks.
 */
@Component
@RequiredArgsConstructor
public class AuthenticationFailureListener implements ApplicationListener<AuthenticationFailureBadCredentialsEvent> {

    private final LoginProtectionService loginProtectionService;

    /**
     * Handles the {@link AuthenticationFailureBadCredentialsEvent} by identifying the client's IP address
     * and recording a failed login attempt through {@link LoginProtectionService}.
     *
     * @param e The event triggered when authentication fails due to bad credentials.
     */
    @Override
    public void onApplicationEvent(final AuthenticationFailureBadCredentialsEvent e) {

        RequestAttributes attribs = RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = (HttpServletRequest) ((NativeWebRequest) attribs).getNativeRequest();
        final String xfHeader = request.getHeader(HttpHeaders.X_FORWARDED_FOR);
        
        if (xfHeader == null || xfHeader.isEmpty() || !xfHeader.contains(request.getRemoteAddr())) {
            loginProtectionService.loginFailed(request.getRemoteAddr());
        } else {
            loginProtectionService.loginFailed(xfHeader.split(AppConstants.DELIMITER)[0]);
        }
    }
}
