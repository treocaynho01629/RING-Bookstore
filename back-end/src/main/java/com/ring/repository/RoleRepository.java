package com.ring.repository;

import com.ring.model.entity.Role;
import com.ring.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface named {@link RoleRepository} for managing {@link Role} entities.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Byte> {

    /**
     * Finds a {@link Role} entity by its role name.
     *
     * @param userRole the role name of type {@link UserRole} to search for
     * @return an {@link Optional} containing the {@link Role} if found, or empty if not found
     */
    Optional<Role> findByRoleName(UserRole userRole);

    /**
     * Retrieves a {@link Role} entity along with its associated privileges based on the provided role name.
     *
     * @param userRole the role name of type {@link UserRole} to search for
     * @return an {@link Optional} containing the {@link Role} with its associated privileges if found, or empty if not found
     */
    @Query("""
        SELECT r AS role
        FROM Role r
        JOIN FETCH r.privileges p
        WHERE r.roleName = :userRole
    """)
    Optional<Role> findRoleWithPrivileges(UserRole userRole);

    /**
     * Retrieves a list of {@link Role} entities whose role names match the given collection of {@link UserRole}.
     *
     * @param roleNames a collection of {@link UserRole} representing the role names to search for
     * @return a list of {@link Role} entities that match the provided role names
     */
    List<Role> findAllByRoleNameIn(Collection<UserRole> roleNames);
}
