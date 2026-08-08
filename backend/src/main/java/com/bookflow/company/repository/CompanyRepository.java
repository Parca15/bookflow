package com.bookflow.company.repository;

import com.bookflow.company.entity.Company;
import com.bookflow.company.entity.CompanyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    boolean existsByDocumentNumber(String documentNumber);

    List<Company> findAllByStatus(CompanyStatus status);

    boolean existsByDocumentNumberAndIdNot(String documentNumber, Long id);
}
