package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.dto.projection.accounts.IAccount;
import com.ring.dto.projection.accounts.IAccountDetail;
import com.ring.dto.projection.accounts.IProfile;
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
import com.ring.model.enums.UserRole;
import com.ring.repository.AccountProfileRepository;
import com.ring.repository.AccountRepository;
import com.ring.repository.RoleRepository;
import com.ring.service.AccountService;
import com.ring.service.ImageService;
import com.ring.common.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

/**
 * Service class for managing accounts.
 */
@RequiredArgsConstructor
@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepo;
    private final AccountProfileRepository profileRepo;
    private final RoleRepository roleRepo;
    private final ImageService imageService;
    private final MessageService messageService;
    private final AccountMapper accountMapper;
    private final DashboardMapper dashMapper;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    @Cacheable(cacheNames = AppConstants.ACCOUNTS)
    public PagingResponse<AccountDTO> getAllAccounts(Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir,
            String keyword,
            UserRole role) {

        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING)
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending());

        Page<IAccount> accountsList = accountRepo.findAccountsWithFilter(keyword, role, pageable);
        List<AccountDTO> accountDTOS = accountsList.map(accountMapper::projectionToDTO).toList();

        return new PagingResponse<>(accountDTOS,
                accountsList.getTotalPages(),
                accountsList.getTotalElements(),
                accountsList.getSize(),
                accountsList.getNumber(),
                accountsList.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.ACCOUNT_DETAIL, key = "#id")
    public AccountDetailDTO getAccountById(Long id) {

        IAccountDetail account = profileRepo.findDetailById(id)
            .orElseThrow(() -> {
                var errorMsg = messageService.getMessage("exception.not.found",
                    new Object[]{ new DefaultMessageSourceResolvable("label.user") });
                return new ResourceNotFoundException(errorMsg);
            });

        return accountMapper.projectionToDetailDTO(account);
    }

    @Cacheable(cacheNames = AppConstants.ACCOUNT_ANALYTICS)
    public StatDTO getAnalytics() {

        var label = StringUtils.capitalize(messageService.getMessage("label.member.new"));
        return dashMapper.statToDTO(accountRepo.getAccountAnalytics(),
                AppConstants.USERS,
                label);
    }

    @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.ACCOUNTS, 
            AppConstants.ACCOUNT_ANALYTICS }, allEntries = true),
            @CacheEvict(cacheNames = AppConstants.ACCOUNT_DETAIL, key = "#result.id") })
    @Transactional
    public Account saveAccount(AccountRequest request, MultipartFile file) {

        // Check if Account with these username and email existed >> throw exception
        if (accountRepo.existsByUsernameOrEmail(request.getUsername(), request.getEmail())) {
            var errorMsg = messageService.getMessage("exception.user.existed");
            throw new HttpResponseException(
                    HttpStatus.CONFLICT,
                    AppConstants.USER_EXISTED,
                    errorMsg);
        }

        // Set role
        List<Role> roles = roleRepo.findAllByRoleNameIn(request.getRoles());
        if (roles.isEmpty()) {
            var errorMsg = messageService.getMessage("exception.not.found",
                new Object[]{ new DefaultMessageSourceResolvable("label.user.roles") });
            throw new ResourceNotFoundException(errorMsg);
        }

        // Create an account
        var acc = Account.builder()
                .username(request.getUsername())
                .pass(passwordEncoder.encode(request.getPass()))
                .email(request.getEmail())
                .roles(roles)
                .build();

        Account savedAccount = accountRepo.save(acc); // Save to Database

        // Create profile
        var profile = AccountProfile.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .dob(request.getDob())
                .gender(request.getGender())
                .user(savedAccount)
                .build();

        // Image upload/replace
        profile = this.changeProfilePic(file, request.getImage(), profile);

        profileRepo.save(profile); // Save profile to Database
        return savedAccount; // Return created account
    }

    @Caching(evict = { @CacheEvict(cacheNames = AppConstants.ACCOUNTS, allEntries = true),
            @CacheEvict(cacheNames = AppConstants.ACCOUNT_DETAIL, key = "#id"),
            @CacheEvict(cacheNames = AppConstants.PROFILE, key = "#user.id") })
    @Transactional
    public Account updateAccount(AccountRequest request,
            MultipartFile file,
            Account user,
            Long id) {

        // Check Account exists?
        Account changeUser = accountRepo.findById(id)
            .orElseThrow(() -> {
                var errorMsg = messageService.getMessage("exception.not.found",
                    new Object[]{ new DefaultMessageSourceResolvable("label.user") });
                return new ResourceNotFoundException(errorMsg);
            });

        // Check if Account with these username and email has existed >> throw exception
        if (!request.getUsername().equals(changeUser.getUsername())
                && !request.getEmail().equals(changeUser.getEmail())
                && accountRepo.existsByUsernameOrEmail(request.getUsername(), request.getEmail())) {
            var errorMsg = messageService.getMessage("exception.user.existed");
            throw new HttpResponseException(
                HttpStatus.CONFLICT,
                AppConstants.USER_EXISTED,
                errorMsg);
        }

        // Set role
        if (Objects.equals(user.getId(), id)
                && !request.getRoles().contains(UserRole.ROLE_ADMIN)) {
            var errorMsg = messageService.getMessage("exception.role.remove");
            throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                    AppConstants.ROLE_REMOVE_ERROR,
                    errorMsg);
        }
        List<Role> roles = roleRepo.findAllByRoleNameIn(request.getRoles());
        if (roles.isEmpty()) {
            var errorMsg = messageService.getMessage("exception.not.found",
                new Object[]{ new DefaultMessageSourceResolvable("label.user.roles") });
            throw new ResourceNotFoundException(errorMsg);
        }
        changeUser.setRoles(roles);

        // Set new info
        changeUser.setUsername(request.getUsername());
        changeUser.setEmail(request.getEmail());
        if (request.getPass() != null)
            changeUser.setPass(passwordEncoder.encode(request.getPass()));

        Account updatedAccount = accountRepo.save(changeUser); // Save to the database

        // Get current profile
        AccountProfile profile = updatedAccount.getProfile();

        // Image upload/replace
        profile = this.changeProfilePic(file, request.getImage(), profile);

        // Set new profile info
        profile.setName(request.getName());
        profile.setPhone(request.getPhone());
        profile.setDob(request.getDob());
        profile.setGender(request.getGender());

        profileRepo.save(profile); // Save profile to Database
        return updatedAccount;
    }

    @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.ACCOUNTS,
                AppConstants.ACCOUNT_ANALYTICS },
                allEntries = true),
            @CacheEvict(cacheNames = { AppConstants.ACCOUNT_DETAIL,
                AppConstants.PROFILE },
                key = "#id") })
    @Transactional
    public void deleteAccount(Long id) {
        accountRepo.deleteById(id);
    }

    @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.ACCOUNTS,
                AppConstants.ACCOUNT_ANALYTICS,
                AppConstants.ACCOUNT_DETAIL,
                AppConstants.PROFILE }, allEntries = true) })
    @Transactional
    public void deleteAccounts(List<Long> ids) {
        accountRepo.deleteAllById(ids);
    }

    @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.ACCOUNTS,
                AppConstants.ACCOUNT_ANALYTICS,
                AppConstants.ACCOUNT_DETAIL,
                AppConstants.PROFILE }, allEntries = true) })
    @Override
    public void deleteAccountsInverse(String keyword, UserRole role, List<Long> ids) {
        List<Long> deleteIds = accountRepo.findInverseIds(
                keyword,
                role,
                ids);
        accountRepo.deleteAllById(deleteIds);
    }

    @Caching(evict = { @CacheEvict(cacheNames = { AppConstants.ACCOUNTS,
                AppConstants.ACCOUNT_ANALYTICS,
                AppConstants.ACCOUNT_DETAIL,
                AppConstants.PROFILE }, allEntries = true) })
    @Transactional
    public void deleteAllAccounts() {
        accountRepo.deleteAll();
    }

    @Cacheable(cacheNames = AppConstants.PROFILE, key = "#user.id")
    public ProfileDTO getProfile(Account user) {

        IProfile currProfile = profileRepo.findProfileByUser(user.getId())
            .orElseThrow(() -> {
                var errorMsg = messageService.getMessage("exception.not.found",
                    new Object[]{ new DefaultMessageSourceResolvable("label.user.profile") });
                return new ResourceNotFoundException(errorMsg);
            });

        return accountMapper.projectionToProfileDTO(currProfile);
    }

    @Caching(evict = { @CacheEvict(cacheNames = AppConstants.ACCOUNTS, allEntries = true),
            @CacheEvict(cacheNames = AppConstants.ACCOUNT_DETAIL, key = "#user.id") },
                put = { @CachePut(cacheNames = AppConstants.PROFILE, key = "#user.id") })
    @Transactional
    public AccountProfile updateProfile(ProfileRequest request, MultipartFile file, Account user) {

        AccountProfile profile = profileRepo.findById(user.getProfile().getId())
            .orElseThrow(() -> {
                var errorMsg = messageService.getMessage("exception.not.found",
                    new Object[]{ new DefaultMessageSourceResolvable("label.user.profile") });
                return new ResourceNotFoundException(errorMsg);
            });

        // Image upload/replace
        profile = this.changeProfilePic(file, request.getImage(), profile);

        // Set info
        profile.setName(request.getName());
        profile.setPhone(request.getPhone());
        profile.setDob(request.getDob());
        profile.setGender(request.getGender());

        return profileRepo.save(profile); // Save to Database
    }

    public Account changePassword(ChangePassRequest request, Account user) {

        // Check user current password
        if (!passwordEncoder.matches(request.getPass(), user.getPass())) {
            var errorMsg = messageService.getMessage("exception.password.incorrect");
            throw new HttpResponseException(
                HttpStatus.BAD_REQUEST,
                AppConstants.PASSWORD_INCORRECT,
                errorMsg);
        }

        // Check matching new password
        if (!request.getNewPass().equals(request.getNewPassRe())) {
            var errorMsg = messageService.getMessage("exception.password.not.match");
            throw new HttpResponseException(
                HttpStatus.BAD_REQUEST,
                AppConstants.PASSWORD_NOT_MATCH,
                errorMsg);
        }

        // Change password and save to the database
        user.setPass(passwordEncoder.encode(request.getNewPass()));
        Account savedAccount = accountRepo.save(user);

        // Email event
        eventPublisher.publishEvent(new OnResetPasswordCompletedEvent(
                user.getUsername(),
                user.getEmail()));

        return savedAccount;
    }

    /**
     * Updates the profile picture of a user account. This method allows uploading
     * a new profile picture, replacing an existing one, or removing the profile
     * picture.
     *
     * @param file    the new image file to be uploaded as the profile picture, can
     *        be null for removing the image
     * @param image   the identifier of the image, used for determining if an image
     *        should be removed, can be null
     * @param profile the account profile to be updated
     * @return the updated account profile with the modified profile picture
     */
    protected AccountProfile changeProfilePic(MultipartFile file, String image, AccountProfile profile) {

        // Contain new image >> upload/replace
        if (file != null) {
            if (profile.getImage() != null)
                imageService.deleteImage(profile.getImage().getId()); // Delete old image
            Image savedImage = imageService.upload(file, FileUploadUtil.USER_FOLDER);// Upload new image
            profile.setImage(savedImage); // Set new image
        // Remove image
        } else if (image == null) {
            if (profile.getImage() != null)
                imageService.deleteImage(profile.getImage().getId()); // Delete old image
            profile.setImage(null);
        }

        return profile;
    }
}
