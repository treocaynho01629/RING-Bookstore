package com.ring.dto.response.accounts;

import com.ring.model.enums.AddressType;
import lombok.Builder;

/**
 * Represents an address response as {@link AddressDTO}.
 */
@Builder
public record AddressDTO(Long id,
                String name,
                String companyName,
                String phone,
                String address,
                String detail,
                Integer provinceId,
                Integer districtId,
                String wardCode,
                AddressType type,
                Boolean isDefault) {
}
