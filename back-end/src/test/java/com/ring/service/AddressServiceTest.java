package com.ring.service;

import com.ring.base.AbstractServiceTest;
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
import com.ring.service.impl.AddressServiceImpl;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AddressServiceTest extends AbstractServiceTest {

    @Mock
    private AccountProfileRepository profileRepo;

    @Mock
    private AddressRepository addressRepo;

    @Mock
    private AddressMapper addressMapper;

    @InjectMocks
    private AddressServiceImpl addressService;

    private static Account account;
    private static AccountProfile profile;

    @BeforeAll
    public static void setUp() {
        account = Account.builder().id(1L).build();
        profile = AccountProfile.builder().id(1L).addresses(new ArrayList<>()).build();
        account.setProfile(profile);
    }

    @Test
    public void whenGetMyAddresses_ThenReturnAddresses() {

        // Given
        List<IAddress> addresses = List.of(mock(IAddress.class));
        AddressDTO mapped = AddressDTO.builder().address("004/1").build();

        // When
        when(addressRepo.findAddressesByProfile(account.getProfile().getId())).thenReturn(addresses);
        when(addressMapper.projectionToDTO(any(IAddress.class))).thenReturn(mapped);

        // Then
        List<AddressDTO> result = addressService.getMyAddresses(account);

        assertNotNull(result);
        assertEquals(mapped, result.get(0));

        // Verify
        verify(addressRepo, times(1)).findAddressesByProfile(account.getProfile().getId());
        verify(addressMapper, times(1)).projectionToDTO(any(IAddress.class));
    }

    @Test
    public void whenGetMyAddress_ThenReturnAddress() {

        // Given
        IAddress address = mock(IAddress.class);
        AddressDTO expected = AddressDTO.builder().address("004/1").build();

        // When
        when(addressRepo.findAddressByProfile(account.getProfile().getId())).thenReturn(address);
        when(addressMapper.projectionToDTO(any(IAddress.class))).thenReturn(expected);

        // Then
        AddressDTO result = addressService.getMyAddress(account);

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(addressRepo, times(1)).findAddressByProfile(account.getProfile().getId());
        verify(addressMapper, times(1)).projectionToDTO(any(IAddress.class));
    }

    @Test
    public void whenGetAddress_ThenReturnAddress() {

        // Given
        Long id = 1L;
        Address expected = Address.builder().id(1L).address("004/1").build();

        // When
        when(addressRepo.findById(id)).thenReturn(Optional.of(expected));

        // Then
        Address result = addressService.getAddress(id);

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(addressRepo, times(1)).findById(id);
    }

    @Test
    public void whenGetInvalidAddress_ThenThrowsException() {

        // Given
        Long id = 1L;

        // When
        when(addressRepo.findById(id)).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> addressService.getAddress(id));
        assertEquals("Address not found!", exception.getError());

        // Verify
        verify(addressRepo, times(1)).findById(id);
    }

    @Test
    public void givenNewAddress_WhenAddAddress_ThenReturnNewAddress() {

        // Given
        AddressRequest request = AddressRequest.builder()
                .address("004/1")
                .isDefault(false)
                .build();
        Address expected = Address.builder().id(1L).address("004/1").build();

        // When
        when(profileRepo.findById(account.getProfile().getId())).thenReturn(Optional.of(profile));
        when(addressRepo.save(any(Address.class))).thenReturn(expected);
        when(profileRepo.save(any(AccountProfile.class))).thenReturn(profile);

        // Then
        Address result = addressService.addAddress(request, account);

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(profileRepo, times(1)).findById(account.getProfile().getId());
        verify(addressRepo, times(1)).save(any(Address.class));
        verify(profileRepo, times(1)).save(any(AccountProfile.class));
    }

    @Test
    public void givenNonExistingProfile_WhenAddAddress_ThenThrowsException() {

        // Given
        AddressRequest request = AddressRequest.builder()
                .address("004/1")
                .build();

        // When
        when(profileRepo.findById(account.getProfile().getId())).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> addressService.addAddress(request, account));
        assertEquals("Profile not found!", exception.getError());

        // Verify
        verify(profileRepo, times(1)).findById(account.getProfile().getId());
        verify(addressRepo, never()).save(any(Address.class));
        verify(profileRepo, never()).save(any(AccountProfile.class));
    }

    @Test
    public void givenSixthAddress_whenAddAddress_ThenThrowsException() {
        // Given
        AddressRequest request = AddressRequest.builder()
                .address("004/1")
                .build();
        profile.addAddress(mock(Address.class));
        profile.addAddress(mock(Address.class));
        profile.addAddress(mock(Address.class));
        profile.addAddress(mock(Address.class));
        profile.addAddress(mock(Address.class));

        // When
        when(profileRepo.findById(account.getProfile().getId())).thenReturn(Optional.of(profile));

        // Then
        HttpResponseException exception = assertThrows(HttpResponseException.class,
                () -> addressService.addAddress(request, account));
        assertEquals("Can not add more than 5 addresses!", exception.getError());

        // Verify
        verify(profileRepo, times(1)).findById(account.getProfile().getId());
        verify(addressRepo, never()).save(any(Address.class));
        verify(profileRepo, never()).save(any(AccountProfile.class));
    }

    @Test
    void whenUpdateAddress_ThenReturnUpdatedAddress() {

        // Given
        Long id = 1L;
        AddressRequest request = AddressRequest.builder()
                .address("004/1")
                .isDefault(true)
                .build();
        Address address = Address.builder().id(1L).address("001/1").profile(profile).build();
        Address expected = Address.builder().id(1L).address("004/1").profile(profile).build();

        // When
        when(addressRepo.findById(id)).thenReturn(Optional.of(address));
        when(addressRepo.save(any(Address.class))).thenReturn(expected);
        when(profileRepo.save(any(AccountProfile.class))).thenReturn(profile);

        // Then
        Address result = addressService.updateAddress(request, id, account);

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(addressRepo, times(1)).findById(id);
        verify(addressRepo, times(1)).save(any(Address.class));
        verify(profileRepo, times(1)).save(any(AccountProfile.class));
    }

    @Test
    void whenUpdateNonExistingAddress_ThenThrowsException() {

        // Given
        Long id = 1L;
        AddressRequest request = AddressRequest.builder()
                .address("004/1")
                .isDefault(true)
                .build();

        // When
        when(addressRepo.findById(id)).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> addressService.updateAddress(request, id, account));
        assertEquals("Address not found!", exception.getError());

        // Verify
        verify(addressRepo, times(1)).findById(id);
        verify(addressRepo, never()).save(any(Address.class));
        verify(profileRepo, never()).save(any(AccountProfile.class));
    }

    @Test
    void whenUpdateSomeoneElseAddress_ThenThrowsException() {

        // Given
        Long id = 1L;
        AddressRequest request = AddressRequest.builder()
                .address("004/1")
                .isDefault(true)
                .build();
        Address address = Address.builder()
                .id(1L)
                // .isDefault(false)
                .address("001/1")
                .profile(AccountProfile.builder().id(2L).build())
                .build();

        // When
        when(addressRepo.findById(id)).thenReturn(Optional.of(address));

        // Then
        EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                () -> addressService.updateAddress(request, id, account));
        assertEquals("Invalid user!", exception.getError());

        // Verify
        verify(addressRepo, times(1)).findById(id);
        verify(addressRepo, never()).save(any(Address.class));
        verify(profileRepo, never()).save(any(AccountProfile.class));
    }

    @Test
    public void whenDelete_ThenReturnDeletedAddress() {

        // Given
        Long id = 1L;
        Address expected = Address.builder().id(1L)
        // .isDefault(true)
        .address("004/1").profile(profile).build();

        // When
        when(addressRepo.findById(id)).thenReturn(Optional.of(expected));
        doNothing().when(addressRepo).deleteById(id);

        // Then
        Address result = addressService.deleteAddress(id, account);

        assertNotNull(result);
        assertEquals(expected, result);

        // Verify
        verify(addressRepo, times(1)).findById(id);
        verify(addressRepo, times(1)).deleteById(id);
    }

    @Test
    public void whenDeleteNonExistingAddress_ThenThrowsException() {

        // Given
        Long id = 1L;

        // When
        when(addressRepo.findById(id)).thenReturn(Optional.empty());

        // Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> addressService.deleteAddress(id, account));
        assertEquals("Address not found!", exception.getError());

        // Verify
        verify(addressRepo, times(1)).findById(id);
        verify(addressRepo, never()).deleteById(id);
    }

    @Test
    public void whenDeleteSomeoneElseAddress_ThenThrowsException() {

        // Given
        Long id = 1L;
        Address address = Address.builder()
                .id(1L)
                // .isDefault(false)
                .address("001/1")
                .profile(AccountProfile.builder().id(2L).build())
                .build();

        // When
        when(addressRepo.findById(id)).thenReturn(Optional.of(address));

        // Then
        EntityOwnershipException exception = assertThrows(EntityOwnershipException.class,
                () -> addressService.deleteAddress(id, account));
        assertEquals("Invalid user!", exception.getError());

        // Verify
        verify(addressRepo, times(1)).findById(id);
        verify(addressRepo, never()).deleteById(id);
    }
}