package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.model.entity.Privilege;
import com.ring.model.entity.PrivilegeGroup;
import com.ring.model.entity.Role;
import com.ring.model.enums.PrivilegeType;
import com.ring.model.enums.UserRole;
import com.ring.repository.PrivilegeGroupRepository;
import com.ring.repository.PrivilegeRepository;
import com.ring.repository.RoleRepository;
import com.ring.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepo;
    private final PrivilegeRepository privilegeRepo;
    private final PrivilegeGroupRepository groupRepo;

    private final MessageService messageService;

    @Cacheable(cacheNames = AppConstants.ROLE, key = "#userRole")
    public Role findRole(UserRole userRole) {

        return roleRepo.findRoleWithPrivileges(userRole)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.role") });
                    return new ResourceNotFoundException(errorMsg);
                });
    }

    @Cacheable(cacheNames = AppConstants.PRIVILEGES)
    public List<PrivilegeGroup> getPrivileges() {

        return groupRepo.findAllWithPrivileges();
    }

    @CacheEvict(cacheNames = AppConstants.ROLE, key = "#userRole")
    public void updateRole(List<PrivilegeType> privileges, UserRole userRole) {

        // Prevent update Admin role
        if (userRole == UserRole.ROLE_ADMIN) {

            var errorMsg = messageService.getMessage("exception.role.admin.edit");
            throw new HttpResponseException(HttpStatus.BAD_REQUEST, 
                    AppConstants.INVALID_ARGUMENT,
                    errorMsg);
        }

        Role role = roleRepo.findByRoleName(userRole)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.role") });
                    return new ResourceNotFoundException(errorMsg);
                });
        List<Privilege> rolePrivileges = privilegeRepo.findAllByPrivilegeTypeIn(privileges);

        role.setPrivileges(rolePrivileges);
        roleRepo.save(role);
    }
}
