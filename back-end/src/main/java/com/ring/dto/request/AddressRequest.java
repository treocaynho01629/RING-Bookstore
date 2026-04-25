package com.ring.dto.request;

import com.ring.model.enums.AddressType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an address request as {@link AddressRequest}.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddressRequest {

    @NotBlank(message = "{validation.constraints.not.blank}")
    @Size(max = 250, message = "{validation.constraints.size.max}")
    private String name;

    @Size(max = 250, message = "{validation.constraints.size.max}")
    private String companyName;

    @NotBlank(message = "{validation.constraints.not.blank}")
    @Pattern(regexp = "\\(?([0-9]{4})\\)?([ .-]?)([0-9]{3})\\2([0-9]{3})", message = "{validation.constraints.pattern}")
    private String phone;

    @NotBlank(message = "{validation.constraints.not.blank}")
    @Size(max = 200, message = "{validation.constraints.size.max}")
    private String address;

    @NotBlank(message = "{validation.constraints.not.blank}")
    @Size(max = 300, message = "{validation.constraints.size.max}")
    private String detail;

    @NotNull(message = "{validation.constraints.not.blank}")
    private Integer provinceId;

    @NotNull(message = "{validation.constraints.not.blank}")
    private Integer districtId;

    @NotNull(message = "{validation.constraints.not.blank}")
    private String wardCode;

    private AddressType type;

    @Builder.Default
    private Boolean isDefault = false;
}
