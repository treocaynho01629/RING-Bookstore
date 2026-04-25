package com.ring.common;

import com.ring.model.entity.Account;
import com.ring.model.entity.Shop;
import com.ring.model.enums.UserRole;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Common utilities for the application.
 */
public class CommonUtils {

    /**
     * Check if current user Admin or not
     * 
     * @return true if is Admin
     */
    public static boolean isAuthAdmin() {

        // Get current auth & check role Admin
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority()
                        .equals(UserRole.ROLE_ADMIN.toString())));
    }

    /**
     * Check if the user is the owner of the shop or admin.
     *
     * @param shop The shop to check.
     * @param user The user to check.
     * @return True if the user is the owner of the shop or admin, false otherwise.
     */
    public static boolean isValidShopOwner(Shop shop, Account user) {

        boolean isAdmin = isAuthAdmin();

        if (shop != null) {
            return shop.getOwner().getId().equals(user.getId()) || isAdmin;
        } else {
            return isAdmin;
        }
    }
}
