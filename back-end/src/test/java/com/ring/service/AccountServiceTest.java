package com.ring.service;

import com.ring.base.AbstractServiceTest;
import com.ring.dto.projection.accounts.IAccount;
import com.ring.dto.projection.accounts.IAccountDetail;
import com.ring.dto.projection.accounts.IProfile;
import com.ring.dto.projection.dashboard.IStat;
import com.ring.dto.request.AccountRequest;
import com.ring.dto.request.ChangePassRequest;
import com.ring.dto.request.ProfileRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.accounts.AccountDTO;
import com.ring.dto.response.accounts.AccountDetailDTO;
import com.ring.dto.response.accounts.ProfileDTO;
import com.ring.dto.response.dashboard.StatDTO;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.listener.events.OnResetPasswordCompletedEvent;
import com.ring.mapper.AccountMapper;
import com.ring.mapper.DashboardMapper;
import com.ring.model.entity.Account;
import com.ring.model.entity.AccountProfile;
import com.ring.model.entity.Image;
import com.ring.model.entity.Role;
import com.ring.model.enums.Gender;
import com.ring.model.enums.UserRole;
import com.ring.repository.AccountProfileRepository;
import com.ring.repository.AccountRepository;
import com.ring.repository.RoleRepository;
import com.ring.service.impl.AccountServiceImpl;
import com.ring.common.FileUploadUtil;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AccountServiceTest extends AbstractServiceTest {

        @Mock
        private AccountRepository accountRepo;

        @Mock
        private AccountProfileRepository profileRepo;

        @Mock
        private RoleRepository roleRepo;

        @Mock
        private AccountMapper accountMapper;

        @Mock
        private DashboardMapper dashMapper;

        @Mock
        private PasswordEncoder passwordEncoder;

        @Mock
        private ApplicationEventPublisher eventPublisher;

        @Mock
        private ImageService imageService;

        @InjectMocks
        private AccountServiceImpl accountService;

        private final AccountRequest request = AccountRequest.builder()
                        .username("initial")
                        .pass("asd")
                        .email("initialEmail@initial.com")
                        .roles(List.of(UserRole.ROLE_ADMIN))
                        .name("initialName")
                        .build();
        private final MockMultipartFile file = new MockMultipartFile(
                        "file",
                        "profile.png",
                        MediaType.IMAGE_PNG_VALUE,
                        "Hello, World!".getBytes());
        private final Image image = Image.builder().id(1L).name("profile.png").build();
        private final Role role = Role.builder()
                        .roleName(UserRole.ROLE_ADMIN)
                        .build();
        private final String encodedPass = "<PASSWORD>";

        @Test
        public void givenNewAccount_whenSaveAccount_ThenReturnAccount() {

                // Given
                Account account = Account.builder()
                                .id(1L)
                                .username("initial")
                                .email("initialEmail@initial.com")
                                .pass(encodedPass)
                                .build();

                AccountProfile profile = AccountProfile.builder()
                                .id(1L)
                                .name("initialName")
                                .user(account)
                                .build();
                account.setProfile(profile);

                // When
                when(accountRepo.existsByUsernameOrEmail(request.getUsername(), request.getEmail())).thenReturn(false);
                when(roleRepo.findAllByRoleNameIn(request.getRoles())).thenReturn(List.of(role));
                when(passwordEncoder.encode(request.getPass())).thenReturn(encodedPass);
                when(accountRepo.save(any(Account.class))).thenReturn(account);
                when(imageService.upload(any(MultipartFile.class), eq(FileUploadUtil.USER_FOLDER))).thenReturn(image);
                when(profileRepo.save(any(AccountProfile.class))).thenReturn(profile);

                // Then
                Account savedAccount = accountService.saveAccount(request, file);

                assertNotNull(savedAccount);
                assertEquals(account.getUsername(), savedAccount.getUsername());

                // Verify
                verify(accountRepo, times(1)).existsByUsernameOrEmail(request.getUsername(), request.getEmail());
                verify(roleRepo, times(1)).findAllByRoleNameIn(request.getRoles());
                verify(accountRepo).save(any(Account.class));
        }

        @Test
        public void givenExistingAccount_whenSaveAccount_ThenThrowException() {

                // When
                when(accountRepo.existsByUsernameOrEmail(request.getUsername(), request.getEmail())).thenReturn(true);

                // Then
                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> accountService.saveAccount(request, null));
                assertEquals("User already existed!", exception.getError());

                // Verify
                verify(accountRepo, times(1)).existsByUsernameOrEmail(request.getUsername(), request.getEmail());
                verify(roleRepo, never()).findAllByRoleNameIn(request.getRoles());
                verify(accountRepo, never()).save(any(Account.class));
        }

        @Test
        public void givenNewAccountWithInvalidRole_whenSaveAccount_ThenThrowException() {

                // Given
                request.setRoles(List.of(UserRole.ROLE_GUEST));

                // When
                when(accountRepo.existsByUsernameOrEmail(request.getUsername(), request.getEmail())).thenReturn(false);
                when(roleRepo.findAllByRoleNameIn(request.getRoles())).thenReturn(new ArrayList<>());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> accountService.saveAccount(request, null));
                assertEquals("Roles not found!", exception.getError());

                // Verify
                verify(accountRepo, times(1)).existsByUsernameOrEmail(request.getUsername(), request.getEmail());
                verify(roleRepo, times(1)).findAllByRoleNameIn(request.getRoles());
                verify(accountRepo, never()).save(any(Account.class));
        }

        @Test
        public void whenUpdateAccount_ThenReturnUpdatedAccount() {

                // Given
                Long id = 1L;

                Account existingAccount = Account.builder()
                                .id(id)
                                .username("existingUser")
                                .email("existingUser@example.com")
                                .profile(new AccountProfile())
                                .build();

                Account account = Account.builder()
                                .id(id)
                                .username("initial")
                                .email("initialEmail@initial.com")
                                .pass(encodedPass)
                                .build();

                AccountProfile profile = AccountProfile.builder()
                                .id(id)
                                .name("initialName")
                                .user(existingAccount)
                                .build();
                account.setProfile(profile);

                // When
                when(accountRepo.findById(id)).thenReturn(Optional.of(existingAccount));
                when(accountRepo.existsByUsernameOrEmail(request.getUsername(), request.getEmail())).thenReturn(false);
                when(roleRepo.findAllByRoleNameIn(request.getRoles())).thenReturn(List.of(role));
                when(passwordEncoder.encode(request.getPass())).thenReturn(encodedPass);
                when(accountRepo.save(any(Account.class))).thenReturn(account);
                when(imageService.upload(any(MultipartFile.class), eq(FileUploadUtil.USER_FOLDER))).thenReturn(image);
                when(profileRepo.save(any(AccountProfile.class))).thenReturn(profile);

                // Then
                Account updatedAccount = accountService.updateAccount(request, file, existingAccount, id);

                assertNotNull(updatedAccount);
                assertEquals(request.getUsername(), updatedAccount.getUsername());

                // Verify
                verify(accountRepo, times(1)).findById(id);
                verify(accountRepo, times(1)).existsByUsernameOrEmail(request.getUsername(), request.getEmail());
                verify(roleRepo, times(1)).findAllByRoleNameIn(request.getRoles());
                verify(accountRepo, times(1)).save(any(Account.class));
                verify(profileRepo, times(1)).save(any(AccountProfile.class));
        }

        @Test
        public void givenNonExistingAccount_whenUpdateAccount_ThenThrowException() {

                // Given
                Long id = 1L;

                // When
                when(accountRepo.findById(id)).thenReturn(Optional.empty());

                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> accountService.updateAccount(request, null, new Account(), id));
                assertEquals("User not found!", exception.getError());

                // Verify
                verify(accountRepo, times(1)).findById(id);
                verify(accountRepo, never()).existsByUsernameOrEmail(request.getUsername(), request.getEmail());
                verify(roleRepo, never()).findAllByRoleNameIn(request.getRoles());
                verify(accountRepo, never()).save(any(Account.class));
                verify(profileRepo, never()).save(any(AccountProfile.class));
        }

        @Test
        public void givenDuplicateUsernameOrEmail_whenUpdateAccount_ThenThrowException() {

                // Given
                Long id = 1L;

                Account existingAccount = Account.builder()
                                .id(id)
                                .username("existingUser")
                                .email("existingUser@example.com")
                                .profile(new AccountProfile())
                                .build();

                // When
                when(accountRepo.findById(id)).thenReturn(Optional.of(existingAccount));
                when(accountRepo.existsByUsernameOrEmail(request.getUsername(), request.getEmail())).thenReturn(true);

                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> accountService.updateAccount(request, null, existingAccount, id));
                assertEquals("User already existed!", exception.getError());

                // Verify
                verify(accountRepo, times(1)).findById(id);
                verify(accountRepo, times(1)).existsByUsernameOrEmail(request.getUsername(), request.getEmail());
                verify(roleRepo, never()).findAllByRoleNameIn(request.getRoles());
                verify(accountRepo, never()).save(any(Account.class));
                verify(profileRepo, never()).save(any(AccountProfile.class));
        }

        @Test
        void givenExistingAccountWithInvalidRole_whenUpdateAccount_ThenThrowException() {

                // Given
                Long id = 1L;
                request.setRoles(List.of(UserRole.ROLE_GUEST, UserRole.ROLE_ADMIN));

                Account existingAccount = Account.builder()
                                .id(id)
                                .username("existingUser")
                                .email("existingUser@example.com")
                                .profile(new AccountProfile())
                                .build();

                // When
                when(accountRepo.findById(id)).thenReturn(Optional.of(existingAccount));
                when(accountRepo.existsByUsernameOrEmail(request.getUsername(), request.getEmail())).thenReturn(false);
                when(roleRepo.findAllByRoleNameIn(request.getRoles())).thenReturn(new ArrayList<>());

                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> accountService.updateAccount(request, null, existingAccount, id));
                assertEquals("Roles not found!", exception.getError());

                // Verify
                verify(accountRepo, times(1)).findById(id);
                verify(accountRepo, times(1)).existsByUsernameOrEmail(request.getUsername(), request.getEmail());
                verify(roleRepo, times(1)).findAllByRoleNameIn(request.getRoles());
                verify(accountRepo, never()).save(any(Account.class));
                verify(profileRepo, never()).save(any(AccountProfile.class));
        }

        @Test
        void giveAdminAccount_whenUpdateAccountRoles_ThenThrowException() {

                // Given
                Long id = 1L;
                request.setRoles(List.of(UserRole.ROLE_USER));
                Account existingAccount = Account.builder().id(id).build();

                // When
                when(accountRepo.findById(id)).thenReturn(Optional.of(existingAccount));
                when(accountRepo.existsByUsernameOrEmail(request.getUsername(), request.getEmail())).thenReturn(false);

                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> accountService.updateAccount(request, null, existingAccount, id));
                assertEquals("Cannot remove your own Admin role!", exception.getError());

                // Verify
                verify(accountRepo, times(1)).findById(id);
                verify(accountRepo, times(1)).existsByUsernameOrEmail(request.getUsername(), request.getEmail());
                verify(roleRepo, never()).findAllByRoleNameIn(request.getRoles());
                verify(accountRepo, never()).save(any(Account.class));
                verify(profileRepo, never()).save(any(AccountProfile.class));
        }

        @Test
        public void whenDeleteAccount_ThenSuccess() {

                // Given
                Long id = 1L;

                // When
                doNothing().when(accountRepo).deleteById(id);

                // Then
                accountService.deleteAccount(id);

                // Verify
                verify(accountRepo, times(1)).deleteById(id);
        }

        @Test
        public void whenDeleteAccounts_ThenSuccess() {

                // Given
                List<Long> ids = List.of(1L, 2L, 3L);

                // When
                doNothing().when(accountRepo).deleteAllById(ids);

                // Then
                accountService.deleteAccounts(ids);

                // Verify
                verify(accountRepo, times(1)).deleteAllById(ids);
        }

        @Test
        public void whenDeleteAccountsInverse_ThenSuccess() {

                // Given
                List<Long> ids = List.of(1L, 2L, 3L);
                List<Long> inverseIds = List.of(4L);

                // When
                when(accountRepo.findInverseIds("", null, ids)).thenReturn(inverseIds);
                doNothing().when(accountRepo).deleteAllById(inverseIds);

                // Then
                accountService.deleteAccountsInverse("", null, ids);

                // Verify
                verify(accountRepo, times(1)).findInverseIds("", null, ids);
                verify(accountRepo, times(1)).deleteAllById(inverseIds);
        }

        @Test
        public void whenDeleteAllAccounts_ThenSuccess() {

                // When
                doNothing().when(accountRepo).deleteAll();

                // Then
                accountService.deleteAllAccounts();

                // Verify
                verify(accountRepo, times(1)).deleteAll();
        }

        @Test
        void whenGetAllAccounts_ThenReturnsPagedAccounts() {

                // Given
                Pageable pageable = PageRequest.of(0, 1, Sort.by("id").descending());
                Page<IAccount> accounts = new PageImpl<>(
                                List.of(mock(IAccount.class)),
                                pageable,
                                2);
                AccountDTO mapped = AccountDTO.builder().id(1L).build();
                PagingResponse<AccountDTO> expectedResponse = new PagingResponse<>(
                                List.of(mapped),
                                2,
                                2L,
                                1,
                                0,
                                false);

                // When
                when(accountRepo.findAccountsWithFilter(eq(""), isNull(), any(Pageable.class))).thenReturn(accounts);
                when(accountMapper.projectionToDTO(any(IAccount.class))).thenReturn(mapped);

                // Then
                PagingResponse<AccountDTO> result = accountService.getAllAccounts(pageable.getPageNumber(),
                                pageable.getPageSize(),
                                pageable.getSort().toString(),
                                pageable.getSort().descending().toString(),
                                "",
                                null);

                assertNotNull(result);
                assertEquals(expectedResponse.getContent().size(), result.getContent().size());
                assertEquals(expectedResponse.getTotalPages(), result.getTotalPages());
                assertEquals(expectedResponse.getTotalElements(), result.getTotalElements());
                assertEquals(expectedResponse.getSize(), result.getSize());
                assertEquals(expectedResponse.getPage(), result.getPage());
                assertEquals(expectedResponse.isEmpty(), result.isEmpty());

                // Verify
                verify(accountRepo, times(1)).findAccountsWithFilter(eq(""), isNull(), any(Pageable.class));
                verify(accountMapper, times(1)).projectionToDTO(any(IAccount.class));
        }

        @Test
        void whenGetAccountById_ThenReturnsAccountDetailDTO() {

                // Given
                Long accountId = 1L;
                var accountDetail = new AccountDetailDTO(
                                1L,
                                "testUsername",
                                "image.jpg",
                                "test@example.com",
                                List.of(UserRole.ROLE_USER),
                                "Test User",
                                "123-456-7890",
                                Gender.MALE,
                                LocalDate.of(1990, 1, 1),
                                LocalDateTime.now(),
                                100,
                                50);

                // When
                when(profileRepo.findDetailById(accountId)).thenReturn(Optional.of(mock(IAccountDetail.class)));
                when(accountMapper.projectionToDetailDTO(any(IAccountDetail.class))).thenReturn(accountDetail);

                // Then
                AccountDetailDTO result = accountService.getAccountById(accountId);

                assertNotNull(result);
                assertEquals(accountDetail, result);

                // Verify
                verify(profileRepo, times(1)).findDetailById(accountId);
                verify(accountMapper, times(1)).projectionToDetailDTO(any(IAccountDetail.class));
        }

        @Test
        void whenGetNonExistingAccountById_ThenThrowsException() {

                // Given
                Long accountId = 1L;

                // When
                when(profileRepo.findDetailById(accountId)).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> accountService.getAccountById(accountId));
                assertEquals("User not found!", exception.getError());

                // Verify
                verify(profileRepo, times(1)).findDetailById(accountId);
                verify(accountMapper, never()).projectionToDetailDTO(any(IAccountDetail.class));
        }

        @Test
        public void whenGetAnalytics_ReturnsStatDTO() {

                // Given
                var mockAnalytics = mock(IStat.class);
                var expectedStatDTO = new StatDTO("1", "users", 100.0, BigDecimal.valueOf(10.0));

                // When
                when(accountRepo.getAccountAnalytics()).thenReturn(mockAnalytics);
                when(dashMapper.statToDTO(mockAnalytics, "users", "Thành viên mới")).thenReturn(expectedStatDTO);

                // Then
                StatDTO actualStatDTO = accountService.getAnalytics();

                assertNotNull(actualStatDTO);
                assertEquals(expectedStatDTO, actualStatDTO);

                // Verify
                verify(accountRepo, times(1)).getAccountAnalytics();
                verify(dashMapper, times(1)).statToDTO(mockAnalytics, "users", "Thành viên mới");
        }

        @Test
        public void whenGetProfile_ThenReturnsProfileDTO() {

                // Given
                Account account = Account.builder()
                                .id(1L)
                                .username("initial")
                                .email("initialEmail@initial.com")
                                .pass(encodedPass)
                                .build();

                AccountProfile profile = AccountProfile.builder()
                                .id(1L)
                                .name("initialName")
                                .user(account)
                                .dob(LocalDate.of(1990, 1, 1))
                                .build();
                account.setProfile(profile);

                var profileDTO = new ProfileDTO(
                                null,
                                "initialName",
                                "initialEmail@initial.com",
                                null,
                                null,
                                LocalDate.of(1990, 1, 1),
                                LocalDateTime.now(),
                                0,
                                0);

                // When
                when(profileRepo.findProfileByUser(account.getId())).thenReturn(Optional.of(mock(IProfile.class)));
                when(accountMapper.projectionToProfileDTO(any(IProfile.class))).thenReturn(profileDTO);

                // Then
                ProfileDTO result = accountService.getProfile(account);

                assertNotNull(result);
                assertEquals(profileDTO, result);

                // Verify
                verify(profileRepo, times(1)).findProfileByUser(account.getId());
                verify(accountMapper, times(1)).projectionToProfileDTO(any(IProfile.class));
        }

        @Test
        void whenGetNonExistingProfile_ThenThrowsException() {

                // Given
                Account account = Account.builder().id(1L).build();

                // When
                when(profileRepo.findProfileByUser(account.getId())).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> accountService.getProfile(account));
                assertEquals("Profile not found!", exception.getError());

                // Verify
                verify(profileRepo, times(1)).findProfileByUser(account.getId());
                verify(accountMapper, never()).projectionToProfileDTO(any(IProfile.class));
        }

        @Test
        void whenUpdateProfile_ThenReturnAccountProfile() {

                // Given
                Long id = 1L;

                ProfileRequest request = ProfileRequest.builder()
                                .name("Jane Doe")
                                .phone("987654321")
                                .dob(LocalDate.of(1995, 5, 15))
                                .build();

                AccountProfile expected = AccountProfile.builder()
                                .id(1L)
                                .name("Jane Doe")
                                .phone("987654321")
                                .dob(LocalDate.of(1995, 5, 15))
                                .build();

                Account account = Account.builder().id(1L).profile(expected).build();

                // When
                when(profileRepo.findById(id)).thenReturn(Optional.of(mock(AccountProfile.class)));
                when(profileRepo.save(any(AccountProfile.class))).thenReturn(expected);
                when(imageService.upload(any(MultipartFile.class), eq(FileUploadUtil.USER_FOLDER))).thenReturn(image);

                // Then
                AccountProfile updatedProfile = accountService.updateProfile(request, file, account);

                assertNotNull(updatedProfile);
                Assertions.assertEquals(request.getName(), updatedProfile.getName());
                Assertions.assertEquals(request.getPhone(), updatedProfile.getPhone());
                Assertions.assertEquals(request.getDob(), updatedProfile.getDob());

                // Verify
                verify(profileRepo, times(1)).findById(id);
                verify(profileRepo, times(1)).save(any(AccountProfile.class));
                verify(imageService, times(1)).upload(any(MultipartFile.class), eq(FileUploadUtil.USER_FOLDER));
        }

        @Test
        void whenUpdateNonExistingProfile_ThenThrowsException() {

                // Given
                Long id = 1L;

                ProfileRequest request = ProfileRequest.builder()
                                .name("Jane Doe")
                                .phone("987654321")
                                .dob(LocalDate.of(1995, 5, 15))
                                .build();

                Account account = Account.builder().id(1L).profile(AccountProfile.builder().id(1L).build()).build();

                // When
                when(profileRepo.findById(id)).thenReturn(Optional.empty());

                // Then
                ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                                () -> accountService.updateProfile(request, null, account));
                assertEquals("Profile not found!", exception.getError());

                // Verify
                verify(profileRepo, times(1)).findById(id);
                verify(profileRepo, never()).save(any(AccountProfile.class));
                verify(imageService, never()).upload(any(MultipartFile.class), eq(FileUploadUtil.USER_FOLDER));
        }

        @Test
        public void whenChangePassword_ThenReturnUpdatedAccount() {

                // Given
                ChangePassRequest request = ChangePassRequest.builder()
                                .pass("currentPass")
                                .newPass("newPassword123")
                                .newPassRe("newPassword123")
                                .build();

                Account account = Account.builder()
                                .pass(encodedPass)
                                .username("testUser")
                                .email("testUser@mail.com")
                                .build();

                // When
                when(passwordEncoder.matches(request.getPass(), account.getPass())).thenReturn(true);
                when(passwordEncoder.encode(request.getNewPass())).thenReturn(encodedPass);
                when(accountRepo.save(any(Account.class))).thenReturn(account);

                // Then
                Account result = accountService.changePassword(request, account);

                assertNotNull(result);
                assertEquals(encodedPass, result.getPass());

                // Verify
                verify(accountRepo, times(1)).save(any(Account.class));
                verify(eventPublisher, times(1)).publishEvent(any(OnResetPasswordCompletedEvent.class));
        }

        @Test
        public void giveInvalidPassword_WhenChangePassword_ThenThrowsException() {

                // Given
                ChangePassRequest request = ChangePassRequest.builder()
                                .pass("wrongPass")
                                .newPass("newPassword123")
                                .newPassRe("newPassword123")
                                .build();

                Account user = Account.builder()
                                .pass("encodedCurrentPass")
                                .build();

                // When
                when(passwordEncoder.matches(request.getPass(), user.getPass())).thenReturn(false);

                // Then
                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> accountService.changePassword(request, user));
                assertEquals("Password not correct!", exception.getError());

                // Verify
                verify(accountRepo, never()).save(any(Account.class));
                verify(eventPublisher, never()).publishEvent(any(OnResetPasswordCompletedEvent.class));
        }

        @Test
        public void givenNotMatchingPasswords_WhenChangePassword_ThenThrowsException() {

                // Given
                ChangePassRequest request = ChangePassRequest.builder()
                                .pass("currentPass")
                                .newPass("newPassword123")
                                .newPassRe("differentPassword123")
                                .build();

                Account user = Account.builder()
                                .pass(encodedPass)
                                .build();

                // When
                when(passwordEncoder.matches(request.getPass(), user.getPass())).thenReturn(true);

                HttpResponseException exception = assertThrows(HttpResponseException.class,
                                () -> accountService.changePassword(request, user));
                assertEquals("Re input password does not match!", exception.getError());

                // Verify
                verify(accountRepo, never()).save(any(Account.class));
                verify(eventPublisher, never()).publishEvent(any(OnResetPasswordCompletedEvent.class));
        }

        @Test
        public void givenImageFile_WhenChangeProfilePicture_ThenReturnProfile()
                        throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {

                // Given
                Method changeProfilePic = AccountServiceImpl.class.getDeclaredMethod("changeProfilePic",
                                MultipartFile.class,
                                String.class,
                                AccountProfile.class);
                changeProfilePic.setAccessible(true);

                AccountProfile profile = AccountProfile.builder()
                                .id(1L)
                                .name("initialName")
                                .image(image)
                                .build();

                // When
//                when(imageService.deleteImage(eq(image.getId()))).thenReturn("Deleted!");
                when(imageService.upload(any(MultipartFile.class), eq(FileUploadUtil.USER_FOLDER))).thenReturn(image);

                // Then
                AccountProfile updatedProfile = (AccountProfile) changeProfilePic.invoke(accountService, file, null,
                                profile);
                assertNotNull(updatedProfile);
                assertNotNull(updatedProfile.getImage());

                // Verify
                verify(imageService, times(1)).deleteImage(eq(image.getId()));
                verify(imageService, times(1)).upload(any(MultipartFile.class), eq(FileUploadUtil.USER_FOLDER));
        }
}