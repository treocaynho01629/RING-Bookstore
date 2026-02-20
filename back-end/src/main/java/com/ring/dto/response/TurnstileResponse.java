package com.ring.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.Collections;
import java.util.List;

/**
 * Represents Cloudflare Turnstile Siteverify API response.
 *
 * @see <a href="https://developers.cloudflare.com/turnstile/get-started/server-side-validation">Cloudflare Turnstile docs</a>
 */
@Getter
@Setter
public class TurnstileResponse {

    private boolean success;

    @JsonProperty("challenge_ts")
    private String challengeTs;

    private String hostname;

    @JsonProperty("error-codes")
    private List<String> errorCodes = Collections.emptyList();

    private String action;
    private String cdata;

    @JsonIgnore
    public boolean hasClientError() {
        if (errorCodes == null) {
            return false;
        }
        return errorCodes.stream()
                .anyMatch(code -> "invalid-input-response".equals(code)
                        || "missing-input-response".equals(code)
                        || "bad-request".equals(code));
    }
}
