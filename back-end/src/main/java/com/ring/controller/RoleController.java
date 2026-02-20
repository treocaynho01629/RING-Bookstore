package com.ring.controller;

import com.ring.dto.response.GenericResponse;
import com.ring.model.entity.PrivilegeGroup;
import com.ring.model.entity.Role;
import com.ring.model.enums.PrivilegeType;
import com.ring.model.enums.UserRole;
import com.ring.service.RoleService;
import com.ring.service.impl.MessageService;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller class named {@link RoleController} for handling basic
 * role-privilege-related operations.
 * Exposes endpoints under "/api/roles".
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final MessageService messageService;

    /**
     * Retrieves all grouped privileges.
     *
     * @return a {@link ResponseEntity} containing list of grouped privileges.
     */
    @GetMapping("/privileges")
    @PreAuthorize("hasAnyRole('ADMIN', 'GUEST') and hasAuthority('read:role')")
    public ResponseEntity<List<PrivilegeGroup>> getPrivileges() {

        List<PrivilegeGroup> privileges = roleService.getPrivileges();
        return new ResponseEntity<>(privileges, HttpStatus.OK);
    }

    /**
     * Retrieves a role by its name.
     *
     * @param name the category name.
     * @return a {@link ResponseEntity} containing the role.
     */
    @GetMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('read:role')")
    public ResponseEntity<Role> getRole(@PathVariable("name") UserRole name) {

        Role role = roleService.findRole(name);
        return new ResponseEntity<>(role, HttpStatus.OK);
    }

    /**
     * Updates an existing role by its name.
     *
     * @param name       the name of the role to update.
     * @param privileges the account update privileges.
     * @return a {@link ResponseEntity} containing the success message.
     */
    @PutMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('update:role')")
    public ResponseEntity<?> updateRole(
            @PathVariable("name") UserRole name,
            @RequestPart @NotNull(message = "{validation.constraints.not.blank}") @NotEmpty(message = "{validation.constraints.not.blank}") List<PrivilegeType> privileges) {

        roleService.updateRole(privileges, name);
        GenericResponse message = new GenericResponse(messageService.getMessage("message.update.succeeded"));

        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
