package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.config.captcha.CaptchaSettings;
import com.ring.dto.response.RecaptchaResponse;
import com.ring.exception.ReCaptchaInvalidException;
import com.ring.exception.ReCaptchaSuspiciousException;
import com.ring.service.CaptchaService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

/**
 * Service class for managing captcha.
 */
@RequiredArgsConstructor
@Service
public class CaptchaServiceImpl implements CaptchaService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    protected final HttpServletRequest request;
    protected final CaptchaSettings captchaSettings;
    protected final CaptchaProtectionService captchaProtectionService;
    protected final RestTemplate restTemplate;

    private final MessageService messageService;

    public static final String LOGIN_ACTION = "login";
    public static final String REGISTER_ACTION = "register";
    public static final String FORGOT_ACTION = "forgot";
    public static final String RESET_ACTION = "reset";
    public static final String CHECKOUT_ACTION = "checkout";
    public static final String PAYMENT_ACTION = "payment";

    private static final String RECAPTCHA_V2 = "v2";
    private static final String RECAPTCHA_V3 = "v3";

    public void validate(String recaptchaToken, String source, final String action) throws ReCaptchaInvalidException {

        if (captchaProtectionService.isBlocked(getClientIP())) {
            var errorMsg = messageService.getMessage("exception.recaptcha.protection");
            throw new ReCaptchaInvalidException(errorMsg);
        }

        // Validate
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String secretKey = source.equals(RECAPTCHA_V2)
                ? captchaSettings.getSecret()
                : captchaSettings.getV3Secret();

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("secret", secretKey);
        map.add("response", recaptchaToken);

        ResponseEntity<RecaptchaResponse> responseEntity = null;
        HttpEntity<MultiValueMap<String, String>> httpEntity = new HttpEntity<>(map, headers);

        try {
            responseEntity = restTemplate.exchange(
                    captchaSettings.getUrl(),
                    HttpMethod.POST,
                    httpEntity,
                    RecaptchaResponse.class);

            RecaptchaResponse recaptchaResponse = responseEntity.getBody();

            if (recaptchaResponse != null) {
                log.debug("reCaptcha response: {} ", recaptchaResponse);

                // Version check
                if (RECAPTCHA_V3.equals(source)) {
                    verifyV3(recaptchaResponse, action);
                } else if (RECAPTCHA_V2.equals(source)) {
                    verifyV2(recaptchaResponse);
                }
            }
        } catch (HttpClientErrorException e) {
            log.error(e.getMessage());
            var errorMsg = messageService.getMessage("exception.recaptcha.failed");
            throw new ReCaptchaInvalidException(errorMsg);
        }

        captchaProtectionService.captchaSucceeded(getClientIP());
    }

    /**
     * Verify the v3 recaptcha response.
     * 
     * @param response The recaptcha response.
     * @param action   The action.
     */
    protected void verifyV3(RecaptchaResponse response, final String action) {

        if (!response.isSuccess()
                || !response.getAction().equals(action)
                || response.getScore() < captchaSettings.getThreshold()) {

            if (response.hasClientError()) { // Protect against bad request attempts
                captchaProtectionService.captchaFailed(getClientIP());
            }
            var errorMsg = messageService.getMessage("exception.recaptcha.invalid");
            throw new ReCaptchaInvalidException(errorMsg);
        } else if (response.getScore() > captchaSettings.getThreshold()
                && response.getScore() < captchaSettings.getSuspicious()) {

            var errorMsg = messageService.getMessage("exception.recaptcha.suspicious");
            throw new ReCaptchaSuspiciousException(errorMsg);
        }
    }

    /**
     * Verify the v2 recaptcha response.
     * 
     * @param response The recaptcha response.
     */
    protected void verifyV2(RecaptchaResponse response) {
        if (!response.isSuccess()) {

            if (response.hasClientError()) {
                captchaProtectionService.captchaFailed(getClientIP());
            }

            var errorMsg = messageService.getMessage("exception.recaptcha.invalid");
            throw new ReCaptchaInvalidException(errorMsg);
        }
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
