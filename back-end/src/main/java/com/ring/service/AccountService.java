package com.ring.service;

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
import com.ring.model.entity.Account;
import com.ring.model.entity.AccountProfile;
import com.ring.model.enums.UserRole;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for handling user-related operations.
 */
public interface AccountService {

    /**
     * Retrieves all accounts with pagination and filtering options.
     *
     * @param pageSize  size of each page.
     * @param pageNo    page number.
     * @param sortBy    sorting field.
     * @param sortDir   sorting direction.
     * @param keyword   a search keyword to filter accounts (default is an empty string).
     * @param role      the role to filter accounts (optional).
     * @return a paginated list of {@link AccountDTO} objects based on the specified filters and sorting.
     */
    PagingResponse<AccountDTO> getAllAccounts(Integer pageNo,
                                              Integer pageSize,
                                              String sortBy,
                                              String sortDir,
                                              String keyword,
                                              UserRole role);

    /**
     * Retrieves an account by its ID.
     *
     * @param id the ID of the account to retrieve.
     * @return An {@link AccountDetailDTO} object containing the details of the requested account.
     * @throws ResourceNotFoundException If no account is found with the given ID.
     */
    AccountDetailDTO getAccountById(Long id);

    /**
     * Retrieves account analytics and maps it to a {@link StatDTO}
     *
     * @return a {@link StatDTO} containing account analytics data.
     */
    StatDTO getAnalytics();

    /**
     * Creates a new account through the Admin dashboard.
     *
     * @param request the account creation details.
     * @param file an optional profile image.
     * @return the created {@link Account} after it is successfully saved to the database.
     */
    Account saveAccount(AccountRequest request,
                        MultipartFile file);

    /**
     * Updates an existing account by its ID.
     *
     * @param id the ID of the account to update.
     * @param request the account update details.
     * @param file an optional profile image.
     * @param user the current authenticated admin.
     * @return the updated {@link Account} object reflecting the latest changes.
     * @throws ResourceNotFoundException if the account or the specified role is not found.
     * @throws HttpResponseException if a username or email conflict occurs with an existing account.
     */
    Account updateAccount(AccountRequest request,
                          MultipartFile file,
                          Account user,
                          Long id);

    /**
     * Deletes an account by its ID.
     *
     * @param id the ID of the account to delete.
     */
    void deleteAccount(Long id);

    /**
     * Deletes multiple accounts by a list of IDs.
     *
     * @param ids a list of account IDs to delete.
     */
    void deleteAccounts(List<Long> ids);

    /**
     * Deletes accounts that are not in the provided list of IDs.
     *
     * @param keyword a search keyword to filter accounts (default is an empty string).
     * @param role the role to filter accounts (optional).
     * @param ids a list of account IDs to exclude from deletion.
     */
    void deleteAccountsInverse(String keyword,
                              UserRole role,
                              List<Long> ids);


    /**
     * Deletes all accounts from the repository.
     */
    void deleteAllAccounts();

    /**
     * Retrieves the profile of the currently authenticated user.
     *
     * @param user the account for which the profile is to be retrieved.
     * @return the {@link ProfileDTO} for the given account.
     * @throws ResourceNotFoundException if no profile is found for the given account.
     */
    ProfileDTO getProfile(Account user);

    /**
     * Updates the profile of the currently authenticated user.
     *
     * @param request the profile update details.
     * @param file an optional profile image.
     * @param user the Account instance of the user whose profile is being updated.
     * @return the updated {@link AccountProfile} after applying the changes and saving to the database.
     * @throws ResourceNotFoundException if the profile associated with the user is not found.
     */
    AccountProfile updateProfile(ProfileRequest request,
                                 MultipartFile file,
                                 Account user);

    /**
     * Changes the password for the currently authenticated user.
     *
     * @param request the password change request.
     * @param user the account of the user whose password is to be changed.
     * @return the updated {@link Account} with the new password.
     * @throws HttpResponseException if the current password does not match or the
     * new passwords do not match.
     */
    Account changePassword(ChangePassRequest request,
                           Account user);

}
