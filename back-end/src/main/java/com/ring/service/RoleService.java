package com.ring.service;

import com.ring.model.entity.PrivilegeGroup;
import com.ring.model.entity.Role;
import com.ring.model.enums.PrivilegeType;
import com.ring.model.enums.UserRole;

import java.util.List;

/**
 * Service interface for handling role-related operations.
 */
public interface RoleService {

    /**
     * Finds a role by user role enum.
     *
     * @param userRole the user role enum
     * @return the {@link Role} entity
     */
    Role findRole(UserRole userRole);

    /**
     * Retrieves all privilege groups.
     *
     * @return a list of {@link PrivilegeGroup} objects
     */
    List<PrivilegeGroup> getPrivileges();

    /**
     * Updates a role with new privileges.
     *
     * @param privileges the list of privilege types to assign
     * @param userRole   the user role to update
     */
    void updateRole(List<PrivilegeType> privileges, UserRole userRole) ;
}
