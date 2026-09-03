package com.bookflow.catalog.service;

import com.bookflow.catalog.dto.request.CreateCatalogRequest;
import com.bookflow.catalog.dto.request.UpdateCatalogRequest;
import com.bookflow.catalog.dto.response.CatalogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CatalogService {

    CatalogResponse create(Long companyId, CreateCatalogRequest request);
    CatalogResponse findById(Long companyId, Long id);
    List<CatalogResponse> findAllByCompany(Long companyId);
    Page<CatalogResponse> findAllByCompanyPaged(Long companyId, Pageable pageable);
    List<CatalogResponse> findAll();
    List<CatalogResponse> findAllIncludingInactive();
    CatalogResponse update(Long companyId, Long id, UpdateCatalogRequest request);
    void delete(Long companyId, Long id);
    void activate(Long companyId, Long id);
}
