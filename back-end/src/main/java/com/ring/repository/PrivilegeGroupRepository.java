package com.ring.repository;

import com.ring.model.entity.PrivilegeGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface named {@link PrivilegeGroupRepository} for managing {@link PrivilegeGroup} entities.
 */
@Repository
public interface PrivilegeGroupRepository extends JpaRepository<PrivilegeGroup, Integer> {

    /**
     * Retrieves an optional {@link PrivilegeGroup} entity based on the specified group name.
     *
     * @param name the name of the privilege group to find
     * @return an {@code Optional} containing the {@code PrivilegeGroup} if found, or an empty {@code Optional} if not found
     */
    Optional<PrivilegeGroup> findByGroupName(String name);

    /**
     * Retrieves all {@link PrivilegeGroup} entities along with their associated privileges.
     *
     * @return a list of {@link PrivilegeGroup} entities with their group privileges eagerly fetched
     */
    @Query("""
        SELECT pg 
        FROM PrivilegeGroup pg
        JOIN FETCH pg.groupPrivileges p
    """)
    List<PrivilegeGroup> findAllWithPrivileges();
}
