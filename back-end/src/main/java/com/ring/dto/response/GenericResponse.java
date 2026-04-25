package com.ring.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

/**
 * Generic API response containing a message.
 */
@Data
@Builder
@AllArgsConstructor
public class GenericResponse {

    private String message;
}
