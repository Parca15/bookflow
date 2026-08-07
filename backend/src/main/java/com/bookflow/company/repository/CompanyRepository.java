package com.bookflow.company.repository;

import com.bookflow.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    boolean existsByDocumentNumber(String documentNumber);

}
