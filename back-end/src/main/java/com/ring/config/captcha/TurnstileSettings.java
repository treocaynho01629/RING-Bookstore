package com.ring.config.captcha;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration for Cloudflare Turnstile parameters used in token validation.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "cloudflare.turnstile")
public class TurnstileSettings {

    private String secret;
    private String url;
}
