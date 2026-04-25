package com.ring.dto.response.ghn;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GHNFeeResponse extends BaseGHNResponse {
    private GHNFeeData data;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GHNFeeData {
        private Integer total;
    }
}
