package com.bookflow.catalog.repository;

import com.bookflow.catalog.entity.Catalog;
import com.bookflow.catalog.entity.CatalogStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CatalogRepository extends JpaRepository<Catalog, Long> {

    boolean existsByCompanyIdAndName(
        Long companyId,
        String name
    );

    boolean existsByCompanyIdAndNameAndIdNot(
        Long companyId,
        String name,
        Long id
    );

    List<Catalog> findAllByCompanyIdAndStatus(
        Long companyId,
        CatalogStatus status
    );
}
