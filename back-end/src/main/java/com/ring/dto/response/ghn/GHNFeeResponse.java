package com.ring.dto.response.ghn;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GHNFeeResponse {
    private Integer code;
    private String message;
    private GHNFeeDataResponse data;
}

