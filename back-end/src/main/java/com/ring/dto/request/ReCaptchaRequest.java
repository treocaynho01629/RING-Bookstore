package com.ring.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a reCaptcha request as {@link ReCaptchaRequest}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReCaptchaRequest {

	private String secret;

	private String response;

}
