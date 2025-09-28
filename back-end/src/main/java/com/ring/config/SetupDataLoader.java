package com.ring.config;

import com.ring.model.entity.Account;
import com.ring.model.entity.Privilege;
import com.ring.model.entity.PrivilegeGroup;
import com.ring.model.entity.Role;
import com.ring.model.enums.PrivilegeGroupType;
import com.ring.model.enums.PrivilegeType;
import com.ring.model.enums.UserRole;
import com.ring.repository.AccountRepository;
import com.ring.repository.PrivilegeGroupRepository;
import com.ring.repository.PrivilegeRepository;
import com.ring.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * A component that loads initial setup data into the application when the
 * Spring application context is refreshed.
 */
@Component
@RequiredArgsConstructor
public class SetupDataLoader implements
        ApplicationListener<ContextRefreshedEvent> {

    boolean alreadySetup = false;

    private final AccountRepository accountRepo;
    private final RoleRepository roleRepo;
    private final PrivilegeRepository privilegeRepo;
    private final PrivilegeGroupRepository groupRepo;
    private final PasswordEncoder passwordEncoder;

    /**
     * This method is called when the application context is refreshed.
     * <p>
     * It is used to load initial data or perform any setup tasks that need to run
     * when the application is started.
     * </p>
     *
     * @param event The event that indicates the application context has been
     *              refreshed.
     */
    @Override
    @Transactional
    public void onApplicationEvent(ContextRefreshedEvent event) {

        if (alreadySetup)
            return;

        // Check
        if (privilegeRepo.count() != PrivilegeType.values().length) {

            // Create initial privileges
            List<Privilege> privileges = new ArrayList<>();
            for (PrivilegeGroupType groupType : PrivilegeGroupType.values()) {
                PrivilegeGroup group = createPrivilegeGroupIfNotFound(groupType);

                for (PrivilegeType privilegeType : groupType.getPrivileges()) {
                    Privilege privilege = createPrivilegeIfNotFound(privilegeType, group);
                    privileges.add(privilege);
                }
            }

            // Create initial roles
            Map<UserRole, Role> roles = new HashMap<>();
            for (UserRole userRole : UserRole.values()) {

                List<Privilege> rolePrivileges = new ArrayList<>();

                for (Privilege privilege : privileges) {
                    if (userRole.getPrivileges().contains(privilege.getPrivilegeType()))
                        rolePrivileges.add(privilege);
                }

                Role role = createRoleIfNotFound(userRole, rolePrivileges);
                roles.put(userRole, role);
            }

            // Create initial user
            createUserIfNotFound("test@test.com",
                    "Test",
                    "Test",
                    List.of(roles.get(UserRole.ROLE_ADMIN)));
            createUserIfNotFound("guest@guest.com",
                    "Guest",
                    "Guest123",
                    List.of(roles.get(UserRole.ROLE_GUEST)));
        }

        alreadySetup = true;
    }

    @Transactional
    public Privilege createPrivilegeIfNotFound(PrivilegeType privilegeType, PrivilegeGroup group) {

        Privilege privilege = privilegeRepo.findByPrivilegeType(privilegeType).orElse(null);

        if (privilege == null) {

            privilege = new Privilege();
            privilege.setLabel(privilegeType.getLabel());
            privilege.setPrivilegeType(privilegeType);
            privilege.setGroup(group);
            privilegeRepo.save(privilege);
        }

        return privilege;
    }

    @Transactional
    public PrivilegeGroup createPrivilegeGroupIfNotFound(PrivilegeGroupType groupType) {

        PrivilegeGroup group = groupRepo.findByGroupName(groupType.getLabel()).orElse(null);

        if (group == null) {

            group = new PrivilegeGroup();
            group.setGroupName(groupType.getLabel());
            groupRepo.save(group);
        }

        return group;
    }

    @Transactional
    public Role createRoleIfNotFound(UserRole userRole, Collection<Privilege> privileges) {

        Role role = roleRepo.findByRoleName(userRole).orElse(null);
        if (role == null) {
            role = new Role();
            role.setLabel(userRole.getLabel());
            role.setRoleName(userRole);
        }

        role.setPrivileges(privileges);
        roleRepo.save(role);

        return role;
    }

    @Transactional
    public Account createUserIfNotFound(final String email,
            final String username,
            final String password,
            final Collection<Role> roles) {

        Account user = accountRepo.findByUsername(username).orElse(null);
        if (user == null) {

            user = new Account();
            user.setUsername(username);
            user.setEmail(email);
            user.setPass(passwordEncoder.encode(password));
            user.setActive(true);
            user.setRoles(roles);
            user = accountRepo.save(user);
        }

        return user;
    }
}
