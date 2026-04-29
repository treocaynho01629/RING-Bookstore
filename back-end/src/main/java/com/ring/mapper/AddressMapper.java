package com.ring.mapper;

import com.ring.dto.projection.accounts.IAddress;
import com.ring.dto.response.accounts.AddressDTO;
import com.ring.model.entity.Address;
import org.springframework.stereotype.Service;

/**
 * A mapper for {@link IAddress} to {@link AddressDTO}.
 */
@Service
public class AddressMapper {

    /**
     * Maps a {@link IAddress} to a {@link AddressDTO}.
     * 
     * @param projection the projection to map
     * @return the mapped {@link AddressDTO}
     */
    public AddressDTO projectionToDTO(IAddress projection) {

        Address address = projection != null ? projection.getAddress() : new Address();

        return new AddressDTO(address.getId(),
                address.getName(),
                address.getCompanyName(),
                address.getPhone(),
                address.getAddress(),
                address.getDetail(),
                address.getProvinceId(),
                address.getDistrictId(),
                address.getWardCode(),
                address.getType(),
                projection != null ? projection.getIsDefault() : false);
    }

    /**
     * Maps a {@link Address} to a {@link AddressDTO}.
     * 
     * @param address the entity to map
     * @return the mapped {@link AddressDTO}
     */
    public AddressDTO addressToDTO(Address address) {

        return new AddressDTO(address.getId(),
                address.getName(),
                address.getCompanyName(),
                address.getPhone(),
                address.getAddress(),
                address.getDetail(),
                address.getProvinceId(),
                address.getDistrictId(),
                address.getWardCode(),
                address.getType(),
                false);
    }
}
