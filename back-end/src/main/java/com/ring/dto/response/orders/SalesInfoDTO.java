package com.ring.dto.response.orders;

import java.util.List;

/**
 * Represents a sales info response as {@link SalesInfoDTO}.
 */
public record SalesInfoDTO(Double total, List<String> months, List<Double> sales) {

}
