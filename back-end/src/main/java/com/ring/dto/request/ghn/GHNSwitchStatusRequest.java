package com.ring.dto.request.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GHNSwitchStatusRequest {
    @JsonProperty("order_codes")
    private List<String> orderCodes;
}

