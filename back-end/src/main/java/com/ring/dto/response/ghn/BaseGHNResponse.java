package com.ring.dto.response.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BaseGHNResponse {
    private Integer code;

    private String message;

    @JsonProperty("code_message_value")
    private String codeMessageValue;
}
