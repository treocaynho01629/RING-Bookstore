package com.ring.dto.response.enums;

import java.util.Map;

/**
 * Represents an enum response as {@link EnumsDTO}.
 */
public record EnumsDTO(String name, Map<String, Map<String, Object>> enums) {

}
