package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.dto.projection.accounts.IAddress;
import com.ring.dto.request.AddressRequest;
import com.ring.dto.response.accounts.AddressDTO;
import com.ring.exception.EntityOwnershipException;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.AddressMapper;
import com.ring.model.entity.Account;
import com.ring.model.entity.AccountProfile;
import com.ring.model.entity.Address;
import com.ring.repository.AccountProfileRepository;
import com.ring.repository.AddressRepository;
import com.ring.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for managing addresses.
 */
@RequiredArgsConstructor
@Service
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepo;
    private final AccountProfileRepository profileRepo;

    private final MessageService messageService;

    private final AddressMapper addressMapper;

    @Cacheable(cacheNames = AppConstants.ADDRESSES, key = "#user.id")
    public List<AddressDTO> getMyAddresses(Account user) {
        List<IAddress> addresses = addressRepo.findAddressesByProfile(user.getProfile().getId());
        return addresses.stream().map(addressMapper::projectionToDTO).toList();
    }

    @Cacheable(cacheNames = AppConstants.USER_ADDRESS, key = "#user.id")
    public AddressDTO getMyAddress(Account user) {
        IAddress address = addressRepo.findAddressByProfile(user.getProfile().getId());
        return addressMapper.projectionToDTO(address);
    }

    @Cacheable(cacheNames = AppConstants.ADDRESS, key = "#id")
    public Address getAddress(Long id) {
        return addressRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.user.address") });
                    return new ResourceNotFoundException(errorMsg);
                });
    }

    @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.ADDRESSES,
                AppConstants.USER_ADDRESS },
                key = "#user.id") },
                put = { @CachePut(cacheNames = AppConstants.ADDRESS,
                            key = "#result.id",
                            condition = "#result != null") })
    @Transactional
    public Address addAddress(AddressRequest request, Account user) {
        AccountProfile profile = profileRepo.findById(user.getProfile().getId())
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.user.profile") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Limit size
        int currSize = profile.getAddresses() != null ? profile.getAddresses().size() : 0;
        if (currSize >= AppConstants.MAX_ADDRESSES_SIZE) {
            var errorMsg = messageService.getMessage("exception.address.size",
                    new Object[]{ AppConstants.MAX_ADDRESSES_SIZE });
            throw new HttpResponseException(HttpStatus.CONFLICT
                    , AppConstants.ADDRESS_SIZE_LIMIT
                    , errorMsg);
        }

        // Create address
        var address = Address.builder()
                .name(request.getName())
                .companyName(request.getCompanyName())
                .phone(request.getPhone())
                .city(request.getCity())
                .address(request.getAddress())
                .type(request.getType())
                .profile(profile)
                .build();

        Address savedAddress = addressRepo.save(address); // Save address

        // Default address
        if (request.getIsDefault() || currSize == 0) {
            profile.setAddress(savedAddress);
        }

        profileRepo.save(profile); // Save profile
        return savedAddress;
    }

    @Caching(
        evict = { @CacheEvict(cacheNames = { AppConstants.ADDRESSES, AppConstants.USER_ADDRESS }, key = "#user.id") },
        put = { @CachePut(cacheNames = AppConstants.ADDRESS, key = "#id", condition = "#result != null") })
    @Transactional
    public Address updateAddress(AddressRequest request, Long id, Account user) {

        Address address = addressRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.user.address") });
                    return new ResourceNotFoundException(errorMsg);
                });

        AccountProfile addressProfile = address.getProfile();
        AccountProfile profile = user.getProfile();
        if (profile == null || !addressProfile.getId().equals(profile.getId())) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[]{ new DefaultMessageSourceResolvable("label.user.profile") });
            throw new EntityOwnershipException(errorMsg);
        }

        // Update
        address.setName(request.getName());
        address.setCompanyName(request.getCompanyName());
        address.setPhone(request.getPhone());
        address.setCity(request.getCity());
        address.setAddress(request.getAddress());
        address.setType(request.getType());

        // Save
        Address updatedAddress = addressRepo.save(address);

        // Default address
        if (request.getIsDefault() 
            && address.getId() != addressProfile.getAddress().getId()) {

            // Move to address list
            addressProfile.addAddress(addressProfile.getAddress());

            // Set new default
            addressProfile.setAddress(address);

            // Save profile
            profileRepo.save(addressProfile); 
        }

        return updatedAddress;
    }

    @Caching(evict = { @CacheEvict(cacheNames = AppConstants.ADDRESS, key = "#id"),
            @CacheEvict(cacheNames = AppConstants.USER_ADDRESS, key = "#user.id"),
            @CacheEvict(cacheNames = AppConstants.ADDRESSES, key = "#user.id") })
    @Transactional
    public Address deleteAddress(Long id, Account user) {
        Address address = addressRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.user.address") });
                    return new ResourceNotFoundException(errorMsg);
                });

        if (!address.getProfile().getId().equals(user.getProfile().getId())) {
            var errorMsg = messageService.getMessage("exception.ownership",
                    new Object[]{ new DefaultMessageSourceResolvable("label.user.address") });
            throw new EntityOwnershipException(errorMsg);
        }

        addressRepo.deleteById(id); // Delete from database
        return address;
    }
}
