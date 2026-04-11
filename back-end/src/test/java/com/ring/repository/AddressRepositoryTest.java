package com.ring.repository;

import com.ring.base.AbstractRepositoryTest;
import com.ring.dto.projection.accounts.IAddress;
import com.ring.model.entity.Account;
import com.ring.model.entity.AccountProfile;
import com.ring.model.entity.Address;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AddressRepositoryTest extends AbstractRepositoryTest {

        @Autowired
        private AddressRepository addressRepo;

        @Autowired
        private AccountProfileRepository profileRepo;

        @Test
        public void givenNewAddress_whenSaveAddress_ThenReturnAddress() {

                // Given
                Address address = Address.builder()
                                .address("123/abc/j12")
                                .build();

                // When
                Address savedAddress = addressRepo.save(address);

                // Then
                assertNotNull(savedAddress);
                assertNotNull(savedAddress.getId());
        }

        @Test
        public void whenUpdateProfile_ThenReturnProfile() {

                // Given
                Address address = Address.builder()
                                .address("123/abc/j12")
                                .build();

                addressRepo.save(address);

                Address foundAddress = addressRepo.findById(address.getId()).orElse(null);
                assertNotNull(foundAddress);

                // When
                foundAddress.setDetail("detail");
                foundAddress.setName("test");
                // foundAddress.setIsDefault(true);

                Address updatedAddress = addressRepo.save(foundAddress);

                // Then
                assertNotNull(updatedAddress);
                assertNotNull(updatedAddress.getDetail());
                // assertTrue(updatedAddress.getIsDefault());
                assertEquals("test", updatedAddress.getName());
        }

        @Test
        public void whenDeleteProfile_ThenFindNull() {

                // Given
                Address address = Address.builder()
                                .address("123/abc/j12")
                                .build();

                addressRepo.save(address);

                // When
                addressRepo.deleteById(address.getId());

                // Then
                Address foundAddress = addressRepo.findById(address.getId()).orElse(null);

                assertNull(foundAddress);
        }

        @Test
        public void whenFindAddressesByProfile_ThenReturnAddressList() {

                // Given
                Account account = Account.builder()
                                .username("username")
                                .pass("asd")
                                .email("email")
                                .build();
                account.setCreatedDate(LocalDateTime.now());
                AccountProfile profile = AccountProfile.builder()
                                .dob(LocalDate.now())
                                .user(account)
                                .build();
                Address address1 = Address.builder()
                                .profile(profile)
                                .address("Province/City/District/Ward/Village 1")
                                .detail("Detail 1")
                                .build();
                Address address2 = Address.builder()
                                .profile(profile)
                                .address("Province/City/District/Ward/Village 2")
                                .detail("Detail 2")
                                .build();

                profileRepo.save(profile);
                addressRepo.saveAll(new ArrayList<>(List.of(address1, address2)));

                // When
                List<IAddress> foundAddresses = addressRepo.findAddressesByProfile(profile.getId());

                // Then
                assertNotNull(foundAddresses);
                assertFalse(foundAddresses.isEmpty());
        }

        @Test
        public void whenFindAddressByProfile_ThenReturnAddress() {

                // Given
                Address address = Address.builder()
                                .address("Province/City/District/Ward/Village")
                                .detail("Main Detail")
                                .build();
                Account account = Account.builder()
                                .username("username")
                                .pass("asd")
                                .email("email")
                                .build();
                account.setCreatedDate(LocalDateTime.now());
                AccountProfile profile = AccountProfile.builder()
                                .dob(LocalDate.now())
                                .user(account)
                                .address(address)
                                .build();

                profileRepo.save(profile);

                // When
                IAddress foundAddress = addressRepo.findAddressByProfile(profile.getId());

                // Then
                assertNotNull(foundAddress);
        }
}