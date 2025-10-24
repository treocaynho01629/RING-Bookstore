package com.ring.service;

import com.ring.dto.request.AddressRequest;
import com.ring.dto.response.accounts.AddressDTO;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.model.entity.Account;
import com.ring.model.entity.Address;

import java.util.List;

/**
 * Service interface for handling address-related operations.
 */
public interface AddressService {

    /**
     * Retrieves all user's addresses.
     *
     * @param user the account for which the addresses are to be retrieved.
     * @return a list of {@link AddressDTO} objects representing the addresses of the user.
     */
    List<AddressDTO> getMyAddresses(Account user);

    /**
     * Retrieves user's default address.
     *
     * @param user the account for which the address is to be retrieved.
     * @return The {@link AddressDTO} representing the default address of the user.
     */
    AddressDTO getMyAddress(Account user);

    /**
     * Retrieves an address by its ID.
     *
     * @param id the ID of the address to retrieve.
     * @return The {@link Address} corresponding to the provided id.
     * @throws ResourceNotFoundException if no address is found with the given id.
     */
    Address getAddress(Long id);

    /**
     * Creates a new address.
     *
     * @param request the address creation details.
     * @param user The Account object representing the currently authenticated user.
     * @return the newly created and saved {@link Address}
     * @throws ResourceNotFoundException if the associated profile is not found.
     * @throws HttpResponseException if the maximum number of addresses (5) is exceeded.
     */
    Address addAddress(AddressRequest request,
                       Account user);

    /**
     * Updates an existing address by its ID.
     *
     * @param id the ID of the address to update.
     * @param request the address update details.
     * @param user The user attempting to delete the address, whose profile is verified.
     * @return The updated {@link Address} object after applying the changes.
     * @throws ResourceNotFoundException if the specified address ID does not exist.
     * @throws HttpResponseException if the user does not have permission to update the address.
     */
    Address updateAddress(AddressRequest request,
                          Long id,
                          Account user);

    /**
     * Deletes an address by its ID.
     *
     * @param id the ID of the address to delete.
     * @return The deleted {@link Address} instance.
     * @throws ResourceNotFoundException If the address with the specified ID does not exist.
     * @throws HttpResponseException     If the address does not belong to the provided user.
     */
    Address deleteAddress(Long id,
                          Account user);
}
