package com.ring.dto.response.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GHNGetStoresDataResponse {
    @JsonProperty("last_offset")
    private Integer lastOffset;

    private List<GHNStoreResponse> shops;
}

