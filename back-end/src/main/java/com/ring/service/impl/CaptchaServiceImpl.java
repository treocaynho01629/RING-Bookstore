package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.config.captcha.TurnstileSettings;
import com.ring.dto.response.TurnstileResponse;
import com.ring.exception.CaptchaInvalidException;
import com.ring.service.CaptchaService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * Service class for managing captcha using Cloudflare Turnstile.
 */
@RequiredArgsConstructor
@Service
public class CaptchaServiceImpl implements CaptchaService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    protected final HttpServletRequest request;
    protected final TurnstileSettings turnstileSettings;
    protected final CaptchaProtectionService captchaProtectionService;
    protected final RestTemplate restTemplate;

    private final MessageService messageService;

    public static final String LOGIN_ACTION = "login";
    public static final String REGISTER_ACTION = "register";
    public static final String FORGOT_ACTION = "forgot";
    public static final String RESET_ACTION = "reset";
    public static final String CHECKOUT_ACTION = "checkout";
    public static final String PAYMENT_ACTION = "payment";

    public void validate(String turnstileToken, String source, final String action) throws CaptchaInvalidException {

        if (captchaProtectionService.isBlocked(getClientIP())) {
            var errorMsg = messageService.getMessage("exception.captcha.protection");
            throw new CaptchaInvalidException(AppConstants.INVALID_CAPTCHA, errorMsg);
        }

        if (turnstileToken == null || turnstileToken.isBlank()) {
            var errorMsg = messageService.getMessage("exception.captcha.invalid");
            throw new CaptchaInvalidException(AppConstants.INVALID_CAPTCHA, errorMsg);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("secret", turnstileSettings.getSecret());
        map.add("response", turnstileToken);
        map.add("remoteip", getClientIP());

        HttpEntity<MultiValueMap<String, String>> httpEntity = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<TurnstileResponse> responseEntity = restTemplate.exchange(
                    turnstileSettings.getUrl(),
                    HttpMethod.POST,
                    httpEntity,
                    TurnstileResponse.class);

            TurnstileResponse turnstileResponse = responseEntity.getBody();

            if (turnstileResponse != null) {
                log.debug("Turnstile response: {}", turnstileResponse);

                if (!turnstileResponse.isSuccess()) {
                    if (turnstileResponse.hasClientError()) {
                        captchaProtectionService.captchaFailed(getClientIP());
                    }
                    var errorMsg = messageService.getMessage("exception.captcha.invalid");
                    throw new CaptchaInvalidException(AppConstants.INVALID_CAPTCHA, errorMsg);
                }

                if (action != null && !action.isBlank()
                        && turnstileResponse.getAction() != null
                        && !action.equals(turnstileResponse.getAction())) {
                    var errorMsg = messageService.getMessage("exception.captcha.invalid");
                    throw new CaptchaInvalidException(AppConstants.INVALID_CAPTCHA, errorMsg);
                }
            } else {
                var errorMsg = messageService.getMessage("exception.captcha.failed");
                throw new CaptchaInvalidException(AppConstants.INVALID_CAPTCHA, errorMsg);
            }
        } catch (CaptchaInvalidException e) {
            throw e;
        } catch (HttpClientErrorException e) {
            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.captcha.failed");
            throw new CaptchaInvalidException(AppConstants.INVALID_CAPTCHA, errorMsg);
        }

        captchaProtectionService.captchaSucceeded(getClientIP());
    }

    /**
     * Get the client IP address.
     *
     * @return The client IP address.
     */
    protected String getClientIP() {
        final String xfHeader = request.getHeader(com.google.common.net.HttpHeaders.X_FORWARDED_FOR);
        if (xfHeader == null || xfHeader.isEmpty() || !xfHeader.contains(request.getRemoteAddr())) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(AppConstants.DELIMITER)[0];
    }
}
