package com.ring.controller;

import com.ring.config.CurrentAccount;
import com.ring.dto.request.AddressRequest;
import com.ring.dto.response.accounts.AddressDTO;
import com.ring.model.entity.Account;
import com.ring.model.entity.Address;
import com.ring.service.AddressService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller named {@link AddressController} for handling address-related
 * operations.
 * Exposes endpoints under "/api/addresses".
 */
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Validated
public class AddressController {

    private final AddressService addressService;

    /**
     * Retrieves user's default address.
     *
     * @param currUser the currently authenticated user.
     * @return a {@link ResponseEntity} containing the address.
     */
    @GetMapping
    public ResponseEntity<AddressDTO> getAddress(@CurrentAccount Account currUser) {

        AddressDTO address = addressService.getMyAddress(currUser);
        return new ResponseEntity<>(address, HttpStatus.OK);
    }

    /**
     * Retrieves all user's addresses.
     *
     * @param currUser the currently authenticated user.
     * @return a {@link ResponseEntity} containing a list of addresses.
     */
    @GetMapping("/saved")
    @PreAuthorize("hasRole('USER') and hasAuthority('read:address')")
    public ResponseEntity<List<AddressDTO>> getProfileAddresses(@CurrentAccount Account currUser) {

        List<AddressDTO> addresses = addressService.getMyAddresses(currUser);
        return new ResponseEntity<>(addresses, HttpStatus.OK);
    }

    /**
     * Retrieves an address by its ID.
     *
     * @param id the ID of the address to retrieve.
     * @return a {@link ResponseEntity} containing the address.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','GUEST') and hasAuthority('read:address')")
    public ResponseEntity<Address> getAddressById(@PathVariable("id") Long id) {

        Address address = addressService.getAddress(id);
        return new ResponseEntity<>(address, HttpStatus.OK);
    }

    /**
     * Creates a new address.
     *
     * @param request  the address creation details.
     * @param currUser the currently authenticated user.
     * @return a {@link ResponseEntity} containing the created address.
     */
    @PostMapping()
    @PreAuthorize("hasRole('USER') and hasAuthority('create:address')")
    public ResponseEntity<Address> addAddress(
            @Valid @RequestBody AddressRequest request,
            @CurrentAccount Account currUser) {

        Address address = addressService.addAddress(request, currUser);
        return new ResponseEntity<>(address, HttpStatus.CREATED);
    }

    /**
     * Updates an existing address by its ID.
     *
     * @param id       the ID of the address to update.
     * @param request  the address update details.
     * @param currUser the currently authenticated user.
     * @return a {@link ResponseEntity} containing the updated address.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('update:address')")
    public ResponseEntity<Address> updateAddress(
            @PathVariable("id") Long id,
            @Valid @RequestBody AddressRequest request,
            @CurrentAccount Account currUser) {

        Address address = addressService.updateAddress(request, id, currUser);
        return new ResponseEntity<>(address, HttpStatus.OK);
    }

    /**
     * Deletes an address by its ID.
     *
     * @param id the ID of the address to delete.
     * @return a {@link ResponseEntity} containing the deleted address.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') and hasAuthority('delete:address')")
    public ResponseEntity<Address> deleteAddress(
            @PathVariable("id") Long id,
            @CurrentAccount Account currUser) {

        Address address = addressService.deleteAddress(id, currUser);
        return new ResponseEntity<>(address, HttpStatus.OK);
    }
}
