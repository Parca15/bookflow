package com.bookflow.auth.repository;

import com.bookflow.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    List<Role> findByCompanyIdIsNullAndIsSystemTrue();

    List<Role> findByCompanyId(Long companyId);

    List<Role> findByCompanyIdOrCompanyIdIsNull(Long companyId);

    Optional<Role> findByNameAndCompanyId(String name, Long companyId);

    boolean existsByNameAndCompanyId(String name, Long companyId);

    @Query("SELECT r FROM Role r WHERE r.level < :level AND (r.company IS NULL OR r.company.id = :companyId)")
    List<Role> findCreatableRoles(@Param("level") Integer level, @Param("companyId") Long companyId);
}
