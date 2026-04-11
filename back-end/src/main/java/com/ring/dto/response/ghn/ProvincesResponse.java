package com.ring.dto.response.ghn;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProvincesResponse {
    private Integer code;
    private String message;
    private List<ProvinceResponse> data;
}