package com.ring.dto.response;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents a reCAPTCHA response as {@link RecaptchaResponse}.
 */
@Getter
@Setter
@NoArgsConstructor
public class RecaptchaResponse {

    private boolean success;
    private String challengeTs;
    private String action;
    private String hostname;
    private double score;

    private List<ErrorCode> errorCodes;

    enum ErrorCode {
        MissingSecret, InvalidSecret, MissingResponse, InvalidResponse, BadRequest, TimeoutOrDuplicate;

        private static Map<String, ErrorCode> errorsMap = new HashMap<>(6);

        static {
            errorsMap.put("missing-input-secret", MissingSecret);
            errorsMap.put("invalid-input-secret", InvalidSecret);
            errorsMap.put("missing-input-response", MissingResponse);
            errorsMap.put("invalid-input-response", InvalidResponse);
            errorsMap.put("bad-request", BadRequest);
            errorsMap.put("timeout-or-duplicate", TimeoutOrDuplicate);
        }

        @JsonCreator
        public static ErrorCode forValue(final String value) {
            return errorsMap.get(value.toLowerCase());
        }
    }

    @JsonIgnore
    public boolean hasClientError() {

        final List<ErrorCode> errors = getErrorCodes();

        if (errors == null) { 
            return false; 
        }

        for (final ErrorCode error : errors) {

            switch (error) {
                case InvalidResponse:
                case MissingResponse:
                case BadRequest:
                    return true;
                default:
                    break;
            }
        }
        return false;
    }

    @Override
    public String toString() {
        return "GoogleResponse{" + "success=" + success + 
            ", hostname='" + hostname + '\''+ 
            ", score='" + score + '\''+ 
            ", action='" + action+ '\'' + 
            ", errorCodes=" + errorCodes + '}';
    }
}