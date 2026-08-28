package com.bookflow.employee.repository;

import com.bookflow.employee.entity.Employee;
import com.bookflow.employee.entity.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    boolean existsByCompanyIdAndDocumentNumber(
        Long companyId,
        String documentNumber
    );

    boolean existsByCompanyIdAndDocumentNumberAndIdNot(
        Long companyId,
        String documentNumber,
        Long id
    );

    Optional<Employee> findByCompanyIdAndDocumentNumber(
        Long companyId,
        String documentNumber
    );

    List<Employee> findAllByCompanyIdAndStatus(
        Long companyId,
        EmployeeStatus status
    );

    Optional<Employee> findByIdAndCompanyId(
        Long id,
        Long companyId
    );
}
